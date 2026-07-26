"use client"

import type { ReactNode } from "react"
import { useStudy } from "@/components/study-provider"
import { LoginScreen } from "@/components/login-screen"

export function AuthGate({ children }: { children: ReactNode }) {
  const { currentUser, authLoading } = useStudy()

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-sidebar text-sm text-muted-foreground">
        Proveravam sesiju...
      </div>
    )
  }

  if (!currentUser) return <LoginScreen />
  return <>{children}</>
}
