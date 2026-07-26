"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Trash2 } from "lucide-react"
import { useStudy } from "@/components/study-provider"
import {
  REACTION_EMOJIS,
  REACTION_LABELS,
  type EmojiReaction,
} from "@/lib/chat"

export function Chat() {
  const {
    chatMessages,
    sendMessage,
    addReaction,
    deleteMessage,
    members,
  } = useStudy()

  const [messageText, setMessageText] = useState("")
  const [hoveredMessageId, setHoveredMessageId] =
    useState<string | null>(null)
  const [deletingMessageId, setDeletingMessageId] =
    useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [chatMessages])

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedText = messageText.trim()

    if (!trimmedText) return

    await sendMessage(trimmedText)
    setMessageText("")
  }

  const handleDelete = async (messageId: string) => {
    const confirmed = window.confirm(
      "Da li sigurno želiš da obrišeš ovu poruku?",
    )

    if (!confirmed) return

    setDeletingMessageId(messageId)

    try {
      await deleteMessage(messageId)
    } finally {
      setDeletingMessageId(null)
    }
  }

  const getMemberAvatar = (name: string) => {
    const member = members.find(
      (currentMember) => currentMember.name === name,
    )

    return member?.avatar || "/placeholder.svg"
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-serif text-xl font-bold text-foreground">
          Group chat
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Komunikacija sa grupom
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {chatMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="mb-2 text-2xl">💬</p>

              <p className="text-sm text-muted-foreground">
                Započni razgovor! Niko još nije pisao...
              </p>
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className="group"
              onMouseEnter={() =>
                setHoveredMessageId(message.id)
              }
              onMouseLeave={() =>
                setHoveredMessageId(null)
              }
            >
              <div className="flex gap-3">
                <img
                  src={getMemberAvatar(message.author)}
                  alt={message.author}
                  className="size-8 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {message.author}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        message.timestamp,
                      ).toLocaleTimeString("sr-RS", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {message.isOwnMessage && (
                      <button
                        type="button"
                        disabled={
                          deletingMessageId === message.id
                        }
                        onClick={() =>
                          handleDelete(message.id)
                        }
                        className="ml-auto rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                        title="Obriši poruku"
                        aria-label="Obriši poruku"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <p className="mt-1 break-words text-sm text-foreground">
                    {message.text}
                  </p>

                  {Object.keys(message.reactions).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(
                        message.reactions,
                      ).map(([emoji, reaction]) => {
                        if (
                          !reaction ||
                          reaction.count === 0
                        ) {
                          return null
                        }

                        const names =
                          reaction.users.join(", ")

                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() =>
                              addReaction(
                                message.id,
                                emoji as EmojiReaction,
                              )
                            }
                            className={
                              reaction.reactedByCurrentUser
                                ? "flex items-center gap-1 rounded-full border border-accent bg-accent/30 px-2 py-1 text-xs transition-all"
                                : "flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-xs transition-all hover:bg-accent/20"
                            }
                            title={
                              names
                                ? `${REACTION_LABELS[emoji as EmojiReaction]} — ${names}`
                                : REACTION_LABELS[
                                    emoji as EmojiReaction
                                  ]
                            }
                          >
                            <span>{emoji}</span>

                            <span className="font-semibold text-accent">
                              {reaction.count}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {hoveredMessageId === message.id && (
                  <div className="flex self-start rounded-full border border-border bg-background px-2 py-1 shadow-sm">
                    {REACTION_EMOJIS.map((emoji) => {
                      const reaction =
                        message.reactions[emoji]

                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            addReaction(message.id, emoji)
                          }
                          className={
                            reaction
                              ?.reactedByCurrentUser
                              ? "rounded-full bg-accent/30 px-1 text-lg transition-transform hover:scale-125"
                              : "rounded-full px-1 text-lg transition-transform hover:scale-125"
                          }
                          title={
                            REACTION_LABELS[emoji]
                          }
                        >
                          {emoji}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-background/50 px-6 py-4">
        <form
          onSubmit={handleSend}
          className="flex gap-2"
        >
          <input
            type="text"
            value={messageText}
            onChange={(event) =>
              setMessageText(event.target.value)
            }
            placeholder="Upiši poruku..."
            className="flex-1 rounded-2xl border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none"
          />

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="rounded-2xl bg-accent p-2 text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-50"
            aria-label="Pošalji poruku"
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
