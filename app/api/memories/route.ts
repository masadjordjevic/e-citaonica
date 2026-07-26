import { createClient } from "@/lib/supabase/server"
import { findAccountByEmail } from "@/lib/members"

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

type MemoryRow = {
  id: string
  image_path: string | null
  external_image_url: string | null
  caption: string
  category_id: string
  memory_date: string
  author_user_id: string
  author_name: string
  created_at: string
}

async function mapMemory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: MemoryRow,
  currentUserId: string,
) {
  let imageUrl = row.external_image_url || "/placeholder.svg"

  if (row.image_path) {
    const { data } = await supabase.storage
      .from("memories")
      .createSignedUrl(row.image_path, 3600)

    if (data?.signedUrl) imageUrl = data.signedUrl
  }

  return {
    id: row.id,
    imageUrl,
    caption: row.caption,
    categoryId: row.category_id,
    date: row.memory_date,
    author: row.author_name,
    authorUserId: row.author_user_id,
    createdAt: row.created_at,
    canDelete: row.author_user_id === currentUserId,
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Nisi prijavljena." }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("memories")
    .select("id, image_path, external_image_url, caption, category_id, memory_date, author_user_id, author_name, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("MEMORIES GET ERROR:", error)
    return Response.json({ error: "Uspomene trenutno nisu dostupne." }, { status: 500 })
  }

  const memories = await Promise.all(
    (data ?? []).map((row) => mapMemory(supabase, row as MemoryRow, user.id)),
  )

  return Response.json({ memories })
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 500)
  const categoryId = String(formData.get("categoryId") ?? "").trim()
  const date = String(formData.get("date") ?? "").trim()
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null
  const fileValue = formData.get("file")
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null

  if (!caption || !categoryId || !date) {
    return Response.json(
      { error: "Opis, kategorija i datum su obavezni." },
      { status: 400 },
    )
  }

  if (!file && !imageUrl) {
    return Response.json({ error: "Dodaj fotografiju ili njen URL." }, { status: 400 })
  }

  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return Response.json({ error: "Link fotografije nije ispravan." }, { status: 400 })
  }

  if (file && (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE)) {
    return Response.json(
      { error: "Dozvoljeni su JPG, PNG, WEBP i GIF fajlovi do 8 MB." },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return Response.json({ error: "Nisi prijavljena." }, { status: 401 })
  }

  const member = findAccountByEmail(user.email)
  if (!member) {
    return Response.json({ error: "Ovaj nalog nije član grupe." }, { status: 403 })
  }

  const { data: category } = await supabase
    .from("memory_categories")
    .select("id")
    .eq("id", categoryId)
    .maybeSingle()

  if (!category) {
    return Response.json({ error: "Izabrana kategorija ne postoji." }, { status: 400 })
  }

  let imagePath: string | null = null

  if (file) {
    const extension = file.name.split(".").pop()?.toLowerCase()
      || file.type.split("/").pop()
      || "jpg"
    imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from("memories")
      .upload(imagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("MEMORY IMAGE UPLOAD ERROR:", uploadError)
      return Response.json({ error: "Fotografija nije otpremljena." }, { status: 500 })
    }
  }

  const { data, error } = await supabase
    .from("memories")
    .insert({
      image_path: imagePath,
      external_image_url: imagePath ? null : imageUrl,
      caption,
      category_id: categoryId,
      memory_date: date,
      author_user_id: user.id,
      author_name: member.name,
    })
    .select("id, image_path, external_image_url, caption, category_id, memory_date, author_user_id, author_name, created_at")
    .single()

  if (error) {
    console.error("MEMORY POST ERROR:", error)
    if (imagePath) {
      await supabase.storage.from("memories").remove([imagePath])
    }
    return Response.json({ error: "Uspomena nije objavljena." }, { status: 500 })
  }

  return Response.json({
    ok: true,
    memory: await mapMemory(supabase, data as MemoryRow, user.id),
  })
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null)
  const memoryId = typeof body?.memoryId === "string" ? body.memoryId : ""

  if (!memoryId) {
    return Response.json({ error: "Nedostaje ID uspomene." }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Nisi prijavljena." }, { status: 401 })
  }

  const { data: memory } = await supabase
    .from("memories")
    .select("id, image_path, author_user_id")
    .eq("id", memoryId)
    .maybeSingle()

  if (!memory) {
    return Response.json({ error: "Uspomena ne postoji." }, { status: 404 })
  }

  if (memory.author_user_id !== user.id) {
    return Response.json(
      { error: "Možeš obrisati samo svoju uspomenu." },
      { status: 403 },
    )
  }

  const { error } = await supabase.from("memories").delete().eq("id", memoryId)

  if (error) {
    console.error("MEMORY DELETE ERROR:", error)
    return Response.json({ error: "Uspomena nije obrisana." }, { status: 500 })
  }

  if (memory.image_path) {
    await supabase.storage.from("memories").remove([memory.image_path])
  }

  return Response.json({ ok: true })
}
