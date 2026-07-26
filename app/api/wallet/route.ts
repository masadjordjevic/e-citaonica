import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json(
        { error: "Nisi prijavljena." },
        { status: 401 },
      )
    }

    const { data, error } = await supabase
      .from("group_wallet")
      .select("balance")
      .eq("id", 1)
      .single()

    if (error) {
      console.error("WALLET GET ERROR:", error)

      return Response.json(
        { error: "Zajednička kasa nije dostupna." },
        { status: 500 },
      )
    }

    return Response.json({
      balance:
        typeof data.balance === "number"
          ? data.balance
          : Number(data.balance) || 0,
    })
  } catch (error) {
    console.error("WALLET UNEXPECTED ERROR:", error)

    return Response.json(
      { error: "Greška na serveru." },
      { status: 500 },
    )
  }
}
