import { createClient } from "@/lib/supabase/server"
import { findAccountByEmail } from "@/lib/members"

type ReactionDetails = {
  count: number
  users: string[]
  reactedByCurrentUser: boolean
}

type ReactionRow = {
  message_id: string
  user_id: string
  reactor_name: string
  emoji: string
}

function formatReactions(
  reactions: ReactionRow[],
  currentUserId: string,
): Record<string, ReactionDetails> {
  const result: Record<string, ReactionDetails> = {}

  for (const reaction of reactions) {
    if (!result[reaction.emoji]) {
      result[reaction.emoji] = {
        count: 0,
        users: [],
        reactedByCurrentUser: false,
      }
    }

    result[reaction.emoji].count += 1
    result[reaction.emoji].users.push(reaction.reactor_name)

    if (reaction.user_id === currentUserId) {
      result[reaction.emoji].reactedByCurrentUser = true
    }
  }

  return result
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

    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("id, user_id, author_name, message_text, created_at")
      .order("created_at", { ascending: true })
      .limit(200)

    if (messagesError) {
      console.error("CHAT GET ERROR:", messagesError)

      return Response.json(
        { error: "Poruke trenutno nisu dostupne." },
        { status: 500 },
      )
    }

    const messageIds = (messages ?? []).map((message) => message.id)

    let reactions: ReactionRow[] = []

    if (messageIds.length > 0) {
      const { data, error: reactionsError } = await supabase
        .from("chat_reactions")
        .select("message_id, user_id, reactor_name, emoji")
        .in("message_id", messageIds)

      if (reactionsError) {
        console.error("CHAT REACTIONS GET ERROR:", reactionsError)

        return Response.json(
          { error: "Reakcije trenutno nisu dostupne." },
          { status: 500 },
        )
      }

      reactions = (data ?? []) as ReactionRow[]
    }

    return Response.json({
      messages: (messages ?? []).map((message) => {
        const messageReactions = reactions.filter(
          (reaction) => reaction.message_id === message.id,
        )

        return {
          id: message.id,
          author: message.author_name,
          text: message.message_text,
          timestamp: message.created_at,
          reactions: formatReactions(messageReactions, user.id),
          isOwnMessage: message.user_id === user.id,
        }
      }),
    })
  } catch (error) {
    console.error("CHAT GET UNEXPECTED ERROR:", error)

    return Response.json(
      { error: "Greška na serveru." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : ""

    if (!text) {
      return Response.json(
        { error: "Poruka ne može biti prazna." },
        { status: 400 },
      )
    }

    if (text.length > 1000) {
      return Response.json(
        { error: "Poruka može imati najviše 1000 karaktera." },
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

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        user_id: user.id,
        author_name: member.name,
        message_text: text,
        reactions: {},
      })
      .select("id, user_id, author_name, message_text, created_at")
      .single()

    if (error) {
      console.error("CHAT POST ERROR:", error)

      return Response.json(
        { error: "Poruka nije poslata." },
        { status: 500 },
      )
    }

    return Response.json(
      {
        message: {
          id: data.id,
          author: data.author_name,
          text: data.message_text,
          timestamp: data.created_at,
          reactions: {},
          isOwnMessage: data.user_id === user.id,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("CHAT POST UNEXPECTED ERROR:", error)

    return Response.json(
      { error: "Greška na serveru." },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    const messageId =
      typeof body?.messageId === "string"
        ? body.messageId.trim()
        : ""

    const emoji =
      typeof body?.emoji === "string"
        ? body.emoji.trim()
        : ""

    if (!messageId || !emoji) {
      return Response.json(
        { error: "Nedostaje poruka ili reakcija." },
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

    const {
      data: existingReaction,
      error: existingReactionError,
    } = await supabase
      .from("chat_reactions")
      .select("id, emoji")
      .eq("message_id", messageId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingReactionError) {
      console.error("REACTION READ ERROR:", existingReactionError)

      return Response.json(
        { error: "Reakcija nije proverena." },
        { status: 500 },
      )
    }

    if (existingReaction && existingReaction.emoji === emoji) {
      const { error: deleteError } = await supabase
        .from("chat_reactions")
        .delete()
        .eq("id", existingReaction.id)
        .eq("user_id", user.id)

      if (deleteError) {
        console.error("REACTION DELETE ERROR:", deleteError)

        return Response.json(
          { error: "Reakcija nije uklonjena." },
          { status: 500 },
        )
      }
    } else if (existingReaction) {
      const { error: updateError } = await supabase
        .from("chat_reactions")
        .update({
          emoji,
          reactor_name: member.name,
        })
        .eq("id", existingReaction.id)
        .eq("user_id", user.id)

      if (updateError) {
        console.error("REACTION UPDATE ERROR:", updateError)

        return Response.json(
          { error: "Reakcija nije promenjena." },
          { status: 500 },
        )
      }
    } else {
      const { error: insertError } = await supabase
        .from("chat_reactions")
        .insert({
          message_id: messageId,
          user_id: user.id,
          reactor_name: member.name,
          emoji,
        })

      if (insertError) {
        console.error("REACTION INSERT ERROR:", insertError)

        return Response.json(
          { error: "Reakcija nije sačuvana." },
          { status: 500 },
        )
      }
    }

    const { data: reactions, error: reactionsError } = await supabase
      .from("chat_reactions")
      .select("message_id, user_id, reactor_name, emoji")
      .eq("message_id", messageId)

    if (reactionsError) {
      console.error("REACTIONS RELOAD ERROR:", reactionsError)

      return Response.json(
        { error: "Reakcije nisu ponovo učitane." },
        { status: 500 },
      )
    }

    return Response.json({
      reactions: formatReactions(
        (reactions ?? []) as ReactionRow[],
        user.id,
      ),
    })
  } catch (error) {
    console.error("CHAT PATCH UNEXPECTED ERROR:", error)

    return Response.json(
      { error: "Greška na serveru." },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    const messageId =
      typeof body?.messageId === "string"
        ? body.messageId.trim()
        : ""

    if (!messageId) {
      return Response.json(
        { error: "Nedostaje ID poruke." },
        { status: 400 },
      )
    }

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

    const { data: message, error: readError } = await supabase
      .from("chat_messages")
      .select("id, user_id")
      .eq("id", messageId)
      .single()

    if (readError || !message) {
      return Response.json(
        { error: "Poruka nije pronađena." },
        { status: 404 },
      )
    }

    if (message.user_id !== user.id) {
      return Response.json(
        { error: "Možeš da obrišeš samo svoju poruku." },
        { status: 403 },
      )
    }

    const { error: deleteError } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("CHAT DELETE ERROR:", deleteError)

      return Response.json(
        { error: "Poruka nije obrisana." },
        { status: 500 },
      )
    }

    return Response.json({
      ok: true,
      messageId,
    })
  } catch (error) {
    console.error("CHAT DELETE UNEXPECTED ERROR:", error)

    return Response.json(
      { error: "Greška na serveru." },
      { status: 500 },
    )
  }
}
