import { createClient } from "@/lib/supabase/server"
import { findAccountByEmail } from "@/lib/members"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json(
      { error: "Nisi prijavljena." },
      { status: 401 },
    )
  }

  const { data: subjects, error } = await supabase
    .from("notebook_subjects")
    .select(
      "id,name,emoji,created_by,created_at,notebook_notes(id,user_id,author_name,title,content,created_at)",
    )
    .order("created_at", { ascending: true })

  if (error) {
    console.error(error)
    return Response.json(
      { error: "Beležnica nije dostupna." },
      { status: 500 },
    )
  }

  return Response.json({
    subjects: (subjects ?? []).map((subject: any) => ({
      id: subject.id,
      name: subject.name,
      emoji: subject.emoji,
      isOwn: subject.created_by === user.id,
      notes: (subject.notebook_notes ?? [])
        .sort((a: any, b: any) =>
          b.created_at.localeCompare(a.created_at),
        )
        .map((note: any) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          author: note.author_name,
          createdAt: note.created_at,
          isOwn: note.user_id === user.id,
        })),
    })),
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return Response.json(
      { error: "Nisi prijavljena." },
      { status: 401 },
    )
  }

  const member = findAccountByEmail(user.email)

  if (!member) {
    return Response.json(
      { error: "Nalog nije član grupe." },
      { status: 403 },
    )
  }

  const body = await request.json()
  const action = String(body.action ?? "addNote")

  if (action === "createSubject") {
    const name = String(body.name ?? "").trim()
    const emoji = String(body.emoji ?? "").trim() || "📘"

    if (!name) {
      return Response.json(
        { error: "Unesi naziv predmeta." },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("notebook_subjects")
      .insert({
        name: name.slice(0, 100),
        emoji: emoji.slice(0, 8),
        created_by: user.id,
      })
      .select("id,name,emoji")
      .single()

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          { error: "Predmet sa tim nazivom već postoji." },
          { status: 409 },
        )
      }

      console.error(error)
      return Response.json(
        { error: "Predmet nije dodat." },
        { status: 500 },
      )
    }

    return Response.json(
      { subject: data },
      { status: 201 },
    )
  }

  if (action === "addNote") {
    const subjectId = String(body.subjectId ?? "")
    const title = String(body.title ?? "").trim()
    const content = String(body.content ?? "").trim()

    if (!subjectId || !title || !content) {
      return Response.json(
        {
          error:
            "Izaberi predmet i popuni naslov i sadržaj.",
        },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("notebook_notes")
      .insert({
        subject_id: subjectId,
        user_id: user.id,
        author_name: member.name,
        title: title.slice(0, 150),
        content: content.slice(0, 10000),
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return Response.json(
        { error: "Napomena nije sačuvana." },
        { status: 500 },
      )
    }

    return Response.json(
      { note: data },
      { status: 201 },
    )
  }

  return Response.json(
    { error: "Nepoznata akcija." },
    { status: 400 },
  )
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json(
      { error: "Nisi prijavljena." },
      { status: 401 },
    )
  }

  const body = await request.json()
  const type = String(body.type ?? "note")
  const id = String(body.id ?? "")

  if (!id) {
    return Response.json(
      { error: "Nedostaje ID." },
      { status: 400 },
    )
  }

  if (type === "note") {
    const { error } = await supabase
      .from("notebook_notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return Response.json(
        { error: "Napomena nije obrisana." },
        { status: 500 },
      )
    }

    return Response.json({ ok: true })
  }

  if (type === "subject") {
    const { count } = await supabase
      .from("notebook_notes")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("subject_id", id)

    if ((count ?? 0) > 0) {
      return Response.json(
        {
          error:
            "Kategorija sadrži napomene. Prvo obriši napomene.",
        },
        { status: 409 },
      )
    }

    const { error } = await supabase
      .from("notebook_subjects")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id)

    if (error) {
      return Response.json(
        { error: "Kategorija nije obrisana." },
        { status: 500 },
      )
    }

    return Response.json({ ok: true })
  }

  return Response.json(
    { error: "Nepoznat tip brisanja." },
    { status: 400 },
  )
}
