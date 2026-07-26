"use client"

import { useEffect, useRef, useState } from "react"
import { ShoppingBag, X, Coins, Sprout, Leaf } from "lucide-react"
import { useStudy } from "@/components/study-provider"
import {
  PLANTS,
  ANIMALS,
  boughtVerb,
  getItemSvg,
  type ShopCategory,
  type ShopItem,
  type PlantedItem,
} from "@/lib/garden"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sr-Latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function SunDecoration() {
  return (
    <div
      className="pointer-events-none absolute -right-5 -top-5 z-20 select-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 h-32 w-32 translate-x-2 translate-y-2 rounded-full bg-yellow-300/40 blur-2xl" />
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index * 30 * Math.PI) / 180
          const x1 = 50 + 36 * Math.cos(angle)
          const y1 = 50 + 36 * Math.sin(angle)
          const x2 = 50 + 46 * Math.cos(angle)
          const y2 = 50 + 46 * Math.sin(angle)

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FDE68A"
              strokeWidth={index % 2 === 0 ? 3 : 2}
              strokeLinecap="round"
              opacity={index % 2 === 0 ? 1 : 0.65}
            />
          )
        })}

        <circle cx="50" cy="50" r="30" fill="#FEF08A" opacity="0.5" />
        <circle cx="50" cy="50" r="26" fill="#FBBF24" />
        <circle cx="50" cy="50" r="22" fill="#FCD34D" />
        <ellipse
          cx="42"
          cy="41"
          rx="7"
          ry="4"
          fill="#FEF9C3"
          opacity="0.6"
          transform="rotate(-30 42 41)"
        />
        <circle cx="44" cy="50" r="3" fill="#92400E" />
        <circle cx="56" cy="50" r="3" fill="#92400E" />
        <circle cx="43" cy="49" r="1" fill="#FEF3C7" />
        <circle cx="55" cy="49" r="1" fill="#FEF3C7" />
        <path
          d="M43 57 Q50 63 57 57"
          stroke="#92400E"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

function Clouds() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      aria-hidden="true"
    >
      <div className="absolute left-[12%] top-8 opacity-80">
        <svg width="72" height="36" viewBox="0 0 72 36" fill="none">
          <ellipse cx="36" cy="26" rx="28" ry="14" fill="white" />
          <ellipse cx="24" cy="22" rx="16" ry="12" fill="white" />
          <ellipse cx="50" cy="20" rx="14" ry="10" fill="white" />
        </svg>
      </div>

      <div className="absolute left-[45%] top-12 opacity-60">
        <svg width="50" height="26" viewBox="0 0 50 26" fill="none">
          <ellipse cx="25" cy="18" rx="19" ry="10" fill="white" />
          <ellipse cx="16" cy="15" rx="11" ry="8" fill="white" />
          <ellipse cx="36" cy="14" rx="10" ry="7" fill="white" />
        </svg>
      </div>
    </div>
  )
}

function GrassStrip() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-16 overflow-hidden rounded-b-3xl"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 56"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <path
          d="M0 30 Q20 18 40 26 Q60 14 80 24 Q100 12 120 22 Q140 14 160 24 Q180 16 200 26 Q220 14 240 22 Q260 16 280 26 Q300 14 320 24 Q340 16 360 26 Q380 14 400 22 L400 56 L0 56Z"
          fill="#4ADE80"
          opacity="0.7"
        />
        <path
          d="M0 36 Q20 24 40 32 Q60 20 80 30 Q100 22 120 32 Q140 24 160 34 Q180 22 200 32 Q220 20 240 30 Q260 24 280 34 Q300 20 320 30 Q340 24 360 34 Q380 20 400 30 L400 56 L0 56Z"
          fill="#22C55E"
        />
      </svg>
    </div>
  )
}

