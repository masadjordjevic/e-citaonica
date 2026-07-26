"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  X,
  ImagePlus,
  CalendarDays,
  Trash2,
  Loader2,
} from "lucide-react"
import { useStudy } from "@/components/study-provider"
import type { Memory, MemoryCategory } from "@/lib/memories"

type NewMemoryInput = {
  file?: File
  imageUrl?: string
  caption: string
  categoryId: string
  date: string
}

export function MemoriesGallery() {
  const {
    memories,
    categories,
    currentUser,
    addMemory,
    addCategory,
    deleteMemory,
  } = useStudy()

  const [activeCategory, setActiveCategory] = useState("all")
  const [addOpen, setAddOpen] = useState(false)
  const [newCatOpen, setNewCatOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? memories
        : memories.filter((memory) => memory.categoryId === activeCategory),
    [memories, activeCategory],
  )

  const categoryById = (id: string) =>
    categories.find((category) => category.id === id)

  async function submitMemory(data: NewMemoryInput) {
    setPending(true)
    setError(null)
    try {
      const result = await addMemory(data)
      if (!result.ok) {
        setError(result.error ?? "Uspomena nije objavljena.")
        return
      }
      setAddOpen(false)
    } finally {
      setPending(false)
    }
  }

  async function submitCategory(name: string, emoji: string) {
    setPending(true)
    setError(null)
    try {
      const result = await addCategory(name, emoji)
      if (!result.ok) {
        setError(result.error ?? "Kategorija nije dodata.")
        return
      }
      setNewCatOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <section aria-labelledby="memories-heading">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="memories-heading" className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Uspomene
          </h2>
          <p className="mt-2 text-muted-foreground">
            Omiljeni trenuci i uspomene koje su podeljene sa grupom.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setError(null); setAddOpen(true) }}
          disabled={categories.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50"
        >
          <Plus className="size-4" />
          Dodaj uspomenu
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
          Sve
        </FilterChip>
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            active={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.emoji} {category.name}
          </FilterChip>
        ))}
        <button
          type="button"
          onClick={() => { setError(null); setNewCatOpen(true) }}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/60 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          <Plus className="size-3.5" />
          Nova kategorija
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-4xl border border-dashed border-border bg-card/60 p-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <ImagePlus className="size-8" />
          </div>
          <p className="font-serif text-lg font-semibold text-foreground">
            Ovde još nema uspomena
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Klikni na „Dodaj uspomenu“ i podeli prvi trenutak sa devojkama.
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {filtered.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              category={categoryById(memory.categoryId)}
              onDelete={deleteMemory}
            />
          ))}
        </div>
      )}

      {addOpen && (
        <AddMemoryModal
          categories={categories}
          author={currentUser?.name ?? "Neko"}
          pending={pending}
          error={error}
          onClose={() => { if (!pending) { setAddOpen(false); setError(null) } }}
          onSubmit={submitMemory}
        />
      )}

      {newCatOpen && (
        <NewCategoryModal
          pending={pending}
          error={error}
          onClose={() => { if (!pending) { setNewCatOpen(false); setError(null) } }}
          onSubmit={submitCategory}
        />
      )}
    </section>
  )
}

function FilterChip({
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
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  )
}

function MemoryCard({
  memory,
  category,
  onDelete,
}: {
  memory: Memory
  category?: MemoryCategory
  onDelete: (memoryId: string) => Promise<boolean>
}) {
  const [deleting, setDeleting] = useState(false)
  const formattedDate = new Date(`${memory.date}T12:00:00`).toLocaleDateString("sr-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  async function handleDelete() {
    if (!window.confirm("Da li želiš da obrišeš ovu uspomenu?")) return
    setDeleting(true)
    try {
      await onDelete(memory.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <figure className="break-inside-avoid overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="relative">
        <img
          src={memory.imageUrl || "/placeholder.svg"}
          alt={memory.caption}
          loading="lazy"
          className="w-full object-cover"
        />

        {category && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            {category.emoji} {category.name}
          </span>
        )}

        {memory.canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-card/90 text-destructive shadow-sm backdrop-blur transition hover:bg-card disabled:opacity-60"
            aria-label="Obriši uspomenu"
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </button>
        )}
      </div>

      <figcaption className="flex flex-col gap-2 p-4">
        <p className="font-medium leading-relaxed text-foreground">{memory.caption}</p>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formattedDate}
          </span>
          <span className="font-semibold text-primary">
            Objavila: {memory.author}
          </span>
        </div>
      </figcaption>
    </figure>
  )
}

