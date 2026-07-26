import { createClient } from "@/lib/supabase/server"
import { CAFE_MENU } from "@/lib/cafe"
import {
  findAccountByEmail,
  members,
} from "@/lib/members"

function mapCafeGift(row: Record<string, unknown>) {
  return {
    instanceId: String(row.id),
    itemId: String(row.item_id),
    name: String(row.name),
    emoji: String(row.emoji),
    price: Number(row.price) || 0,
    givenBy: String(row.given_by_name),
    givenTo: String(row.given_to_name),
    giftNote:
      typeof row.gift_note === "string" &&
      row.gift_note.trim()
        ? row.gift_note
        : undefined,
    giftedAt: String(row.created_at),
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
      .from("cafe_gifts")
      .select(
        "id, item_id, name, emoji, price, given_by_name, given_to_name, gift_note, created_at",
      )
      .order("created_at", { ascending: true })

    if (error) {
      console.error("CAFE GET ERROR:", error)

      return Response.json(
        {
          error:
            "Pokloni iz kafeterije trenutno nisu dostupni.",
        },
        { status: 500 },
      )
    }

    return Response.json({
      gifts: (data ?? []).map((row) =>
        mapCafeGift(row),
      ),
    })
  } catch (error) {
    console.error("CAFE GET UNEXPECTED ERROR:", error)

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
    const recipientId =
      typeof body?.recipientId === "string"
        ? body.recipientId
        : ""
    const giftNote =
      typeof body?.giftNote === "string"
        ? body.giftNote.slice(0, 160)
        : null

    const item = CAFE_MENU.find(
      (menuItem) => menuItem.id === itemId,
    )

    if (!item) {
      return Response.json(
        { error: "Izabrani proizvod ne postoji." },
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

    const sender = findAccountByEmail(user.email)

    if (!sender) {
      return Response.json(
        { error: "Ovaj nalog nije član grupe." },
        { status: 403 },
      )
    }

    const recipient =
      recipientId === "self"
        ? sender
        : members.find(
            (member) => member.id === recipientId,
          )

    if (!recipient) {
      return Response.json(
        { error: "Izabrana osoba ne postoji." },
        { status: 400 },
      )
    }

    const { data, error } = await supabase.rpc(
      "purchase_cafe_gift",
      {
        p_item_id: item.id,
        p_name: item.name,
        p_emoji: item.emoji,
        p_price: item.price,
        p_given_by_name: sender.name,
        p_given_to_key: recipient.id,
        p_given_to_name: recipient.name,
        p_gift_note: giftNote,
      },
    )

    if (error) {
      console.error("CAFE PURCHASE ERROR:", error)

      const insufficient =
        error.message.includes("INSUFFICIENT_FUNDS")

      return Response.json(
        {
          error: insufficient
            ? "Nema dovoljno novčića u zajedničkoj kasi."
            : "Porudžbina nije uspela.",
        },
        { status: insufficient ? 409 : 500 },
      )
    }

    const { error: questError } = await supabase.rpc("record_quest_event", {
      p_user_id: user.id,
      p_event_type: "cafe",
      p_amount: 1,
    })
    if (questError) console.error("QUEST EVENT ERROR:", questError)

    return Response.json({
      ok: true,
      balance: Number(data?.balance) || 0,
      gift: mapCafeGift(data.gift),
    })
  } catch (error) {
    console.error(
      "CAFE POST UNEXPECTED ERROR:",
      error,
    )

    return Response.json(
      { error: "Greška na serveru." },
      { status: 500 },
    )
  }
}