function PlantTooltip({ item }: { item: PlantedItem }) {
  return (
    <div
      className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-40 w-52 -translate-x-1/2"
      role="tooltip"
    >
      <div className="rounded-2xl border border-yellow-200 bg-white/95 px-4 py-3 text-left shadow-xl backdrop-blur-sm">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          {boughtVerb(item.category)}
        </p>
        <p className="text-sm font-bold leading-tight text-gray-800">
          {item.boughtBy}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{item.name}</p>

        {item.note && (
          <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-2 py-1.5 text-xs text-gray-700">
            <span className="mr-1">💬</span>
            <span className="italic">&ldquo;{item.note}&rdquo;</span>
          </p>
        )}

        {item.plantedAt && (
          <p className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
            <Leaf className="size-3 shrink-0 text-emerald-400" />
            {formatDate(item.plantedAt)}
          </p>
        )}
      </div>
    </div>
  )
}

function GardenItemCard({ item }: { item: PlantedItem }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [open])

  const svgMarkup = getItemSvg(item.itemId, 64)
  const isFlying =
    item.itemId === "butterfly" || item.itemId === "ladybug"

  return (
    <div
      ref={ref}
      className="group relative flex h-[108px] items-end justify-center self-end"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((value) => !value)}
      role="button"
      tabIndex={0}
      aria-label={`${item.name}, ${boughtVerb(item.category)} ${item.boughtBy}`}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          setOpen((value) => !value)
        }
      }}
    >
      {open && <PlantTooltip item={item} />}

      <div
        className={`relative flex flex-col items-center justify-end ${
          isFlying ? "-translate-y-8" : ""
        }`}
      >
        {!isFlying && (
          <div className="absolute bottom-1 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-black/10 blur-sm" />
        )}

        <div
          className="relative z-10 origin-bottom drop-shadow-md transition-transform duration-200 group-hover:scale-110"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
          aria-hidden="true"
        />

        {item.category === "plant" && (
          <div className="relative z-0 -mt-2 h-3 w-14 rounded-full border border-amber-900/20 bg-amber-800/60" />
        )}
      </div>
    </div>
  )
}

