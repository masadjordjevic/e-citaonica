import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json(
      { error: "Nisi prijavljena." },
      { status: 401 },
    )
  }

  const week = new Date()
  week.setDate(week.getDate() - 7)

  const [
    { data: sessions, error: sessionsError },
    { data: presence, error: presenceError },
    { data: achievements, error: achievementsError },
    { data: unlocked, error: unlockedError },
    { data: notifications, error: notificationsError },
  ] = await Promise.all([
    supabase
      .from("study_sessions")
      .select(
        "user_id,member_name,subject,duration_seconds,finished_at",
      )
      .gte("finished_at", week.toISOString())
      .order("finished_at"),
    supabase
      .from("member_presence")
      .select("user_id,member_name,hours_this_week"),
    supabase
      .from("achievements")
      .select(
        "id,title,description,icon,reward,metric,target",
      ),
    supabase
      .from("user_achievements")
      .select("achievement_id,user_id,unlocked_at"),
    supabase
      .from("notifications")
      .select(
        "id,title,body,kind,read_at,created_at",
      )
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(30),
  ])

  const firstError =
    sessionsError ??
    presenceError ??
    achievementsError ??
    unlockedError ??
    notificationsError

  if (firstError) {
    console.error("DASHBOARD GET ERROR:", firstError)

    return Response.json(
      { error: "Podaci pregleda nisu učitani." },
      { status: 500 },
    )
  }

  const daily = new Map<string, number>()
  const subjects = new Map<string, number>()
  let total = 0

  for (const session of sessions ?? []) {
    const minutes = Math.round(
      Number(session.duration_seconds ?? 0) / 60,
    )

    total += minutes

    const date = session.finished_at.slice(0, 10)
    daily.set(date, (daily.get(date) ?? 0) + minutes)

    if (session.user_id === user.id) {
      const subject = session.subject || "Ostalo"
      subjects.set(
        subject,
        (subjects.get(subject) ?? 0) + minutes,
      )
    }
  }

  const leaderboard = (presence ?? [])
    .map((row) => ({
      name: row.member_name,
      hours: Number(row.hours_this_week) || 0,
    }))
    .sort((first, second) => second.hours - first.hours)

  return Response.json({
    leaderboard,
    stats: {
      groupMinutes: total,
      daily: [...daily].map(([date, minutes]) => ({
        date,
        minutes,
      })),
      subjects: [...subjects].map(
        ([subject, minutes]) => ({
          subject,
          minutes,
        }),
      ),
    },
    achievements: (achievements ?? []).map(
      (achievement) => ({
        ...achievement,
        unlocked: (unlocked ?? []).some(
          (entry) =>
            entry.user_id === user.id &&
            entry.achievement_id === achievement.id,
        ),
      }),
    ),
    notifications: notifications ?? [],
  })
}
