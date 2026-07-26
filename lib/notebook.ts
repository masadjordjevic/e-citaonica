// Zajednička beležnica - Collaborative group notebook

export type NotebookSubject = {
  id: string
  name: string // e.g., "Baze Podataka", "Verovatnoća"
  emoji: string // e.g., "📊", "🎲"
  notes: NotebookNote[]
}

export type NotebookNote = {
  id: string
  title: string
  content: string // Markdown-like text
  author: string // Member name who created this note
  createdAt: string // ISO timestamp
  tags: string[] // e.g., ["definicija", "ključno"]
  exam?: {
    subject: string
    date: string // ISO date
    importance: "low" | "medium" | "high"
  }
}

export type NotebookChecklist = {
  id: string
  title: string
  items: ChecklistItem[]
  subjectId: string
  createdBy: string
  createdAt: string
}

export type ChecklistItem = {
  id: string
  text: string
  completed: boolean
  completedBy?: string // Member name if they checked it off
  completedAt?: string // ISO timestamp
}

// Default subjects for the notebook - empty, members add notes as they go
export function getDefaultNotebookSubjects(): NotebookSubject[] {
  return [
    {
      id: "subject-bd",
      name: "Baze Podataka",
      emoji: "📊",
      notes: [],
    },
    {
      id: "subject-verovatnoća",
      name: "Verovatnoća i Statistika",
      emoji: "🎲",
      notes: [],
    },
    {
      id: "subject-linearna",
      name: "Linearna Algebra",
      emoji: "📐",
      notes: [],
    },
    {
      id: "subject-analiza",
      name: "Matematička Analiza",
      emoji: "📈",
      notes: [],
    },
  ]
}
