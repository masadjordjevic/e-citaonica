export type MemoryCategory = {
  id: string
  name: string
  emoji: string
}

export type Memory = {
  id: string
  imageUrl: string
  caption: string
  categoryId: string
  date: string
  author: string
  authorUserId?: string
  createdAt?: string
  canDelete?: boolean
}

export const DEFAULT_CATEGORIES: MemoryCategory[] = [
  { id: "fakultet", name: "Fakultet", emoji: "🎓" },
  { id: "izlasci", name: "Izlasci", emoji: "🪩" },
  { id: "kucne-bleje", name: "Kućne bleje", emoji: "🏠" },
  { id: "priroda", name: "Priroda", emoji: "🌲" },
]

export const SEED_MEMORIES: Memory[] = []