export function Garden() {
  const { groupBank, plantedItems, buyItem } = useStudy()
  const [shopOpen, setShopOpen] = useState(false)

  return (
    <section aria-labelledby="garden-heading">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            id="garden-heading"
            className="font-serif text-xl font-bold text-foreground"
          >
            
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Posadite cvetove i dodajte životinjice.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShopOpen(true)}
          className="relative z-30 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.04] active:scale-95"
          style={{
            background: "linear-gradient(135deg,#f59e0b,#ef4444)",
          }}
        >
          <ShoppingBag className="size-4" />
          Otvori prodavnicu
        </button>
      </div>

      <div
        className="relative h-[480px] overflow-visible rounded-3xl border border-green-300 shadow-lg"
        style={{
          background:
            "linear-gradient(180deg, #bfdbfe 0%, #93c5fd 30%, #6ee7b7 60%, #4ade80 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 85% 10%, rgba(253,224,71,0.35) 0%, transparent 60%)",
            }}
          />
          <Clouds />
          <GrassStrip />
        </div>

        <SunDecoration />

        {plantedItems.length > 0 && (
          <div className="absolute left-6 top-6 z-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-white/75 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
              <Sprout className="size-3.5" />
              Nivo bašte: {Math.floor(plantedItems.length / 5) + 1}
              <span>·</span>
              Posađeno
              <span className="font-bold text-emerald-900">
                {plantedItems.length}
              </span>
              biljaka
            </div>
          </div>
        )}

        {plantedItems.length === 0 ? (
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/60 shadow-md backdrop-blur-sm">
              <Sprout className="size-8 text-emerald-700" />
            </div>

            <p className="font-serif text-lg font-semibold text-emerald-900 drop-shadow-sm">
              Bašta je još prazna
            </p>

            <p className="max-w-xs text-sm text-emerald-800/80">
              Otvori prodavnicu i iskoristi zajednički novac da posadiš prvi
              cvet ili drvo.
            </p>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-9 z-10 px-6">
            <div className="grid grid-cols-3 items-end gap-x-4 gap-y-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
              {plantedItems.map((item) => (
                <GardenItemCard key={item.instanceId} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {shopOpen && (
        <ShopModal
          onClose={() => setShopOpen(false)}
          bank={groupBank}
          onBuy={buyItem}
        />
      )}
    </section>
  )
}

function ShopModal({
  onClose,
  bank,
  onBuy,
}: {
  onClose: () => void
  bank: number
  onBuy: (item: ShopItem, note?: string) => Promise<boolean>
}) {
  const [tab, setTab] = useState<ShopCategory>("plant")
  const [note, setNote] = useState("")
  const [pendingItem, setPendingItem] = useState<ShopItem | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)

  const items = tab === "plant" ? PLANTS : ANIMALS

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", closeOnEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", closeOnEscape)
      document.body.style.overflow = ""
    }
  }, [onClose])

  async function handleConfirm() {
    if (!pendingItem || buying) return

    setBuying(true)

    try {
      const successful = await onBuy(pendingItem, note)

      if (successful) {
        setFlash(
          `${pendingItem.name} je ${
            pendingItem.category === "plant" ? "posađena" : "dovedena"
          }!`,
        )
        setPendingItem(null)
        setNote("")
        window.setTimeout(() => setFlash(null), 2500)
      }
    } finally {
      setBuying(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Prodavnica bašte"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b border-amber-100 px-5 py-4"
          style={{
            background: "linear-gradient(135deg,#fef9c3,#fef3c7)",
          }}
        >
          <div>
            <h4 className="font-serif text-xl font-bold text-amber-900">
              Prodavnica 
            </h4>

            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-amber-700">
              <Coins className="size-4 text-amber-500" />
              Dostupno u kasi:{" "}
              <span className="font-semibold text-amber-900">
                {bank.toLocaleString()} novčića
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-amber-700 transition-colors hover:bg-amber-100"
            aria-label="Zatvori prodavnicu"
          >
            <X className="size-5" />
          </button>
        </div>

        {flash && (
          <div className="mx-5 mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
            ✅ {flash}
          </div>
        )}

        {pendingItem && (
          <div className="mx-5 mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div
                dangerouslySetInnerHTML={{
                  __html: getItemSvg(pendingItem.id, 40),
                }}
                aria-hidden="true"
              />

              <div>
                <p className="font-semibold text-amber-900">
                  {pendingItem.name}
                </p>
                <p className="text-xs text-amber-600">
                  {pendingItem.price} novčića
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPendingItem(null)
                  setNote("")
                }}
                className="ml-auto text-amber-500 hover:text-amber-700"
                aria-label="Otkaži kupovinu"
              >
                <X className="size-4" />
              </button>
            </div>

            <label className="mb-1 block text-xs font-semibold text-amber-800">
              Porukica
              <span className="ml-1 font-normal text-amber-500">
                (opcionalno)
              </span>
            </label>

            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder='unesi porukicu, npr. "Za našu baštu!"'
              maxLength={120}
              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />

            <button
              type="button"
              onClick={handleConfirm}
              disabled={bank < pendingItem.price || buying}
              className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              }}
            >
              {buying
                ? "Kupovina..."
                : bank >= pendingItem.price
                  ? `Potvrdi kupovinu · ${pendingItem.price} novčića`
                  : "Nedovoljno novčića u kasi"}
            </button>
          </div>
        )}

        <div className="flex gap-2 border-b border-gray-100 px-5 pt-3">
          <TabButton
            active={tab === "plant"}
            onClick={() => setTab("plant")}
          >
            Biljke 
          </TabButton>

          <TabButton
            active={tab === "animal"}
            onClick={() => setTab("animal")}
          >
            Životinjice 
          </TabButton>
        </div>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {items.map((item) => {
            const affordable = bank >= item.price
            const isPending = pendingItem?.id === item.id

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                  isPending
                    ? "border-amber-300 bg-amber-50"
                    : "border-gray-100 bg-gray-50 hover:border-amber-200 hover:bg-amber-50/50"
                }`}
              >
                <div
                  className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm"
                  dangerouslySetInnerHTML={{
                    __html: getItemSvg(item.id, 40),
                  }}
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {item.english} · {item.price} 🪙
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() => setPendingItem(item)}
                  className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  style={
                    affordable
                      ? {
                          background:
                            "linear-gradient(135deg,#f59e0b,#ef4444)",
                        }
                      : { background: "#d1d5db" }
                  }
                  title={
                    affordable
                      ? undefined
                      : "Nedovoljno novčića u kasi"
                  }
                >
                  Kupi
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px rounded-t-xl border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-amber-400 text-amber-800"
          : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  )
}