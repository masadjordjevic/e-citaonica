// Dnevni Zadaci - Daily quest system with auto-checking

export type DailyQuest = {
  id: string
  title: string
  description: string
  icon: string
  coinReward: number
  // Check function name for auto-verification (e.g., "checkStudyTime", "checkCafeVisit")
  checkType: "studyTime" | "cafeVisit" | "planting" | "message" | "teamStudy" | "memory"
  checkTarget: number // For studyTime: minutes, for others: count
  completed: boolean
  completedAt?: string // ISO timestamp when completed
}

// Default daily quests that reset each day
export function getDefaultDailyQuests(): DailyQuest[] {
  return [
    {
      id: "daily-study-1h",
      title: "Sat produktivne studije",
      description: "Studira 60 minuta na bilo kom predmetu",
      icon: "📚",
      coinReward: 150,
      checkType: "studyTime",
      checkTarget: 60,
      completed: false,
    },
    {
      id: "daily-cafe-visit",
      title: "Poseta kafeteriji",
      description: "Kupi nešto iz Kafeterije kod Jove",
      icon: "☕",
      coinReward: 80,
      checkType: "cafeVisit",
      checkTarget: 1,
      completed: false,
    },
    {
      id: "daily-plant",
      title: "Zasadi nešto u baštu",
      description: "Kupi i zasadi pozitivan predmet u Našu baštu",
      icon: "🌻",
      coinReward: 100,
      checkType: "planting",
      checkTarget: 1,
      completed: false,
    },
    {
      id: "daily-message",
      title: "Uključi se u čet",
      description: "Pošalji poruku u Grupnom četu",
      icon: "💬",
      coinReward: 70,
      checkType: "message",
      checkTarget: 1,
      completed: false,
    },
    {
      id: "daily-team-study",
      title: "Studiranje sa sadrugom",
      description: "Studira u isto vreme kada i neko iz grupe",
      icon: "👥",
      coinReward: 120,
      checkType: "teamStudy",
      checkTarget: 1,
      completed: false,
    },
    {
      id: "daily-memory",
      title: "Dodaj uspomenu",
      description: "Sacuva novi trenutak u Zajedničkoj beležnici",
      icon: "📷",
      coinReward: 90,
      checkType: "memory",
      checkTarget: 1,
      completed: false,
    },
  ]
}