function AddMemoryModal({
  categories,
  author,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  categories: MemoryCategory[]
  author: string
  pending: boolean
  error: string | null
  onClose: () => void
  onSubmit: (data: NewMemoryInput) => Promise<void>
}) {
  const [file, setFile] = useState<File | undefined>()
  const [imageUrl, setImageUrl] = useState("")
  const [preview, setPreview] = useState("")
  const [caption, setCaption] = useState("")
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview)
    const url = URL.createObjectURL(selected)
    setFile(selected)
    setImageUrl("")
    setPreview(url)
  }

  function handleUrl(value: string) {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview)
    setFile(undefined)
    setImageUrl(value)
    setPreview(value)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (pending || !caption.trim() || !categoryId || (!file && !imageUrl.trim())) return

    await onSubmit({
      file,
      imageUrl: imageUrl.trim() || undefined,
      caption: caption.trim(),
      categoryId,
      date,
    })
  }

  return (
    <ModalShell title="Dodaj uspomenu" onClose={onClose} closeDisabled={pending}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/50">
          {preview ? (
            <img src={preview} alt="Pregled fotografije" className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImagePlus className="size-8" />
              <span className="text-sm">Pregled fotografije</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="mem-url" className="mb-1.5 block text-sm font-semibold text-foreground">
            Link fotografije (URL)
          </label>
          <input
            id="mem-url"
            type="url"
            value={imageUrl}
            onChange={(event) => handleUrl(event.target.value)}
            disabled={pending}
            placeholder="https://..."
            className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          />
          <div className="mt-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
              <ImagePlus className="size-4" />
              Otpremi sa uređaja
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFile}
                disabled={pending}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Najviše 8 MB. Dozvoljeni su JPG, PNG, WEBP i GIF.
          </p>
        </div>

        <div>
          <label htmlFor="mem-caption" className="mb-1.5 block text-sm font-semibold text-foreground">
            Opis
          </label>
          <textarea
            id="mem-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            disabled={pending}
            rows={2}
            maxLength={500}
            placeholder="Napiši nešto o ovom trenutku..."
            className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="mem-cat" className="mb-1.5 block text-sm font-semibold text-foreground">
              Kategorija
            </label>
            <select
              id="mem-cat"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={pending}
              className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.emoji} {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mem-date" className="mb-1.5 block text-sm font-semibold text-foreground">
              Datum
            </label>
            <input
              id="mem-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={pending}
              className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Biće objavljeno kao <span className="font-semibold text-foreground">{author}</span>.
        </p>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !caption.trim() || !categoryId || (!file && !imageUrl.trim())}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? "Otpremanje..." : "Objavi uspomenu"}
        </button>
      </form>
    </ModalShell>
  )
}

function NewCategoryModal({
  pending,
  error,
  onClose,
  onSubmit,
}: {
  pending: boolean
  error: string | null
  onClose: () => void
  onSubmit: (name: string, emoji: string) => Promise<void>
}) {
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || pending) return
    await onSubmit(name, emoji)
  }

  return (
    <ModalShell title="Nova kategorija" onClose={onClose} closeDisabled={pending}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="cat-emoji" className="mb-1.5 block text-sm font-semibold text-foreground">
            Emoji
          </label>
          <input
            id="cat-emoji"
            type="text"
            value={emoji}
            onChange={(event) => setEmoji(event.target.value)}
            disabled={pending}
            maxLength={8}
            placeholder="✨"
            className="w-24 rounded-2xl border border-input bg-background px-4 py-2.5 text-center text-2xl outline-none"
          />
        </div>

        <div>
          <label htmlFor="cat-name" className="mb-1.5 block text-sm font-semibold text-foreground">
            Naziv kategorije
          </label>
          <input
            id="cat-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={pending}
            maxLength={50}
            placeholder="npr. Putovanja"
            className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-foreground outline-none"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!name.trim() || pending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? "Dodavanje..." : "Dodaj kategoriju"}
        </button>
      </form>
    </ModalShell>
  )
}

function ModalShell({
  title,
  onClose,
  closeDisabled = false,
  children,
}: {
  title: string
  onClose: () => void
  closeDisabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => { if (!closeDisabled) onClose() }}
    >
      <div
        className="flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h4 className="font-serif text-xl font-bold text-foreground">{title}</h4>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Zatvori"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
