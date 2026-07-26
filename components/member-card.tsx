import type { Member } from "@/lib/members"

export function MemberCard({ member }: { member: Member }) {
  const isStudying = member.status === "Studying"
  const isOnBreak = member.status === "On Break"

  // Full status label, e.g. "Studying Baze Podataka"
  const statusLabel =
    isStudying && member.subject
      ? `Studying ${member.subject}`
      : member.status

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-3xl border bg-card p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 ${
        isStudying
          ? "border-accent shadow-[0_0_35px_-12px_oklch(0.8_0.09_155)]"
          : "border-border"
      }`}
    >
      <div className="relative">
        <div
          className={`flex size-24 items-center justify-center overflow-hidden rounded-full ring-4 ring-offset-4 ring-offset-card transition ${member.ringColor} ${
            isStudying ? "animate-pulse" : ""
          } ${member.isWeeklyTop ? "shadow-[0_0_25px_-5px_#FFD700]" : ""}`}
        >
          {/* REPLACE_AVATAR_IMAGE */}
          <img
            src={member.avatar || "/placeholder.svg"}
            alt={`${member.name}'s profile`}
            className="size-full object-cover"
          />
        </div>

        {/* Status dot on the avatar */}
        <span
          className={`absolute bottom-1 right-1 size-5 rounded-full border-4 border-card ${
            isStudying
              ? "bg-accent-foreground"
              : isOnBreak
                ? "bg-secondary-foreground"
                : "bg-muted-foreground/60"
          }`}
          aria-hidden="true"
        />

        {/* Weekly top crown badge */}
        {member.isWeeklyTop && (
          <div className="absolute -top-2 -right-2 text-2xl animate-bounce" title="Štreberka nedelje">
            👑
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <h3 className="font-serif text-lg font-bold text-foreground">
          {member.name}
        </h3>
        {member.isCurrentUser && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            You
          </span>
        )}
      </div>

      <span
        className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          isStudying
            ? "bg-accent text-accent-foreground"
            : isOnBreak
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground"
        }`}
      >
        <span
          className={`size-2 shrink-0 rounded-full ${
            isStudying
              ? "bg-accent-foreground animate-pulse"
              : isOnBreak
                ? "bg-secondary-foreground"
                : "bg-muted-foreground/60"
          }`}
          aria-hidden="true"
        />
        <span className="truncate">{statusLabel}</span>
      </span>

      <p className="text-sm text-muted-foreground">
        {member.hoursThisWeek.toFixed(1)}h this week
      </p>
    </div>
  )
}
