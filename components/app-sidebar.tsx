"use client"

import { BookOpen, GraduationCap, Sprout, Images, Heart, LogOut, Coffee, MessageSquare, CheckSquare, BookMarked, LayoutDashboard } from "lucide-react"
import { useStudy } from "@/components/study-provider"

const navItems = [
  { label: "Čitaonica", icon: BookOpen },
  { label: "Učenje", icon: GraduationCap },
  { label: "Naša bašta", icon: Sprout },
  { label: "Kafeterija kod Jove", icon: Coffee },
  { label: "Chat", icon: MessageSquare },
  { label: "Dnevni Zadaci", icon: CheckSquare },
  { label: "Zajednički notebook", icon: BookMarked },
  { label: "Digital diary", icon: Images },
  { label: "Pregled", icon: LayoutDashboard },
]

export function AppSidebar() {
  const { activeTab: active, setActiveTab: setActive, groupBank, currentUser, logout } = useStudy()

  return (
    <aside className="flex w-full flex-col gap-6 border-b border-sidebar-border bg-sidebar p-6 md:h-dvh md:w-72 md:border-b-0 md:border-r">
      {/* Group name header */}
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Heart className="size-5" fill="currentColor" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold leading-tight text-sidebar-foreground">
            Mašin harem
          </h1>
        </div>
      </div>

      {/* Logged-in profile */}
      {currentUser && (
        <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent p-3">
          <img
            src={currentUser.avatar || "/placeholder.svg"}
            alt={currentUser.name}
            className="size-11 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-sm font-bold text-sidebar-accent-foreground">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-sidebar-accent-foreground/70">
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Odjavi se"
            title="Odjavi se"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-sidebar-accent-foreground/70 transition-colors hover:bg-sidebar hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      )}

      {/* Shared group bank widget */}
      <div className="flex items-center justify-between rounded-2xl border border-sidebar-border bg-sidebar-accent px-4 py-3">
        <div>
          <p className="text-xs font-medium text-sidebar-accent-foreground/70">
            Zarađen novac
          </p>
          <p className="font-serif text-lg font-bold text-sidebar-accent-foreground">
            {groupBank.toLocaleString()} Coins
          </p>
        </div>
        <span className="text-2xl" aria-hidden="true">
          🪙
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon }) => {
          const isActive = active === label
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActive(label)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sidebar-border px-4 py-2.5 text-sm font-semibold text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:mt-auto"
      >
        <LogOut className="size-4" />
        Odjavi se
      </button>

      <p className="hidden text-xs text-sidebar-foreground/50 md:block">
        Made with love, for the girls 💗
      </p>
    </aside>
  )
}
