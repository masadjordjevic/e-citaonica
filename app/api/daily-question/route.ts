import { createClient } from "@/lib/supabase/server"

type QuestionRow = {
  id: string
  question: string
  question_type: "text" | "multiple_choice"
  options: string[] | null
  reward: number | string
  question_date: string
  attempts_used: number | string
  max_attempts: number | string
  answered_correctly: boolean
  correct_respondents: number | string
}

type AnswerRow = {
  correct: boolean
  already_rewarded: boolean
  reward_earned: number | string
  attempts_used: number | string
  attempts_remaining: number | string
  message: string
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Nisi prijavljena." }, { status: 401 })
    }

    const { data, error } = await supabase.rpc("get_today_daily_question")

    if (error) {
      console.error("DAILY QUESTION GET ERROR:", error)
      return Response.json(
        { error: "Pitanje dana trenutno nije dostupno." },
        { status: 500 },
      )
    }

    const row = (Array.isArray(data) ? data[0] : data) as QuestionRow | null

    if (!row) {
      return Response.json({ question: null })
    }

    return Response.json({
      question: {
        id: row.id,
        question: row.question,
        type: row.question_type,
        options: Array.isArray(row.options) ? row.options : [],
        reward: Number(row.reward) || 0,
        questionDate: row.question_date,
        attemptsUsed: Number(row.attempts_used) || 0,
        maxAttempts: Number(row.max_attempts) || 1,
        answeredCorrectly: Boolean(row.answered_correctly),
        correctRespondents: Number(row.correct_respondents) || 0,
      },
    })
  } catch (error) {
    console.error("DAILY QUESTION GET UNEXPECTED ERROR:", error)
    return Response.json({ error: "Greška na serveru." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const answer = typeof body?.answer === "string" ? body.answer.trim() : ""

    if (!answer) {
      return Response.json({ error: "Unesi odgovor." }, { status: 400 })
    }

    if (answer.length > 200) {
      return Response.json(
        { error: "Odgovor može imati najviše 200 znakova." },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Nisi prijavljena." }, { status: 401 })
    }

    const { data, error } = await supabase.rpc("submit_daily_question_answer", {
      submitted_answer: answer,
    })

    if (error) {
      console.error("DAILY QUESTION POST ERROR:", error)
      return Response.json(
        { error: error.message || "Odgovor nije sačuvan." },
        { status: 400 },
      )
    }

    const row = (Array.isArray(data) ? data[0] : data) as AnswerRow | null

    if (!row) {
      return Response.json({ error: "Odgovor nije obrađen." }, { status: 500 })
    }

    return Response.json({
      ok: true,
      result: {
        correct: Boolean(row.correct),
        alreadyRewarded: Boolean(row.already_rewarded),
        rewardEarned: Number(row.reward_earned) || 0,
        attemptsUsed: Number(row.attempts_used) || 0,
        attemptsRemaining: Number(row.attempts_remaining) || 0,
        message: row.message,
      },
    })
  } catch (error) {
    console.error("DAILY QUESTION POST UNEXPECTED ERROR:", error)
    return Response.json({ error: "Greška na serveru." }, { status: 500 })
  }
}
