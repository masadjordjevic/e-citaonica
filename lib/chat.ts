// Grupni čet - Group chat system with emoji reactions

export type EmojiReaction = "👏" | "☕" | "💡" | "🔥" | "❤️"

export type ReactionDetails = {
  count: number
  users: string[]
  reactedByCurrentUser: boolean
}

export type ChatMessage = {
  id: string
  author: string
  text: string
  timestamp: string
  reactions: Partial<Record<EmojiReaction, ReactionDetails>>
  isOwnMessage: boolean
}

export const REACTION_EMOJIS: EmojiReaction[] = [
  "👏",
  "☕",
  "💡",
  "🔥",
  "❤️",
]

export const REACTION_LABELS: Record<EmojiReaction, string> = {
  "👏": "Bravo",
  "☕": "Kafa pauza",
  "💡": "Dobra ideja",
  "🔥": "Fire!",
  "❤️": "Volim",
}
