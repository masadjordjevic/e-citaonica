import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!email || !password) {
    return Response.json({ error: "Unesi email i lozinku." }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
  console.error("SUPABASE LOGIN ERROR:", error)

  return Response.json(
    {
      error: error?.message ?? "Pogrešan email ili lozinka.",
    },
    { status: 401 },
  )
}

  return Response.json({ user: { id: data.user.id, email: data.user.email } })
}
