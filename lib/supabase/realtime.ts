import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"

type AsyncReload = () => Promise<void>

type StudyRealtimeOptions = {
  supabase: SupabaseClient
  onChatChange: AsyncReload
  onPresenceChange: AsyncReload
  onWalletChange: AsyncReload
  onGardenChange: AsyncReload
  onCafeChange: AsyncReload
  onMemoriesChange: AsyncReload
  onMemoryCategoriesChange: AsyncReload
}

function createDebouncedReload(reload: AsyncReload, delay = 120) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const trigger = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      timeoutId = null
      void reload()
    }, delay)
  }

  trigger.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = null
  }

  return trigger
}

export function subscribeToStudyRealtime({
  supabase,
  onChatChange,
  onPresenceChange,
  onWalletChange,
  onGardenChange,
  onCafeChange,
  onMemoriesChange,
  onMemoryCategoriesChange,
}: StudyRealtimeOptions) {
  const reloadChat = createDebouncedReload(onChatChange)
  const reloadPresence = createDebouncedReload(onPresenceChange)
  const reloadWallet = createDebouncedReload(onWalletChange)
  const reloadGarden = createDebouncedReload(onGardenChange)
  const reloadCafe = createDebouncedReload(onCafeChange)
  const reloadMemories = createDebouncedReload(onMemoriesChange)
  const reloadMemoryCategories = createDebouncedReload(onMemoryCategoriesChange)

  const reloadEverything = () => {
    reloadChat()
    reloadPresence()
    reloadWallet()
    reloadGarden()
    reloadCafe()
    reloadMemories()
    reloadMemoryCategories()
  }

  let channel: RealtimeChannel

  channel = supabase
    .channel(`study-app-${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, reloadChat)
    .on("postgres_changes", { event: "*", schema: "public", table: "chat_reactions" }, reloadChat)
    .on("postgres_changes", { event: "*", schema: "public", table: "member_presence" }, reloadPresence)
    .on("postgres_changes", { event: "*", schema: "public", table: "group_wallet" }, reloadWallet)
    .on("postgres_changes", { event: "*", schema: "public", table: "garden_items" }, reloadGarden)
    .on("postgres_changes", { event: "*", schema: "public", table: "cafe_gifts" }, reloadCafe)
    .on("postgres_changes", { event: "*", schema: "public", table: "memories" }, reloadMemories)
    .on("postgres_changes", { event: "*", schema: "public", table: "memory_categories" }, reloadMemoryCategories)
    .subscribe((status, error) => {
      if (status === "SUBSCRIBED") {
        console.info("Supabase Realtime je povezan.")
        // Pokriva promene nastale dok se kanal povezivao ili ponovo povezivao.
        reloadEverything()
      }

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        console.error("Supabase Realtime greška:", error ?? status)
      }
    })

  // Kada se korisnik vrati na karticu, odmah povuci sveže podatke.
  // Ovo nije polling i ne pravi stalne zahteve.
  const handleVisibility = () => {
    if (document.visibilityState === "visible") reloadEverything()
  }
  const handleOnline = () => reloadEverything()

  document.addEventListener("visibilitychange", handleVisibility)
  window.addEventListener("online", handleOnline)

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility)
    window.removeEventListener("online", handleOnline)

    reloadChat.cancel()
    reloadPresence.cancel()
    reloadWallet.cancel()
    reloadGarden.cancel()
    reloadCafe.cancel()
    reloadMemories.cancel()
    reloadMemoryCategories.cancel()

    void supabase.removeChannel(channel)
  }
}
