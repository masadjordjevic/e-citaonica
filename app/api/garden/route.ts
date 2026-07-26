import { createClient } from "@/lib/supabase/server"
import {
  SHOP_ITEMS,
  type ShopCategory,
} from "@/lib/garden"
import { findAccountByEmail } from "@/lib/members"

function mapGardenItem(row: Record<string, unknown>) {
  return {
    instanceId: String(row.id),
    itemId: String(row.item_id),
    name: String(row.name),
    emoji: String(row.emoji),
    category: row.category as ShopCategory,
    boughtBy: String(row.bought_by_name),
    note:
      typeof row.note === "string" && row.note.trim()
        ? row.note
        : undefined,
    plantedAt: String(row.created_at),
  }
}

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
      .from("garden_items")
      .select(
        "id, item_id, name, emoji, category, bought_by_name, note, created_at",
      )
      .order("created_at", { ascending: true })

    if (error) {
      console.error("GARDEN GET ERROR:", error)

      return Response.json(
        { error: "Bašta trenutno nije dostupna." },
        { status: 500 },
      )
    }

    return Response.json({
      items: (data ?? []).map((row) =>
        mapGardenItem(row),
      ),
    })
  } catch (error) {
    console.error("GARDEN GET UNEXPECTED ERROR:", error)

    return Response.json(
      { error: "Greška na serveru." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const itemId =
      typeof body?.itemId === "string"
        ? body.itemId
        : ""
    const note =
      typeof body?.note === "string"
        ? body.note.slice(0, 120)
        : null

    const item = SHOP_ITEMS.find(
      (shopItem) => shopItem.id === itemId,
    )

    if (!item) {
      return Response.json(
        { error: "Izabrani predmet ne postoji." },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
      return Response.json(
        { error: "Nisi prijavljena." },
        { status: 401 },
      )
    }

    const member = findAccountByEmail(user.email)

    if (!member) {
      return Response.json(
        { error: "Ovaj nalog nije član grupe." },
        { status: 403 },
      )
    }

    const { data, error } = await supabase.rpc(
      "purchase_garden_item",
      {
        p_item_id: item.id,
        p_name: item.name,
        p_emoji: item.emoji,
        p_category: item.category,
        p_price: item.price,
        p_bought_by_name: member.name,
        p_note: note,
      },
    )

    if (error) {
      console.error("GARDEN PURCHASE ERROR:", error)

      const insufficient =
        error.message.includes("INSUFFICIENT_FUNDS")

      return Response.json(
        {
          error: insufficient
            ? "Nema dovoljno novčića u zajedničkoj kasi."
            : "Kupovina nije uspela.",
        },
        { status: insufficient ? 409 : 500 },
      )
    }

    const { error: questError } = await supabase.rpc("record_quest_event", {
      p_user_id: user.id,
      p_event_type: "garden",
      p_amount: 1,
    })
    if (questError) console.error("QUEST EVENT ERROR:", questError)

    return Response.json({
      ok: true,
      balance: Number(data?.balance) || 0,
      item: mapGardenItem(data.item),
    })
  } catch (error) {
    console.error(
      "GARDEN POST UNEXPECTED ERROR:",
      error,
    )

    return Response.json(
      { error: "Greška na serveru." },
      { status: 500 },
    )
  }
}
