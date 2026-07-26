"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, RotateCcw, Flag, Coins } from "lucide-react"
import { useStudy } from "@/components/study-provider"
import { COINS_PER_MINUTE } from "@/lib/members"

type TimerState = "idle" | "running" | "paused"

function formatTime(totalSeconds: number) {
  const seconds = Math.floor(totalSeconds)
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0")
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

export function StudyTimer() {
  const { currentUser, startStudying, pauseStudying, finishStudying } = useStudy()
  const [subject, setSubject] = useState("")
  const [state, setState] = useState<TimerState>("idle")
  const [elapsedMs, setElapsedMs] = useState(0)
  const [lastReward, setLastReward] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const baseRef = useRef(0)
  const startAtRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const restoredKeyRef = useRef<string | null>(null)

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const beginTick = () => {
    startAtRef.current = Date.now()
    clearTick()
    intervalRef.current = setInterval(() => {
      setElapsedMs(baseRef.current + (Date.now() - startAtRef.current))
    }, 200)
  }

  useEffect(() => clearTick, [])

  useEffect(() => {
    if (!currentUser) return

    const restoreKey = [
      currentUser.status,
      currentUser.subject ?? "",
      currentUser.sessionStartedAt ?? "",
      currentUser.accumulatedSeconds ?? 0,
    ].join("|")

    if (restoredKeyRef.current === restoreKey) return
    restoredKeyRef.current = restoreKey
    clearTick()

    const accumulatedMs = (currentUser.accumulatedSeconds ?? 0) * 1000

    if (currentUser.status === "Studying") {
      const startedAtMs = currentUser.sessionStartedAt
        ? new Date(currentUser.sessionStartedAt).getTime()
        : Date.now()
      const activeMs = Number.isFinite(startedAtMs)
        ? Math.max(0, Date.now() - startedAtMs)
        : 0

      baseRef.current = accumulatedMs + activeMs
      setElapsedMs(baseRef.current)
      setSubject(currentUser.subject ?? "")
      setState("running")
      beginTick()
      return
    }

    if (currentUser.status === "On Break") {
      baseRef.current = accumulatedMs
      setElapsedMs(accumulatedMs)
      setSubject(currentUser.subject ?? "")
      setState("paused")
      return
    }

    baseRef.current = 0
    setElapsedMs(0)
    setSubject("")
    setState("idle")
  }, [currentUser])

  const handleStart = async () => {
    if (!subject.trim() || saving) return
    setSaving(true)
    try {
      await startStudying(subject.trim())
      setLastReward(null)
    } finally {
      setSaving(false)
    }
  }

  const handlePause = async () => {
    if (saving) return
    setSaving(true)
    try {
      await pauseStudying(subject)
    } finally {
      setSaving(false)
    }
  }

  const handleResume = async () => {
    if (saving) return
    setSaving(true)
    try {
      await startStudying(subject)
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = async () => {
    if (saving) return
    setSaving(true)
    try {
      const earned = await finishStudying(elapsedMs / 1000)
      setLastReward(earned)
      restoredKeyRef.current = null
    } finally {
      setSaving(false)
    }
  }

  const elapsedSeconds = elapsedMs / 1000
  const isActive = state === "running"
  const projectedCoins = Math.round((elapsedSeconds / 60) * COINS_PER_MINUTE)

  return (
    <section aria-labelledby="timer-heading" className="mb-10 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-secondary/40 px-6 py-4">
        <h3 id="timer-heading" className="font-serif text-xl font-bold text-foreground">
          Tajmer za učenje
        </h3>
        <p className="text-sm text-muted-foreground">
          Dobijaš {COINS_PER_MINUTE} novčić za svaki aktivni minut učenja.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 p-6 md:p-8">
        <div className="w-full max-w-md">
          <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-foreground">
            Predmet
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            disabled={state !== "idle" || saving}
            placeholder="npr. Projektovanje softvera"
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className={`flex w-full max-w-md flex-col items-center gap-2 rounded-3xl border px-6 py-8 transition-colors ${
          isActive
            ? "border-accent bg-accent/30 shadow-[0_0_40px_-10px_oklch(0.8_0.09_155)]"
            : state === "paused"
              ? "border-secondary bg-secondary/30"
              : "border-border bg-muted/40"
        }`}>
          <span className={`font-serif text-5xl font-bold tabular-nums tracking-tight text-foreground md:text-6xl ${isActive ? "animate-pulse" : ""}`}>
            {formatTime(elapsedSeconds)}
          </span>

          {state !== "idle" && (
            <p className="text-sm text-muted-foreground">
              {isActive ? "Učiš" : "Na pauzi"}
              {subject ? ` · ${subject}` : ""} · {projectedCoins} novčića
            </p>
          )}

          {state === "idle" && lastReward !== null && (
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-foreground">
              <Coins className="size-4" />
              Dodala si {lastReward.toLocaleString()} novčića u zajedničku kasu.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {state === "idle" && (
            <button type="button" onClick={handleStart} disabled={!subject.trim() || saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              <Play className="size-5" fill="currentColor" />
              {saving ? "Čuvanje..." : "Počni"}
            </button>
          )}

          {state === "running" && (
            <button type="button" onClick={handlePause} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-6 py-3 font-semibold text-secondary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50">
              <Pause className="size-5" fill="currentColor" />
              {saving ? "Čuvanje..." : "Pauziraj"}
            </button>
          )}

          {state === "paused" && (
            <button type="button" onClick={handleResume} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50">
              <RotateCcw className="size-5" />
              {saving ? "Čuvanje..." : "Nastavi"}
            </button>
          )}

          {state !== "idle" && (
            <button type="button" onClick={handleFinish} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-sm transition hover:bg-muted disabled:opacity-50">
              <Flag className="size-5" />
              {saving ? "Završavanje..." : "Završi učenje"}
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Učiš kao <span className="font-semibold text-foreground">{currentUser?.name}</span>
        </p>
      </div>
    </section>
  )
}
