"use client"

import { useState } from "react"
import { MessageSquare, X } from "lucide-react"
import { useStudy } from "@/components/study-provider"
import { CAFE_MENU } from "@/lib/cafe"

export function Cafe() {
  const {
    members,
    currentUser,
    giftMember,
    cafeGifts,
    groupBank,
  } = useStudy()

  const [selectedItem, setSelectedItem] =
    useState<string | null>(null)
  const [selectedRecipient, setSelectedRecipient] =
    useState<string | null>(null)
  const [giftMessage, setGiftMessage] = useState("")
  const [confirmPending, setConfirmPending] =
    useState(false)
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const otherMembers = members.filter(
    (member) => member.id !== currentUser?.id,
  )
  const item = CAFE_MENU.find(
    (menuItem) => menuItem.id === selectedItem,
  )

  const closeModal = () => {
    if (confirmPending) return

    setSelectedItem(null)
    setSelectedRecipient(null)
    setGiftMessage("")
    setErrorMessage(null)
  }

  const handleConfirmGift = async () => {
    if (
      !selectedItem ||
      !selectedRecipient ||
      confirmPending
    ) {
      return
    }

    setConfirmPending(true)
    setErrorMessage(null)

    try {
      const success = await giftMember(
        selectedRecipient,
        selectedItem,
        giftMessage,
      )

      if (success) {
        closeModal()
      } else {
        setErrorMessage(
          "Porudžbina nije uspela. Proveri stanje zajedničke kase.",
        )
      }
    } finally {
      setConfirmPending(false)
    }
  }

  const recentGifts = cafeGifts
    .slice(-8)
    .reverse()

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-2 font-serif text-2xl font-bold text-foreground">
          Kafeterija kod Jove 
        </h3>
        <p className="text-muted-foreground">
          Počasti sebe ili obraduj neku od drugarica.
          U zajedničkoj kasi je{" "}
          <span className="font-semibold text-foreground">
            {groupBank.toLocaleString("sr-RS")} 🪙
          </span>
          .
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CAFE_MENU.map((menuItem) => (
          <button
            key={menuItem.id}
            type="button"
            onClick={() => {
              setSelectedItem(menuItem.id)
              setErrorMessage(null)
            }}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card p-4 transition-all hover:border-accent hover:shadow-md"
          >
            <span className="text-4xl">
              {menuItem.emoji}
            </span>
            <div className="text-center">
              <p className="line-clamp-2 text-xs font-semibold text-foreground">
                {menuItem.name}
              </p>
              <p className="mt-1 text-xs font-bold text-accent">
                {menuItem.price} 🪙
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedItem && item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border-2 border-border bg-card shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-border p-6">
              <h4 className="font-serif text-xl font-bold text-foreground">
                Porudžbina: {item.name}
              </h4>
              <button
                type="button"
                onClick={closeModal}
                disabled={confirmPending}
                className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Zatvori"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="rounded-2xl bg-accent/10 p-6 text-center">
                <span className="mb-2 block text-6xl">
                  {item.emoji}
                </span>
                <p className="mb-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <p className="text-lg font-bold text-accent">
                  {item.price} 🪙
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Za koga je porudžbina?
                </p>

                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-3 transition hover:bg-accent/5">
                    <input
                      type="radio"
                      name="recipient"
                      value="self"
                      checked={
                        selectedRecipient === "self"
                      }
                      onChange={() =>
                        setSelectedRecipient("self")
                      }
                      className="size-4"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Za mene
                    </span>
                  </label>

                  {otherMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-3 transition hover:bg-accent/5"
                    >
                      <input
                        type="radio"
                        name="recipient"
                        value={member.id}
                        checked={
                          selectedRecipient === member.id
                        }
                        onChange={() =>
                          setSelectedRecipient(member.id)
                        }
                        className="size-4"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Za: {member.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Poruka (opcionalno)
                </label>
                <input
                  type="text"
                  value={giftMessage}
                  onChange={(event) =>
                    setGiftMessage(event.target.value)
                  }
                  maxLength={160}
                  placeholder="npr. Za sreću na ispitu!"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {errorMessage && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="shrink-0 space-y-3 border-t border-border p-6">
              <button
                type="button"
                onClick={handleConfirmGift}
                disabled={
                  !selectedRecipient ||
                  confirmPending ||
                  groupBank < item.price
                }
                className="w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                {confirmPending
                  ? "Obrada..."
                  : groupBank < item.price
                    ? "Nema dovoljno novca u kasi"
                    : `Poruči · ${item.price} 🪙`}
              </button>

              <button
                type="button"
                onClick={closeModal}
                disabled={confirmPending}
                className="w-full rounded-xl bg-muted py-2.5 font-semibold text-foreground transition hover:bg-muted/80 disabled:opacity-50"
              >
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}

      {recentGifts.length > 0 && (
        <section>
          <h4 className="mb-4 font-serif text-lg font-bold text-foreground">
            Nedavni pokloni
          </h4>

          <div className="space-y-3">
            {recentGifts.map((gift) => (
              <div
                key={gift.instanceId}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <span className="text-3xl">
                  {gift.emoji}
                </span>

                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    Od: {gift.givenBy} · Za:{" "}
                    {gift.givenTo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gift.name}
                  </p>

                  {gift.giftNote && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-accent">
                      <MessageSquare className="size-3" />
                      &ldquo;{gift.giftNote}&rdquo;
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(
                    gift.giftedAt,
                  ).toLocaleTimeString("sr-RS", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
