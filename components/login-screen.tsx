"use client"

import { useState } from "react"
import { Heart, Mail, Lock, LogIn } from "lucide-react"
import { useStudy } from "@/components/study-provider"
import { members } from "@/lib/members"

export function LoginScreen() {
  const { login } = useStudy()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Find the member by name and use their actual email
    const member = members.find(
      (m) => m.name.toLowerCase() === username.toLowerCase(),
    )
    if (!member) {
      setError("User not found.")
      return
    }
    setSubmitting(true)
    const result = await login(member.email, password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? "Login failed.")
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-sidebar p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-4xl border border-border bg-card shadow-xl md:grid-cols-2">
        {/* Welcome panel */}
        <div className="flex flex-col justify-center gap-6 bg-primary p-8 text-primary-foreground md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/20">
              <Heart className="size-6" fill="currentColor" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold leading-tight">
                Mašin harem
              </h1>
            </div>
          </div>
          <p className="text-pretty text-primary-foreground/90 leading-relaxed">
            Welcome back! Log in to study with us
          </p>
          <div className="mt-2 flex -space-x-3">
            {members.map((m) => (
              <img
                key={m.id}
                src={m.avatar || "/placeholder.svg"}
                alt={m.name}
                className="size-10 rounded-full border-2 border-primary object-cover"
              />
            ))}
          </div>
        </div>

        {/* Form panel */}
        <div className="p-8 md:p-10">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Log In
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your name and password
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                Username
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError(null)
                  }}
                  placeholder="npr. Maša"
                  className="w-full rounded-2xl border border-input bg-background py-3 pl-10 pr-4 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="••••••"
                  className="w-full rounded-2xl border border-input bg-background py-3 pl-10 pr-4 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-2xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <LogIn className="size-5" />
              {submitting ? "Prijavljivanje..." : "Log In"}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
