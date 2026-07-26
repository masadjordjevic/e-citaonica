"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { Check, Loader2, Send, Sparkles } from "lucide-react"
import { useStudy } from "@/components/study-provider"
import type { DailyAnswerResult, DailyQuestion } from "@/lib/daily-question"

export function Quests() {
  const { groupBank } = useStudy()
  const [dailyQuests, setDailyQuests] = useState<any[]>([])
  const [questBonus, setQuestBonus] = useState<any>(null)
  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestion | null>(null)
  const [answer, setAnswer] = useState("")
  const [loadingQuestion, setLoadingQuestion] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questionError, setQuestionError] = useState("")
  const [answerResult, setAnswerResult] = useState<DailyAnswerResult | null>(null)

  const completedCount = dailyQuests.filter((quest) => quest.completed).length
  const earnedQuestCoins = dailyQuests.reduce(
    (sum, quest) => sum + (quest.completed ? quest.coinReward : 0),
    0,
  )

  const loadDailyQuestion = useCallback(async () => {
    try {
      setQuestionError("")
      const response = await fetch("/api/daily-question", { cache: "no-store" })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setQuestionError(payload?.error ?? "Pitanje dana nije dostupno.")
        return
      }

      setDailyQuestion(payload?.question ?? null)
    } catch {
      setQuestionError("Backend za pitanje dana nije dostupan.")
    } finally {
      setLoadingQuestion(false)
    }
  }, [])

  const loadDailyQuests = useCallback(async () => {
    try {
      const response = await fetch("/api/daily-quests", { cache: "no-store" })
      const payload = await response.json().catch(() => null)
      if (response.ok) {
        setDailyQuests(Array.isArray(payload?.quests) ? payload.quests : [])
        setQuestBonus(payload?.bonus ?? null)
      }
    } catch {
      // Realtime/povremeno osvežavanje nije kritično za prikaz pitanja.
    }
  }, [])

  useEffect(() => {
    loadDailyQuestion()
    loadDailyQuests()
    const id = window.setInterval(loadDailyQuests, 5000)
    return () => window.clearInterval(id)
  }, [loadDailyQuestion, loadDailyQuests])

  const attemptsRemaining = useMemo(() => {
    if (!dailyQuestion) return 0
    return Math.max(0, dailyQuestion.maxAttempts - dailyQuestion.attemptsUsed)
  }, [dailyQuestion])

  const canAnswer = Boolean(
    dailyQuestion &&
      !dailyQuestion.answeredCorrectly &&
      attemptsRemaining > 0 &&
      !submitting,
  )

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedAnswer = answer.trim()

    if (!trimmedAnswer || !canAnswer) return

    setSubmitting(true)
    setQuestionError("")
    setAnswerResult(null)

    try {
      const response = await fetch("/api/daily-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: trimmedAnswer }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setQuestionError(payload?.error ?? "Odgovor nije sačuvan.")
        return
      }

      const result = payload.result as DailyAnswerResult
      setAnswerResult(result)
      setAnswer("")
      await loadDailyQuestion()
    } catch {
      setQuestionError("Backend za slanje odgovora nije dostupan.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 font-serif text-2xl font-bold text-foreground">
          Dnevni zadaci 
        </h3>
        <p className="text-sm text-muted-foreground">
          Završi zadatke i osvoji dodatne novčiće.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="border-b border-amber-200/70 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
                <Sparkles className="size-4" /> PITANJE DANA
              </div>
              <h4 className="font-serif text-xl font-bold text-foreground">
                {loadingQuestion
                  ? "Učitavanje pitanja..."
                  : dailyQuestion?.question ?? "Za danas još nema pitanja."}
              </h4>
            </div>

            {dailyQuestion && (
              <div className="rounded-2xl bg-white/80 px-4 py-2 text-right shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground">NAGRADA</p>
                <p className="text-lg font-black text-amber-700">
                  +{dailyQuestion.reward} 🪙
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {loadingQuestion && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Učitavanje...
            </div>
          )}

          {!loadingQuestion && dailyQuestion && (
            <>
              {dailyQuestion.answeredCorrectly ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
                  <p className="font-bold">✓ Tačno odgovoreno</p>
                  <p className="mt-1 text-sm">
                    Nagrada za današnje pitanje je već dodata u zajedničku kasu.
                  </p>
                </div>
              ) : attemptsRemaining === 0 ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                  <p className="font-bold">Nema više pokušaja za danas.</p>
                  <p className="mt-1 text-sm">Novo pitanje stiže sutra.</p>
                </div>
              ) : (
                <form onSubmit={submitAnswer} className="space-y-4">
                  {dailyQuestion.type === "multiple_choice" &&
                  dailyQuestion.options.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {dailyQuestion.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setAnswer(option)}
                          className={`rounded-2xl border-2 p-3 text-left text-sm font-semibold transition-all ${
                            answer === option
                              ? "border-amber-500 bg-amber-100"
                              : "border-white bg-white/80 hover:border-amber-300"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      maxLength={200}
                      placeholder="Unesi odgovor..."
                      className="w-full rounded-2xl border-2 border-white bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                    />
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-amber-800">
                      Preostalo pokušaja: <strong>{attemptsRemaining}</strong>
                    </p>
                    <button
                      type="submit"
                      disabled={!answer.trim() || !canAnswer}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      Pošalji odgovor
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>Tačno odgovorilo: {dailyQuestion.correctRespondents}</span>
                <span>•</span>
                <span>Najviše {dailyQuestion.maxAttempts} pokušaja dnevno</span>
              </div>
            </>
          )}

          {answerResult && (
            <div
              className={`mt-4 rounded-2xl border p-4 text-sm font-semibold ${
                answerResult.correct
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {answerResult.message}
            </div>
          )}

          {questionError && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {questionError}
            </div>
          )}
        </div>
      </section>

      <div className="rounded-3xl border border-accent/20 bg-accent/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">NAPREDAK DANA</p>
            <p className="text-2xl font-bold text-foreground">
              {completedCount}/{dailyQuests.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-accent">OSVOJENO</p>
            <p className="text-2xl font-bold text-accent">{earnedQuestCoins} 🪙</p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-accent/20">
          <div
            className="h-full bg-accent transition-all"
            style={{
              width: `${dailyQuests.length ? (completedCount / dailyQuests.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {dailyQuests.map((quest) => (
          <div
            key={quest.id}
            className={`rounded-2xl border-2 p-4 transition-all ${
              quest.completed
                ? "border-green-200 bg-green-50/50"
                : "border-border bg-card hover:border-accent hover:shadow-sm"
            }`}
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{quest.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{quest.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {quest.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 text-sm font-bold text-accent">
                  <span>+{quest.coinReward}</span><span>🪙</span>
                </div>
                {!quest.completed ? (
                  <button
                    disabled
                    className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground transition hover:bg-accent/90"
                  >
                    Označi
                  </button>
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-xl bg-green-200 text-green-700">
                    <Check className="size-5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
