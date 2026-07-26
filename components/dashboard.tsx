"use client"

import {
  BarChart3,
  Bell,
  Loader2,
  Trophy,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type DashboardData = {
  leaderboard: Array<{
    name: string
    hours: number
  }>
  stats: {
    groupMinutes: number
    daily: Array<{
      date: string
      minutes: number
    }>
    subjects: Array<{
      subject: string
      minutes: number
    }>
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    unlocked: boolean
  }>
  notifications: Array<{
    id: string
    title: string
    body: string
    kind: string
    read_at: string | null
    created_at: string
  }>
}

function notificationIcon(kind: string) {
  switch (kind) {
    case "chat":
      return "💬"
    case "garden":
      return "🌱"
    case "cafe":
      return "☕"
    case "memory":
      return "📸"
    case "notebook":
      return "📖"
    case "quest":
      return "🏆"
    default:
      return "🔔"
  }
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboard = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      })
      const payload = await response.json()

      if (!response.ok) {
        setError(payload?.error ?? "Pregled nije dostupan.")
        return
      }

      setData(payload)
      setError("")
    } catch {
      setError("Backend za pregled nije dostupan.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Kada se u tabelu notifications doda novi red,
  // pregled se automatski osvežava bez ručnog refresh-a.
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("dashboard-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadDashboard()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadDashboard])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Učitavanje pregleda...
      </div>
    )
  }

  if (!data) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error || "Pregled nije dostupan."}
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-serif text-3xl font-bold">
          Pregled grupe
        </h2>
        <p className="text-muted-foreground">
          Rang-lista, statistika, dostignuća i obaveštenja.
        </p>
      </header>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-xl font-bold">
          <Trophy />
          Nedeljna rang-lista
        </h3>

        <div className="space-y-2">
          {data.leaderboard.map((item, index) => (
            <div
              key={item.name}
              className="flex justify-between rounded-2xl border p-4"
            >
              <span>
                {index < 3
                  ? ["🥇", "🥈", "🥉"][index]
                  : "•"}{" "}
                {item.name}
              </span>
              <b>{item.hours.toFixed(1)} h</b>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-xl font-bold">
          <BarChart3 />
          Statistika poslednjih 7 dana
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-muted-foreground">
              Grupno vreme
            </p>
            <p className="text-3xl font-black">
              {Math.round(data.stats.groupMinutes / 60)} h
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-sm text-muted-foreground">
              Aktivni dani
            </p>
            <p className="text-3xl font-black">
              {data.stats.daily.length}
            </p>
          </div>
        </div>
      </section>

      

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-xl font-bold">
          <Bell />
          Obaveštenja
        </h3>

        <div className="space-y-3">
          {data.notifications.length > 0 ? (
            data.notifications.map((notification) => (
              <article
                key={notification.id}
                className="flex gap-3 rounded-2xl border bg-card p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl">
                  {notificationIcon(notification.kind)}
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {notification.body}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {new Date(
                      notification.created_at,
                    ).toLocaleString("sr-RS")}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <p className="text-muted-foreground">
              Nema novih obaveštenja.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
