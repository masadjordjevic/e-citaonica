"use client"

import { LampDesk, BookOpen } from "lucide-react"
import { useStudy } from "@/components/study-provider"
import type { Member } from "@/lib/members"

export function StudyRoom() {
  const { members } = useStudy()
  const studyingCount = members.filter((m) => m.status === "Studying").length

  return (
    <section aria-labelledby="room-heading" className="mb-10">
      <div className="mb-5 flex flex-col gap-1">
        <h3
          id="room-heading"
          className="font-serif text-xl font-bold text-foreground"
        >
          Čitaonica
        </h3>
        <p className="text-sm text-muted-foreground">
          {studyingCount > 0
            ? `${studyingCount} ljudi trenutno uči`
            : "Niko još ne uči — pokreni tajmer da zasvetliš svoje mesto 💡"}
        </p>
      </div>

      {/* The room */}
      <div className="relative overflow-hidden rounded-4xl border border-border bg-secondary/40 p-5 shadow-inner sm:p-8">
        {/* Wall decorations */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-6 py-3 text-xl opacity-70">
          <span aria-hidden="true">🖼️</span>
          <span aria-hidden="true">🪟</span>
          <span aria-hidden="true">🕰️</span>
          <span aria-hidden="true">🪴</span>
        </div>

        <div className="relative mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
          {members.map((member) => (
            <DeskSpot key={member.id} member={member} />
          ))}
        </div>

        {/* Central study table */}
        <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-3xl border border-border bg-card px-6 py-5 shadow-sm">
          <span className="text-2xl" aria-hidden="true">
            ☕
          </span>
          <span className="text-2xl" aria-hidden="true">
             Sto za učenje
          </span>
          <p className="font-serif text-sm font-bold text-foreground">
            📚
          </p>
        </div>
      </div>
    </section>
  )
}

function DeskSpot({ member }: { member: Member }) {
  const isStudying = member.status === "Studying"
  const isOnBreak = member.status === "On Break"

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Study bubble above the head */}
      <div className="h-8">
        {isStudying && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground shadow-sm">
            <BookOpen className="size-3" />
            {member.subject ? `Studying ${member.subject}` : "Studying"}
          </span>
        )}
        {isOnBreak && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-secondary-foreground shadow-sm">
            Na pauzi ☕
          </span>
        )}
      </div>

      {/* Avatar seat */}
      <div className="relative">
        <div
          className={`flex size-16 items-center justify-center overflow-hidden rounded-full ring-4 ring-offset-2 ring-offset-secondary/40 transition sm:size-20 ${member.ringColor} ${
            isStudying
              ? "shadow-[0_0_28px_-4px_oklch(0.72_0.14_155)]"
              : "opacity-90"
          }`}
        >
          <img
            src={member.avatar || "/placeholder.svg"}
            alt={`${member.name}`}
            className="size-full object-cover"
          />
        </div>

        {/* Green studying indicator dot */}
        {isStudying && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[oklch(0.72_0.14_155)] opacity-70" />
            <span className="relative inline-flex size-4 rounded-full border-2 border-card bg-[oklch(0.62_0.16_155)]" />
          </span>
        )}

        {/* Little desk lamp when studying */}
        {isStudying && (
          <span className="absolute -bottom-1 -left-2 flex size-7 items-center justify-center rounded-full bg-card text-accent-foreground shadow-sm">
            <LampDesk className="size-4" />
          </span>
        )}
      </div>

      {/* Name + desk */}
      <div className="flex items-center gap-1">
        <p className="font-serif text-sm font-bold text-foreground">
          {member.name}
        </p>
        {member.isCurrentUser && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
            You
          </span>
        )}
      </div>
      <span className="text-xl" aria-hidden="true">
        {isStudying ? "💻" : "🪑"}
      </span>
    </div>
  )
}
