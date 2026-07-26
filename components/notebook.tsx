"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  BookPlus,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type NotebookNote = {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  isOwn: boolean
}

type NotebookSubject = {
  id: string
  name: string
  emoji: string
  isOwn: boolean
  notes: NotebookNote[]
}

export function Notebook() {
  const [subjects, setSubjects] = useState<NotebookSubject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [subjectName, setSubjectName] = useState("")
  const [subjectEmoji, setSubjectEmoji] = useState("📘")
  const [subjectFormOpen, setSubjectFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingNote, setSavingNote] = useState(false)
  const [savingSubject, setSavingSubject] = useState(false)
  const [error, setError] = useState("")

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId],
  )

  const loadNotebook = useCallback(async () => {
    try {
      const response = await fetch("/api/notebook", {
        cache: "no-store",
      })
      const payload = await response.json()

      if (!response.ok) {
        setError(payload?.error ?? "Beležnica nije dostupna.")
        return
      }

      const nextSubjects = Array.isArray(payload.subjects)
        ? payload.subjects
        : []

      setSubjects(nextSubjects)
      setSelectedSubjectId((current) => {
        if (
          current &&
          nextSubjects.some(
            (subject: NotebookSubject) => subject.id === current,
          )
        ) {
          return current
        }

        return nextSubjects[0]?.id ?? ""
      })
      setError("")
    } catch {
      setError("Backend za beležnicu nije dostupan.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotebook()
  }, [loadNotebook])

  // Promene drugih članova odmah osvežavaju kategorije i napomene.
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("shared-notebook")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notebook_subjects",
        },
        loadNotebook,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notebook_notes",
        },
        loadNotebook,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadNotebook])

  async function createSubject() {
    const name = subjectName.trim()

    if (!name || savingSubject) return

    setSavingSubject(true)
    setError("")

    try {
      const response = await fetch("/api/notebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createSubject",
          name,
          emoji: subjectEmoji.trim() || "📘",
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setError(payload?.error ?? "Predmet nije dodat.")
        return
      }

      setSubjectName("")
      setSubjectEmoji("📘")
      setSubjectFormOpen(false)
      await loadNotebook()
      setSelectedSubjectId(payload.subject.id)
    } catch {
      setError("Predmet nije dodat.")
    } finally {
      setSavingSubject(false)
    }
  }

  async function addNote() {
    if (
      !selectedSubjectId ||
      !noteTitle.trim() ||
      !noteContent.trim() ||
      savingNote
    ) {
      return
    }

    setSavingNote(true)
    setError("")

    try {
      const response = await fetch("/api/notebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addNote",
          subjectId: selectedSubjectId,
          title: noteTitle.trim(),
          content: noteContent.trim(),
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setError(payload?.error ?? "Napomena nije sačuvana.")
        return
      }

      setNoteTitle("")
      setNoteContent("")
      await loadNotebook()
    } catch {
      setError("Napomena nije sačuvana.")
    } finally {
      setSavingNote(false)
    }
  }

  async function deleteNote(noteId: string) {
    const confirmed = window.confirm(
      "Da li sigurno želiš da obrišeš ovu napomenu?",
    )
    if (!confirmed) return

    const response = await fetch("/api/notebook", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "note",
        id: noteId,
      }),
    })

    const payload = await response.json()

    if (!response.ok) {
      setError(payload?.error ?? "Napomena nije obrisana.")
      return
    }

    await loadNotebook()
  }

  async function deleteSubject(subjectId: string) {
    const confirmed = window.confirm(
      "Obrisati ovu kategoriju? Kategorija može da se obriše samo kada nema napomena.",
    )
    if (!confirmed) return

    const response = await fetch("/api/notebook", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "subject",
        id: subjectId,
      }),
    })

    const payload = await response.json()

    if (!response.ok) {
      setError(payload?.error ?? "Kategorija nije obrisana.")
      return
    }

    await loadNotebook()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Učitavanje beležnice...
      </div>
    )
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Zajednički notebook
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
          
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSubjectFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.03]"
        >
          <BookPlus className="size-4" />
          Dodaj predmet
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <BookPlus className="size-8 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-bold">
            Još nema predmeta
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Klikni na „Dodaj predmet“, napravi kategoriju, a zatim u nju
            sačuvaj napomene.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <aside className="space-y-2">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="font-serif text-lg font-bold">Predmeti</h3>
              <span className="text-xs text-muted-foreground">
                {subjects.length}
              </span>
            </div>

            {subjects.map((subject) => (
              <div
                key={subject.id}
                className={`flex items-center gap-2 rounded-xl border transition-colors ${
                  selectedSubjectId === subject.id
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card hover:bg-accent/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3 text-left"
                >
                  <span>{subject.emoji}</span>
                  <span className="truncate font-semibold">
                    {subject.name}
                  </span>
                  <span className="ml-auto text-xs opacity-70">
                    {subject.notes.length}
                  </span>
                </button>

                {subject.isOwn && subject.notes.length === 0 && (
                  <button
                    type="button"
                    onClick={() => deleteSubject(subject.id)}
                    className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
                    title="Obriši praznu kategoriju"
                    aria-label={`Obriši ${subject.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </aside>

          <div className="lg:col-span-2">
            {selectedSubject && (
              <>
                <div className="mb-5">
                  <h2 className="font-serif text-2xl font-bold">
                    {selectedSubject.emoji} {selectedSubject.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedSubject.notes.length === 1
                      ? "1 napomena"
                      : `${selectedSubject.notes.length} napomena`}
                  </p>
                </div>

                <div className="mb-6 space-y-3">
                  {selectedSubject.notes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      Ova kategorija još nema napomena.
                    </div>
                  ) : (
                    selectedSubject.notes.map((note) => (
                      <article
                        key={note.id}
                        className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-foreground">
                            {note.title}
                          </h3>

                          {note.isOwn && (
                            <button
                              type="button"
                              onClick={() => deleteNote(note.id)}
                              className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-600"
                              aria-label="Obriši napomenu"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                          {note.content}
                        </p>

                        <p className="mt-3 text-xs text-muted-foreground">
                          {note.author} ·{" "}
                          {new Date(note.createdAt).toLocaleDateString(
                            "sr-RS",
                          )}
                        </p>
                      </article>
                    ))
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-4 flex items-center gap-2 font-bold">
                    <Plus className="size-4" />
                    Nova napomena
                  </h3>

                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(event) =>
                      setNoteTitle(event.target.value)
                    }
                    placeholder="Naslov"
                    maxLength={150}
                    className="mb-3 w-full rounded-xl border border-border bg-background p-3"
                  />

                  <textarea
                    value={noteContent}
                    onChange={(event) =>
                      setNoteContent(event.target.value)
                    }
                    placeholder="Sadržaj"
                    maxLength={10000}
                    className="mb-3 h-36 w-full resize-y rounded-xl border border-border bg-background p-3"
                  />

                  <button
                    type="button"
                    onClick={addNote}
                    disabled={
                      savingNote ||
                      !noteTitle.trim() ||
                      !noteContent.trim()
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingNote && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    Sačuvaj
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {subjectFormOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={() => setSubjectFormOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold">
                  Novi predmet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Predmet će postati nova kategorija u beležnici.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSubjectFormOpen(false)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Zatvori"
              >
                <X className="size-5" />
              </button>
            </div>

            <label className="mb-1 block text-sm font-semibold">
              Ikonica
            </label>
            <input
              type="text"
              value={subjectEmoji}
              onChange={(event) =>
                setSubjectEmoji(event.target.value.slice(0, 8))
              }
              className="mb-4 w-full rounded-xl border border-border bg-background p-3"
              placeholder="📘"
            />

            <label className="mb-1 block text-sm font-semibold">
              Naziv predmeta
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(event) =>
                setSubjectName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") createSubject()
              }}
              maxLength={100}
              className="w-full rounded-xl border border-border bg-background p-3"
              placeholder="npr. Numerička analiza"
              autoFocus
            />

            <button
              type="button"
              onClick={createSubject}
              disabled={savingSubject || !subjectName.trim()}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50"
            >
              {savingSubject && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Napravi kategoriju
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
