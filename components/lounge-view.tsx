"use client"

import { Users, Clock, PiggyBank } from "lucide-react"
import { useStudy } from "@/components/study-provider"
import { MemberCard } from "@/components/member-card"
import { StudyTimer } from "@/components/study-timer"
import { StudyRoom } from "@/components/study-room"
import { Garden } from "@/components/garden"
import { MemoriesGallery } from "@/components/memories-gallery"
import { Cafe } from "@/components/cafe"
import { Chat } from "@/components/chat"
import { Quests } from "@/components/quests"
import { Notebook } from "@/components/notebook"
import { Dashboard } from "@/components/dashboard"

export function LoungeView() {
  const { members, groupBank, activeTab } = useStudy()

  const studyingCount = members.filter((m) => m.status === "Studying").length
  const groupTotal = members.reduce((sum, m) => sum + m.hoursThisWeek, 0)

  // Standalone pages (full-page views)
  if (activeTab === "Digital diary") {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <MemoriesGallery />
      </main>
    )
  }

  if (activeTab === "Kafeterija kod Jove") {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <Cafe />
      </main>
    )
  }

  if (activeTab === "Dnevni Zadaci") {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <Quests />
      </main>
    )
  }

  if (activeTab === "Zajednički notebook") {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-10 h-screen">
        <Notebook />
      </main>
    )
  }

  if (activeTab === "Chat") {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-10 h-screen">
        <Chat />
      </main>
    )
  }

  if (activeTab === "Pregled") {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <Dashboard />
      </main>
    )
  }

  // Default view (Čitaonica tab)
  const showRoom = activeTab === "Čitaonica"
  const showTimer = activeTab === "Čitaonica" || activeTab === "Učenje"
  const showGarden = activeTab === "Naša bašta"

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10">
      {/* Header + prominent shared bank */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-balance text-foreground md:text-4xl">
            {activeTab === "Naša bašta"
              ? "Naša bašta"
              : activeTab === "Učenje"
                ? "Učenje"
                : ""}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Zajednički prostor za učenje, druženje i deljenje uspomena.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-accent bg-accent/30 px-6 py-4 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <PiggyBank className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Zajednička kasa
            </p>
            <p className="font-serif text-2xl font-bold text-foreground">
              {groupBank.toLocaleString()}{" "}
              <span className="text-base font-semibold text-muted-foreground">
                Coins 🪙
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Visual study room (Čitaonica) */}
      {showRoom && <StudyRoom />}

      {/* Study timer (Čitaonica / Učenje) */}
      {showTimer && <StudyTimer />}

      {/* Shared garden (Naša bašta) */}
      {showGarden && (
        <div className="mb-10">
          <Garden />
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Users className="size-6" />
          </div>
          <div>
            <p className="font-serif text-2xl font-bold text-foreground">
              {studyingCount}
            </p>
            <p className="text-sm text-muted-foreground">Studying now</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="font-serif text-2xl font-bold text-foreground">
              {groupTotal.toFixed(1)}h
            </p>
            <p className="text-sm text-muted-foreground">
              Group total this week
            </p>
          </div>
        </div>
      </div>

      {/* Group presence */}
      <section aria-labelledby="presence-heading">
        <h3
          id="presence-heading"
          className="mb-5 font-serif text-xl font-bold text-foreground"
        >
          Group Presence
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>
    </main>
  )
}
