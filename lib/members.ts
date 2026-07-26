export type MemberStatus = "Idle" | "Studying" | "On Break"

export type Member = {
  id: string
  name: string
  email: string
  status: MemberStatus
  subject?: string
  hoursThisWeek: number
  avatar: string
  ringColor: string
  isCurrentUser?: boolean
  cafeLocation?: boolean
  isWeeklyTop?: boolean
  sessionStartedAt?: string
  accumulatedSeconds?: number
}

export const INITIAL_GROUP_BANK = 0
export const COINS_PER_MINUTE = 1

export const members: Member[] = [
  { id: "masa", name: "Maša", email: "masa@harem.com", status: "Idle", hoursThisWeek: 0, avatar: "/avatars/masa.png", ringColor: "ring-[oklch(0.8_0.09_155)]" },
  { id: "tamara", name: "Tamara", email: "tamara@harem.com", status: "Idle", hoursThisWeek: 0, avatar: "/avatars/tamara.png", ringColor: "ring-[oklch(0.82_0.09_55)]" },
  { id: "danijela", name: "Danijela", email: "danijela@harem.com", status: "Idle", hoursThisWeek: 0, avatar: "/avatars/danijela.png", ringColor: "ring-[oklch(0.82_0.1_15)]" },
  { id: "ema", name: "Ema", email: "ema@harem.com", status: "Idle", hoursThisWeek: 0, avatar: "/avatars/ema.png", ringColor: "ring-[oklch(0.78_0.09_300)]" },
  { id: "jelena", name: "Jelena", email: "jelena@harem.com", status: "Idle", hoursThisWeek: 0, avatar: "/avatars/jelena.png", ringColor: "ring-[oklch(0.62_0.2_300)]" },
  { id: "mia", name: "Mia", email: "mia@harem.com", status: "Idle", hoursThisWeek: 0, avatar: "/avatars/mia.png", ringColor: "ring-[oklch(0.8_0.09_220)]" },
  { id: "ana", name: "Ana", email: "ana@harem.com", status: "Idle", hoursThisWeek: 0, avatar: "/avatars/ana.png", ringColor: "ring-[oklch(0.82_0.09_25)]" },
  { id: "emilija", name: "Emilija", email: "emilija@harem.com", status: "Idle", hoursThisWeek: 0, avatar: "/avatars/emilija.png", ringColor: "ring-[oklch(0.82_0.09_260)]" },
  { id: "andrea", name: "Andrea", email: "andrea@harem.com", status: "Idle", hoursThisWeek: 0, avatar: "/avatars/andrea.png", ringColor: "ring-[oklch(0.82_0.09_340)]" },
]

export function findAccountByEmail(email: string): Member | undefined {
  const normalized = email.trim().toLowerCase()
  return members.find((member) => member.email.toLowerCase() === normalized)
}
