import { createClient } from "@/lib/supabase/server"

function makeCategoryId(name: string) {
  const slug = name
    .trim()
    .toLocaleLowerCase("sr-Latn")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)

  return `${slug || "kategorija"}-${crypto.randomUUID().slice(0, 8)}`
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Nisi prijavljena." }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("memory_categories")
    .select("id, name, emoji")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("MEMORY CATEGORIES GET ERROR:", error)
    return Response.json({ error: "Kategorije trenutno nisu dostupne." }, { status: 500 })
  }

  return Response.json({ categories: data ?? [] })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 50) : ""
  const emoji = typeof body?.emoji === "string" && body.emoji.trim()
    ? body.emoji.trim().slice(0, 8)
    : "✨"

  if (!name) {
    return Response.json({ error: "Unesi naziv kategorije." }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Nisi prijavljena." }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("memory_categories")
    .insert({
      id: makeCategoryId(name),
      name,
      emoji,
      created_by: user.id,
    })
    .select("id, name, emoji")
    .single()

  if (error) {
    console.error("MEMORY CATEGORY POST ERROR:", error)
    return Response.json({ error: "Kategorija nije dodata." }, { status: 500 })
  }

  return Response.json({ ok: true, category: data })
}
