// Kafeterija kod Jove – meni i sistem poklona

export type CafeGift = {
  instanceId: string
  itemId: string
  name: string
  emoji: string
  price: number
  givenBy: string
  givenTo: string
  giftNote?: string
  giftedAt: string
}

export type CafeMenuItem = {
  id: string
  name: string
  emoji: string
  description: string
  price: number
}

export const CAFE_MENU: CafeMenuItem[] = [
  {
    id: "coffee",
    name: "Kafa",
    emoji: "☕",
    description: "Klasična topla kafa sa ili bez mleka",
    price: 60,
  },
  {
    id: "tea",
    name: "Čaj",
    emoji: "🫖",
    description: "Crni čaj sa limunom i medom",
    price: 40,
  },
  {
    id: "croissant",
    name: "Kroasan",
    emoji: "🥐",
    description: "Puter-kroasan",
    price: 80,
  },
  {
    id: "cookie",
    name: "Cookie",
    emoji: "🍪",
    description: "Cookie sa komadićima čokolade",
    price: 55,
  },
  {
    id: "juice",
    name: "Sok",
    emoji: "🧃",
    description: "Ceđeni voćni sok",
    price: 55,
  },
  {
    id: "cake",
    name: "Parče torte",
    emoji: "🍰",
    description: "Mašina torta sa jagodama i čokoladom",
    price: 90,
  },
  {
    id: "chocolate",
    name: "Čokolada",
    emoji: "🍫",
    description: "Crna čokolada sa lešnicima",
    price: 70,
  },
  {
    id: "donut",
    name: "Krofna",
    emoji: "🍩",
    description: "Krofna sa cokoladnim prelivom",
    price: 55,
  },
  {
    id: "sandwich",
    name: "Sendvič",
    emoji: "🥪",
    description: "Tost sendvič sa sirom i šunkom",
    price: 90,
  },
  {
    id: "apple",
    name: "Jabuka",
    emoji: "🍎",
    description: "Sveža jabuka",
    price: 25,
  },
]
