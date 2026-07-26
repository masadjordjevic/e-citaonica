"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { useLocalStorage } from "@/lib/useLocalStorage"
import {
  members as initialMembers,
  findAccountByEmail,
  INITIAL_GROUP_BANK,
  COINS_PER_MINUTE,
  type Member,
} from "@/lib/members"
import { type PlantedItem, type ShopItem } from "@/lib/garden"
import {
  DEFAULT_CATEGORIES,
  type Memory,
  type MemoryCategory,
} from "@/lib/memories"
import { type CafeGift, CAFE_MENU } from "@/lib/cafe"
import { type ChatMessage } from "@/lib/chat"
import { type DailyQuest, getDefaultDailyQuests } from "@/lib/quests"
import { type NotebookSubject, getDefaultNotebookSubjects } from "@/lib/notebook"
import { updateWeeklyTopBadge } from "@/lib/weekly-top"
import { createClient } from "@/lib/supabase/client"
import { subscribeToStudyRealtime } from "@/lib/supabase/realtime"

type LoginResult = { ok: boolean; error?: string }

type StudyContextValue = {
  members: Member[]
  currentUser: Member | null
  authLoading: boolean
  groupBank: number
  activeTab: string
  setActiveTab: (tab: string) => void

  // Auth
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>

  // Study session
  startStudying: (subject: string) => Promise<void>
  pauseStudying: (subject?: string) => Promise<void>
  finishStudying: (elapsedSeconds: number) => Promise<number>

  // Garden
  plantedItems: PlantedItem[]
  buyItem: (item: ShopItem, note?: string) => Promise<boolean>

  // Memories
  memories: Memory[]
  categories: MemoryCategory[]
  addCategory: (name: string, emoji: string) => Promise<LoginResult>
  addMemory: (memory: {
    file?: File
    imageUrl?: string
    caption: string
    categoryId: string
    date: string
  }) => Promise<LoginResult>
  deleteMemory: (memoryId: string) => Promise<boolean>

  // Cafe
  cafeGifts: CafeGift[]
  giftMember: (
    toMemberId: string,
    itemId: string,
    giftNote?: string,
  ) => Promise<boolean>

  // Chat
  chatMessages: ChatMessage[]
  sendMessage: (text: string) => Promise<void>
  addReaction: (messageId: string, emoji: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>

  // Quests
  dailyQuests: DailyQuest[]
  completeQuest: (questId: string) => void
  resetDailyQuests: () => void

  // Notebook
  notebookSubjects: NotebookSubject[]
}

const StudyContext = createContext<StudyContextValue | null>(null)

export function StudyProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [activeTab, setActiveTab] = useState<string>("Čitaonica")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Zajednička kasa, bašta i kafeterija sada su u Supabase bazi.
  const [groupBank, setGroupBank] = useState<number>(0)
  const [plantedItems, setPlantedItems] = useState<PlantedItem[]>([])
  const [cafeGifts, setCafeGifts] = useState<CafeGift[]>([])

  // Podaci koji su još uvek lokalni.
  const [categories, setCategories] = useState<MemoryCategory[]>(DEFAULT_CATEGORIES)
  const [memories, setMemories] = useState<Memory[]>([])

  // Chat se više ne čuva u localStorage-u, već u Supabase bazi.
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const [dailyQuests, setDailyQuests] = useLocalStorage<DailyQuest[]>(
    "study:dailyQuests",
    getDefaultDailyQuests(),
  )
  const [notebookSubjects] = useLocalStorage<NotebookSubject[]>(
    "study:notebookSubjects",
    getDefaultNotebookSubjects(),
  )

  const currentUser = useMemo(
    () => members.find((member) => member.id === currentUserId) ?? null,
    [members, currentUserId],
  )

  const loadChatMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/chat", {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        if (response.status !== 401) {
          const payload = await response.json().catch(() => null)
          console.error(
            payload?.error ?? "Učitavanje poruka nije uspelo.",
          )
        }
        return
      }

      const payload = await response.json()

      setChatMessages(
        Array.isArray(payload.messages) ? payload.messages : [],
      )
    } catch (error) {
      console.error("Backend za chat nije dostupan:", error)
    }
  }, [])

  const loadPresence = useCallback(async () => {
    try {
      const response = await fetch("/api/presence", {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        if (response.status !== 401) {
          const payload = await response.json().catch(() => null)
          console.error(
            payload?.error ??
              "Učitavanje statusa nije uspelo.",
          )
        }
        return
      }

      const payload = await response.json()
      const presenceRows = Array.isArray(
        payload.presence,
      )
        ? payload.presence
        : []

      setMembers((previousMembers) => {
        const updatedMembers: Member[] =
          previousMembers.map((member): Member => {
            const presence = presenceRows.find(
              (row: {
                memberName?: string
              }) => row.memberName === member.name,
            )

            if (!presence) {
              return member
            }

            return {
              ...member,
              status: presence.status,
              subject:
                presence.subject || undefined,
              hoursThisWeek:
                typeof presence.hoursThisWeek ===
                "number"
                  ? presence.hoursThisWeek
                  : member.hoursThisWeek,
              sessionStartedAt:
                typeof presence.sessionStartedAt ===
                "string"
                  ? presence.sessionStartedAt
                  : undefined,
              accumulatedSeconds:
                typeof presence.accumulatedSeconds ===
                "number"
                  ? presence.accumulatedSeconds
                  : 0,
            }
          })

        return updateWeeklyTopBadge(updatedMembers)
      })
    } catch (error) {
      console.error(
        "Backend za statuse nije dostupan:",
        error,
      )
    }
  }, [])

  const loadWallet = useCallback(async () => {
    try {
      const response = await fetch("/api/wallet", {
        cache: "no-store",
      })

      if (!response.ok) return

      const payload = await response.json()

      setGroupBank(
        typeof payload.balance === "number"
          ? payload.balance
          : 0,
      )
    } catch (error) {
      console.error(
        "Backend za zajedničku kasu nije dostupan:",
        error,
      )
    }
  }, [])

  const loadGarden = useCallback(async () => {
    try {
      const response = await fetch("/api/garden", {
        cache: "no-store",
      })

      if (!response.ok) return

      const payload = await response.json()

      setPlantedItems(
        Array.isArray(payload.items)
          ? payload.items
          : [],
      )
    } catch (error) {
      console.error(
        "Backend za baštu nije dostupan:",
        error,
      )
    }
  }, [])

  const loadCafeGifts = useCallback(async () => {
    try {
      const response = await fetch("/api/cafe", {
        cache: "no-store",
      })

      if (!response.ok) return

      const payload = await response.json()

      setCafeGifts(
        Array.isArray(payload.gifts)
          ? payload.gifts
          : [],
      )
    } catch (error) {
      console.error(
        "Backend za kafeteriju nije dostupan:",
        error,
      )
    }
  }, [])

  const loadMemoryCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/memory-categories", { cache: "no-store" })
      if (!response.ok) return
      const payload = await response.json()
      setCategories(Array.isArray(payload.categories) ? payload.categories : DEFAULT_CATEGORIES)
    } catch (error) {
      console.error("Backend za kategorije uspomena nije dostupan:", error)
    }
  }, [])

  const loadMemories = useCallback(async () => {
    try {
      const response = await fetch("/api/memories", { cache: "no-store" })
      if (!response.ok) return
      const payload = await response.json()
      setMemories(Array.isArray(payload.memories) ? payload.memories : [])
    } catch (error) {
      console.error("Backend za uspomene nije dostupan:", error)
    }
  }, [])




  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        })

        if (!response.ok) return

        const payload = await response.json()
        const email = payload?.user?.email as string | undefined
        const account = email ? findAccountByEmail(email) : undefined

        if (!cancelled && account) {
          setCurrentUserId(account.id)
          setMembers((previousMembers) =>
            updateWeeklyTopBadge(
              previousMembers.map((member) => ({
                ...member,
                isCurrentUser: member.id === account.id,
              })),
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  // Po prijavi jednom učitavamo trenutno stanje iz API-ja.
  // Nakon toga Supabase Realtime javlja svaku promenu u bazi.
  useEffect(() => {
    if (!currentUserId) {
      setChatMessages([])
      setGroupBank(0)
      setPlantedItems([])
      setCafeGifts([])
      setCategories(DEFAULT_CATEGORIES)
      setMemories([])
      return
    }

    void Promise.all([
      loadChatMessages(),
      loadPresence(),
      loadWallet(),
      loadGarden(),
      loadCafeGifts(),
      loadMemoryCategories(),
      loadMemories(),
    ])
  }, [
    currentUserId,
    loadChatMessages,
    loadPresence,
    loadWallet,
    loadGarden,
    loadCafeGifts,
    loadMemoryCategories,
    loadMemories,
  ])

  // Jedna Realtime konekcija prati sve zajedničke tabele.
  // Kratak debounce spaja više događaja iz iste transakcije
  // (na primer kupovina menja i kasu i baštu).
  useEffect(() => {
    if (!currentUserId) return

    const supabase = createClient()

    const unsubscribe = subscribeToStudyRealtime({
      supabase,
      onChatChange: loadChatMessages,
      onPresenceChange: loadPresence,
      onWalletChange: loadWallet,
      onGardenChange: loadGarden,
      onCafeChange: loadCafeGifts,
      onMemoriesChange: loadMemories,
      onMemoryCategoriesChange: loadMemoryCategories,
    })

    return unsubscribe
  }, [
    currentUserId,
    loadChatMessages,
    loadPresence,
    loadWallet,
    loadGarden,
    loadCafeGifts,
    loadMemories,
    loadMemoryCategories,
  ])

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<LoginResult> => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        const payload = await response.json()

        if (!response.ok) {
          return {
            ok: false,
            error: payload?.error ?? "Prijava nije uspela.",
          }
        }

        const account = findAccountByEmail(payload.user.email)

        if (!account) {
          await fetch("/api/auth/logout", {
            method: "POST",
          })

          return {
            ok: false,
            error: "Ovaj nalog nije član grupe.",
          }
        }

        setCurrentUserId(account.id)
        setMembers((previousMembers) =>
          updateWeeklyTopBadge(
            previousMembers.map((member) => ({
              ...member,
              isCurrentUser: member.id === account.id,
            })),
          ),
        )

        return { ok: true }
      } catch {
        return {
          ok: false,
          error: "Backend trenutno nije dostupan.",
        }
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    }).catch(() => undefined)

    setCurrentUserId(null)
    setChatMessages([])
    setMembers((previousMembers) =>
      previousMembers.map((member) => ({
        ...member,
        isCurrentUser: false,
      })),
    )
    setActiveTab("Čitaonica")
  }, [])

  const startStudying = useCallback(
    async (subject: string) => {
      const trimmedSubject = subject.trim()

      if (!trimmedSubject || !currentUserId) return

      try {
        const response = await fetch("/api/presence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "start",
            subject: trimmedSubject,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          console.error(
            payload?.error ??
              "Sesija učenja nije pokrenuta.",
          )
          return
        }

        await loadPresence()
      } catch (error) {
        console.error(
          "Backend za početak učenja nije dostupan:",
          error,
        )
      }
    },
    [currentUserId, loadPresence],
  )

  const pauseStudying = useCallback(
    async (subject?: string) => {
      if (!currentUserId) return

      try {
        const response = await fetch("/api/presence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "pause",
            subject: subject?.trim() || undefined,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          console.error(
            payload?.error ??
              "Pauza nije sačuvana.",
          )
          return
        }

        await loadPresence()
      } catch (error) {
        console.error(
          "Backend za pauzu nije dostupan:",
          error,
        )
      }
    },
    [currentUserId, loadPresence],
  )

  const finishStudying = useCallback(
    async (elapsedSeconds: number) => {
      if (!currentUserId) return 0

      try {
        const response = await fetch("/api/presence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "finish",
            elapsedSeconds,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          console.error(
            payload?.error ??
              "Sesija učenja nije završena.",
          )
          return 0
        }

        const earned =
          typeof payload.earned === "number"
            ? payload.earned
            : 0

        await Promise.all([loadPresence(), loadWallet()])

        return earned
      } catch (error) {
        console.error(
          "Backend za završetak učenja nije dostupan:",
          error,
        )
        return 0
      }
    },
    [
      currentUserId,
      loadPresence,
      loadWallet,
    ],
  )

  const buyItem = useCallback(
    async (item: ShopItem, note?: string) => {
      if (!currentUserId) return false

      try {
        const response = await fetch("/api/garden", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemId: item.id,
            note: note?.trim() || undefined,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          console.error(
            payload?.error ?? "Kupovina nije uspela.",
          )
          return false
        }

        setGroupBank(payload.balance)
        setPlantedItems((previousItems) => [
          ...previousItems,
          payload.item,
        ])

        return true
      } catch (error) {
        console.error(
          "Backend za kupovinu u bašti nije dostupan:",
          error,
        )
        return false
      }
    },
    [currentUserId],
  )

  const addCategory = useCallback(
    async (name: string, emoji: string): Promise<LoginResult> => {
      if (!name.trim()) return { ok: false, error: "Unesi naziv kategorije." }

      try {
        const response = await fetch("/api/memory-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), emoji: emoji.trim() || "✨" }),
        })
        const payload = await response.json()

        if (!response.ok) {
          return { ok: false, error: payload?.error ?? "Kategorija nije dodata." }
        }

        setCategories((previous) =>
          previous.some((item) => item.id === payload.category.id)
            ? previous
            : [...previous, payload.category],
        )
        return { ok: true }
      } catch {
        return { ok: false, error: "Backend za kategorije nije dostupan." }
      }
    },
    [],
  )

  const addMemory = useCallback(
    async (memory: {
      file?: File
      imageUrl?: string
      caption: string
      categoryId: string
      date: string
    }): Promise<LoginResult> => {
      if (!memory.caption.trim()) {
        return { ok: false, error: "Unesi opis uspomene." }
      }

      if (!memory.file && !memory.imageUrl?.trim()) {
        return { ok: false, error: "Dodaj fotografiju ili njen URL." }
      }

      try {
        const formData = new FormData()
        formData.set("caption", memory.caption.trim())
        formData.set("categoryId", memory.categoryId)
        formData.set("date", memory.date)

        if (memory.file) formData.set("file", memory.file)
        else if (memory.imageUrl) formData.set("imageUrl", memory.imageUrl.trim())

        const response = await fetch("/api/memories", {
          method: "POST",
          body: formData,
        })
        const payload = await response.json()

        if (!response.ok) {
          return { ok: false, error: payload?.error ?? "Uspomena nije objavljena." }
        }

        setMemories((previous) =>
          previous.some((item) => item.id === payload.memory.id)
            ? previous
            : [payload.memory, ...previous],
        )
        return { ok: true }
      } catch {
        return { ok: false, error: "Backend za uspomene nije dostupan." }
      }
    },
    [],
  )

  const deleteMemory = useCallback(async (memoryId: string) => {
    try {
      const response = await fetch("/api/memories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryId }),
      })
      const payload = await response.json()

      if (!response.ok) {
        console.error(payload?.error ?? "Uspomena nije obrisana.")
        return false
      }

      setMemories((previous) => previous.filter((memory) => memory.id !== memoryId))
      return true
    } catch (error) {
      console.error("Backend za brisanje uspomene nije dostupan:", error)
      return false
    }
  }, [])

  const giftMember = useCallback(
    async (
      toMemberId: string,
      itemId: string,
      giftNote?: string,
    ) => {
      if (!currentUserId) return false

      try {
        const response = await fetch("/api/cafe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId: toMemberId,
            itemId,
            giftNote:
              giftNote?.trim() || undefined,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          console.error(
            payload?.error ??
              "Porudžbina nije uspela.",
          )
          return false
        }

        setGroupBank(payload.balance)
        setCafeGifts((previousGifts) => [
          ...previousGifts,
          payload.gift,
        ])

        return true
      } catch (error) {
        console.error(
          "Backend za kafeteriju nije dostupan:",
          error,
        )
        return false
      }
    },
    [currentUserId],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmedText = text.trim()

      if (!trimmedText || !currentUserId) return

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: trimmedText,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          console.error(
            payload?.error ?? "Poruka nije poslata.",
          )
          return
        }

        setChatMessages((previousMessages) => {
          const alreadyExists = previousMessages.some(
            (message) => message.id === payload.message.id,
          )

          if (alreadyExists) {
            return previousMessages
          }

          return [...previousMessages, payload.message]
        })
      } catch (error) {
        console.error(
          "Backend za chat nije dostupan:",
          error,
        )
      }
    },
    [currentUserId],
  )

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const response = await fetch("/api/chat", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId,
            emoji,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          console.error(
            payload?.error ?? "Reakcija nije sačuvana.",
          )
          return
        }

        setChatMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  reactions: payload.reactions,
                }
              : message,
          ),
        )
      } catch (error) {
        console.error(
          "Backend za reakcije nije dostupan:",
          error,
        )
      }
    },
    [],
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const response = await fetch("/api/chat", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          console.error(
            payload?.error ?? "Poruka nije obrisana.",
          )
          return
        }

        setChatMessages((previousMessages) =>
          previousMessages.filter(
            (message) => message.id !== messageId,
          ),
        )
      } catch (error) {
        console.error(
          "Backend za brisanje poruke nije dostupan:",
          error,
        )
      }
    },
    [],
  )

  const completeQuest = useCallback(
    (questId: string) => {
      setDailyQuests((previousQuests) =>
        previousQuests.map((quest) =>
          quest.id === questId
            ? {
                ...quest,
                completed: true,
                completedAt: new Date().toISOString(),
              }
            : quest,
        ),
      )
    },
    [setDailyQuests],
  )

  const resetDailyQuests = useCallback(() => {
    setDailyQuests(getDefaultDailyQuests())
  }, [setDailyQuests])

  const value = useMemo<StudyContextValue>(
    () => ({
      members,
      currentUser,
      authLoading,
      groupBank,
      activeTab,
      setActiveTab,
      login,
      logout,
      startStudying,
      pauseStudying,
      finishStudying,
      plantedItems,
      buyItem,
      memories,
      categories,
      addCategory,
      addMemory,
      deleteMemory,
      cafeGifts,
      giftMember,
      chatMessages,
      sendMessage,
      addReaction,
      deleteMessage,
      dailyQuests,
      completeQuest,
      resetDailyQuests,
      notebookSubjects,
    }),
    [
      members,
      currentUser,
      authLoading,
      groupBank,
      activeTab,
      login,
      logout,
      startStudying,
      pauseStudying,
      finishStudying,
      plantedItems,
      buyItem,
      memories,
      categories,
      addCategory,
      addMemory,
      deleteMemory,
      cafeGifts,
      giftMember,
      chatMessages,
      sendMessage,
      addReaction,
      deleteMessage,
      dailyQuests,
      completeQuest,
      resetDailyQuests,
      notebookSubjects,
    ],
  )

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  )
}

export function useStudy() {
  const context = useContext(StudyContext)

  if (!context) {
    throw new Error(
      "useStudy must be used within a StudyProvider",
    )
  }

  return context
}
