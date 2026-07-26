import { createClient } from "@/lib/supabase/server"
import { COINS_PER_MINUTE, findAccountByEmail, type MemberStatus } from "@/lib/members"

type PresenceAction = "start" | "pause" | "finish"

function isPresenceAction(value: unknown): value is PresenceAction {
  return value === "start" || value === "pause" || value === "finish"
}

function normalizeStatus(value: unknown): MemberStatus {
  return value === "Studying" || value === "On Break" ? value : "Idle"
}

function secondsSince(value: unknown): number {
  if (typeof value !== "string") return 0
  const startedAt = new Date(value).getTime()
  if (!Number.isFinite(startedAt)) return 0
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: "Nisi prijavljena." }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("member_presence")
      .select("user_id, member_name, status, subject, session_started_at, accumulated_seconds, hours_this_week, updated_at")
      .order("member_name", { ascending: true })

    if (error) {
      console.error("PRESENCE GET ERROR:", error)
      return Response.json({ error: "Statusi članova trenutno nisu dostupni." }, { status: 500 })
    }

    return Response.json({
      presence: (data ?? []).map((row) => ({
        userId: row.user_id,
        memberName: row.member_name,
        status: normalizeStatus(row.status),
        subject: typeof row.subject === "string" && row.subject.trim() ? row.subject : null,
        sessionStartedAt: typeof row.session_started_at === "string" ? row.session_started_at : null,
        accumulatedSeconds: typeof row.accumulated_seconds === "number" ? row.accumulated_seconds : 0,
        hoursThisWeek: typeof row.hours_this_week === "number" ? row.hours_this_week : 0,
        updatedAt: row.updated_at,
      })),
    })
  } catch (error) {
    console.error("PRESENCE GET UNEXPECTED ERROR:", error)
    return Response.json({ error: "Greška na serveru." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const action = body?.action

    if (!isPresenceAction(action)) {
      return Response.json({ error: "Nepoznata akcija." }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
      return Response.json({ error: "Nisi prijavljena." }, { status: 401 })
    }

    const member = findAccountByEmail(user.email)
    if (!member) {
      return Response.json({ error: "Ovaj nalog nije član grupe." }, { status: 403 })
    }

    const subject = typeof body?.subject === "string" ? body.subject.trim() : ""

    const { data: existing, error: readError } = await supabase
      .from("member_presence")
      .select("status, subject, session_started_at, accumulated_seconds, hours_this_week")
      .eq("user_id", user.id)
      .maybeSingle()

    if (readError) {
      console.error("PRESENCE READ ERROR:", readError)
      return Response.json({ error: "Trenutni status nije pročitan." }, { status: 500 })
    }

    const currentStatus = normalizeStatus(existing?.status)
    const currentHours = typeof existing?.hours_this_week === "number" ? existing.hours_this_week : 0
    const currentAccumulated = typeof existing?.accumulated_seconds === "number" ? existing.accumulated_seconds : 0
    const currentSubject = typeof existing?.subject === "string" ? existing.subject : ""

    if (action === "start") {
      const finalSubject = subject || currentSubject
      if (!finalSubject) {
        return Response.json({ error: "Unesi naziv predmeta." }, { status: 400 })
      }

      const accumulatedSeconds = currentStatus === "On Break" || currentStatus === "Studying" ? currentAccumulated : 0
      const sessionStartedAt =
        currentStatus === "Studying" && existing?.session_started_at
          ? existing.session_started_at
          : new Date().toISOString()

      const { data, error } = await supabase
        .from("member_presence")
        .upsert({
          user_id: user.id,
          member_name: member.name,
          status: "Studying",
          subject: finalSubject,
          session_started_at: sessionStartedAt,
          accumulated_seconds: accumulatedSeconds,
          hours_this_week: currentHours,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        .select("user_id, member_name, status, subject, session_started_at, accumulated_seconds, hours_this_week")
        .single()

      if (error) {
        console.error("PRESENCE START ERROR:", error)
        return Response.json({ error: "Sesija učenja nije pokrenuta." }, { status: 500 })
      }

      return Response.json({ ok: true, presence: data })
    }

    if (action === "pause") {
      const activeSeconds = currentStatus === "Studying" ? secondsSince(existing?.session_started_at) : 0
      const totalAccumulated = currentAccumulated + activeSeconds

      const { data, error } = await supabase
        .from("member_presence")
        .upsert({
          user_id: user.id,
          member_name: member.name,
          status: "On Break",
          subject: subject || currentSubject || null,
          session_started_at: null,
          accumulated_seconds: totalAccumulated,
          hours_this_week: currentHours,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        .select("user_id, member_name, status, subject, session_started_at, accumulated_seconds, hours_this_week")
        .single()

      if (error) {
        console.error("PRESENCE PAUSE ERROR:", error)
        return Response.json({ error: "Pauza nije sačuvana." }, { status: 500 })
      }

      return Response.json({ ok: true, presence: data })
    }

    const activeSeconds = currentStatus === "Studying" ? secondsSince(existing?.session_started_at) : 0
    const totalSeconds = currentAccumulated + activeSeconds
    const updatedHours = currentHours + totalSeconds / 3600
    const earned = Math.round((totalSeconds / 60) * COINS_PER_MINUTE)

    const { data, error } = await supabase
      .from("member_presence")
      .upsert({
        user_id: user.id,
        member_name: member.name,
        status: "Idle",
        subject: null,
        session_started_at: null,
        accumulated_seconds: 0,
        hours_this_week: updatedHours,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select("user_id, member_name, status, subject, session_started_at, accumulated_seconds, hours_this_week")
      .single()

    if (error) {
      console.error("PRESENCE FINISH ERROR:", error)
      return Response.json(
        { error: "Sesija učenja nije završena." },
        { status: 500 },
      )
    }

    if (totalSeconds > 0) {
      const { error: sessionError } = await supabase.from("study_sessions").insert({
        user_id: user.id,
        member_name: member.name,
        subject: currentSubject || null,
        duration_seconds: totalSeconds,
        earned_coins: earned,
      })
      if (sessionError) {
        console.error("STUDY SESSION HISTORY ERROR:", sessionError)
      }
    }

    const { data: walletBalance, error: walletError } =
      await supabase.rpc("add_group_coins", {
        p_amount: earned,
      })

    if (walletError) {
      console.error(
        "PRESENCE WALLET ERROR:",
        walletError,
      )

      return Response.json(
        {
          error:
            "Učenje je završeno, ali novčići nisu dodati u kasu.",
        },
        { status: 500 },
      )
    }

    return Response.json({
      ok: true,
      earned,
      totalSeconds,
      walletBalance: Number(walletBalance) || 0,
      presence: data,
    })
  } catch (error) {
    console.error("PRESENCE POST UNEXPECTED ERROR:", error)
    return Response.json({ error: "Greška na serveru." }, { status: 500 })
  }
}
