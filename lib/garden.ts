export type ShopCategory = "plant" | "animal"

export type ShopItem = {
  id: string
  name: string
  english: string
  price: number
  emoji: string
  category: ShopCategory
}

// A plant/animal that has been purchased and placed in the garden.
export type PlantedItem = {
  // unique instance id (multiple of the same item can exist)
  instanceId: string
  itemId: string
  name: string
  emoji: string
  category: ShopCategory
  // display name of the member who bought it
  boughtBy: string
  // optional personal note
  note?: string
  // ISO timestamp of when it was planted
  plantedAt: string
}

export const PLANTS: ShopItem[] = [
  { id: "hibiscus", name: "Ružičasti hibiskus", english: "Rosy Hibiscus", price: 100, emoji: "🌺", category: "plant" },
  { id: "sakura", name: "Japanska trešnja", english: "Cherry Blossom", price: 400, emoji: "🌸", category: "plant" },
  { id: "lily", name: "Ljiljan", english: "Lily", price: 100, emoji: "🌷", category: "plant" },
  { id: "linden", name: "Lipa", english: "Linden Tree", price: 400, emoji: "🌳", category: "plant" },
  { id: "orchid", name: "Orhideja", english: "Orchid", price: 120, emoji: "💮", category: "plant" },
  { id: "birch", name: "Breza", english: "Birch Tree", price: 300, emoji: "🌲", category: "plant" },
  { id: "yellow-tulips", name: "Žute lale", english: "Yellow Tulips", price: 60, emoji: "🌼", category: "plant" },
  { id: "pink-tulips", name: "Ružičaste lale", english: "Pink Tulips", price: 60, emoji: "🌷", category: "plant" },
  { id: "willow", name: "Tužna vrba", english: "Willow Tree", price: 450, emoji: "🌿", category: "plant" },
  { id: "sunflower", name: "Suncokret", english: "Sunflower", price: 90, emoji: "🌻", category: "plant" },
  { id: "dandelion", name: "Maslačak", english: "Dandelion", price: 40, emoji: "🌾", category: "plant" },
  { id: "oak", name: "Hrast", english: "Oak Tree", price: 500, emoji: "🌳", category: "plant" },
  { id: "ginkgo", name: "Drvo ginka", english: "Ginkgo Tree", price: 420, emoji: "🍃", category: "plant" },
  { id: "yellow-rose", name: "Žuta ruža", english: "Yellow Rose", price: 75, emoji: "🌹", category: "plant" },
]

export const ANIMALS: ShopItem[] = [
  { id: "ladybug", name: "Bubamara", english: "Ladybug", price: 150, emoji: "🐞", category: "animal" },
  { id: "caterpillar", name: "Mala gusenica", english: "Caterpillar", price: 100, emoji: "🐛", category: "animal" },
  { id: "butterfly", name: "Leptirić", english: "Butterfly", price: 200, emoji: "🦋", category: "animal" },
  { id: "snail", name: "Puž", english: "Snail", price: 130, emoji: "🐌", category: "animal" },
]

export const SHOP_ITEMS: ShopItem[] = [...PLANTS, ...ANIMALS]

// Verb used in the hover tag: plants are "planted", animals are "brought".
export function boughtVerb(category: ShopCategory): string {
  return category === "plant" ? "Posadila" : "Dovela"
}

// SVG illustration per item id — colourful inline SVGs that look like illustrated cards
export function getItemSvg(itemId: string, size = 56): string {
  const svgs: Record<string, string> = {
    hibiscus: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="44" rx="5" ry="3" fill="#6B8E4E"/>
      <rect x="27" y="30" width="2" height="16" rx="1" fill="#5A7A3A"/>
      <ellipse cx="20" cy="22" rx="9" ry="12" fill="#FF7BAC" transform="rotate(-15 20 22)"/>
      <ellipse cx="36" cy="22" rx="9" ry="12" fill="#FF5C96" transform="rotate(15 36 22)"/>
      <ellipse cx="28" cy="16" rx="9" ry="12" fill="#FF9EC6" transform="rotate(0 28 16)"/>
      <ellipse cx="28" cy="26" rx="9" ry="10" fill="#FF3D88" transform="rotate(180 28 26)"/>
      <circle cx="28" cy="21" r="5" fill="#FFE44D"/>
      <circle cx="28" cy="21" r="2.5" fill="#FF9800"/>
    </svg>`,

    sakura: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="28" width="8" height="20" rx="3" fill="#8B6348"/>
      <rect x="18" y="34" width="16" height="5" rx="2.5" fill="#7A5639" transform="rotate(-20 18 34)"/>
      <ellipse cx="28" cy="20" rx="18" ry="14" fill="#FFB7C5"/>
      <ellipse cx="18" cy="16" rx="10" ry="8" fill="#FF94AC"/>
      <ellipse cx="38" cy="16" rx="10" ry="8" fill="#FFA0B8"/>
      <circle cx="22" cy="12" r="4" fill="#FFD6E0"/>
      <circle cx="34" cy="11" r="4" fill="#FFD6E0"/>
      <circle cx="28" cy="9" r="4" fill="#FFD6E0"/>
      <circle cx="16" cy="22" r="3.5" fill="#FFD6E0"/>
      <circle cx="40" cy="22" r="3.5" fill="#FFD6E0"/>
      <circle cx="28" cy="20" r="3" fill="#FF6B9D"/>
    </svg>`,

    lily: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="27" y="28" width="2" height="20" rx="1" fill="#5A7A3A"/>
      <ellipse cx="21" cy="18" rx="5" ry="14" fill="#FF8FAB" transform="rotate(-20 21 18)"/>
      <ellipse cx="35" cy="18" rx="5" ry="14" fill="#FF7099" transform="rotate(20 35 18)"/>
      <ellipse cx="28" cy="14" rx="5" ry="14" fill="#FFB3C8"/>
      <circle cx="28" cy="20" r="4" fill="#FFE066"/>
    </svg>`,

    linden: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="30" width="6" height="18" rx="2.5" fill="#8B6348"/>
      <ellipse cx="28" cy="22" rx="20" ry="16" fill="#4CAF50"/>
      <ellipse cx="20" cy="18" rx="13" ry="10" fill="#66BB6A"/>
      <ellipse cx="36" cy="18" rx="13" ry="10" fill="#43A047"/>
      <circle cx="28" cy="14" r="8" fill="#81C784"/>
      <ellipse cx="28" cy="24" rx="6" ry="4" fill="#FFF9C4"/>
    </svg>`,

    orchid: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="27" y="30" width="2" height="20" rx="1" fill="#5A7A3A"/>
      <ellipse cx="22" cy="17" rx="8" ry="11" fill="#CE93D8" transform="rotate(-30 22 17)"/>
      <ellipse cx="34" cy="17" rx="8" ry="11" fill="#AB47BC" transform="rotate(30 34 17)"/>
      <ellipse cx="28" cy="13" rx="8" ry="10" fill="#E1BEE7"/>
      <ellipse cx="28" cy="22" rx="6" ry="8" fill="#BA68C8" transform="rotate(180 28 22)"/>
      <circle cx="28" cy="18" r="3.5" fill="#FFE066"/>
      <circle cx="28" cy="18" r="1.5" fill="#FF9800"/>
    </svg>`,

    birch: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="28" width="6" height="22" rx="2.5" fill="#F5F5F5" stroke="#D0D0D0" stroke-width="0.5"/>
      <rect x="25" y="33" width="6" height="2" rx="0.5" fill="#BDB8B0"/>
      <rect x="25" y="39" width="6" height="2" rx="0.5" fill="#BDB8B0"/>
      <ellipse cx="28" cy="18" rx="16" ry="14" fill="#A5D6A7"/>
      <ellipse cx="19" cy="16" rx="10" ry="9" fill="#C8E6C9"/>
      <ellipse cx="37" cy="16" rx="10" ry="9" fill="#81C784"/>
    </svg>`,

    "yellow-tulips": `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="27" y="30" width="2" height="18" rx="1" fill="#5A7A3A"/>
      <path d="M22 22 Q28 8 34 22 Q28 28 22 22Z" fill="#FFD600"/>
      <path d="M18 26 Q28 14 38 26 Q28 32 18 26Z" fill="#FFE900"/>
      <ellipse cx="24" cy="32" rx="4" ry="2" fill="#66BB6A" transform="rotate(-20 24 32)"/>
      <ellipse cx="32" cy="34" rx="4" ry="2" fill="#4CAF50" transform="rotate(20 32 34)"/>
    </svg>`,

    "pink-tulips": `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="27" y="30" width="2" height="18" rx="1" fill="#5A7A3A"/>
      <path d="M22 22 Q28 8 34 22 Q28 28 22 22Z" fill="#F06292"/>
      <path d="M18 26 Q28 14 38 26 Q28 32 18 26Z" fill="#F48FB1"/>
      <ellipse cx="24" cy="32" rx="4" ry="2" fill="#66BB6A" transform="rotate(-20 24 32)"/>
      <ellipse cx="32" cy="34" rx="4" ry="2" fill="#4CAF50" transform="rotate(20 32 34)"/>
    </svg>`,

    willow: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="26" y="20" width="4" height="30" rx="2" fill="#8B6348"/>
      <path d="M28 20 Q18 30 12 44" stroke="#81C784" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M28 20 Q38 30 44 44" stroke="#66BB6A" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M28 18 Q24 32 20 48" stroke="#A5D6A7" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M28 18 Q32 32 36 48" stroke="#A5D6A7" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M28 16 Q20 26 16 36" stroke="#C8E6C9" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M28 16 Q36 26 40 36" stroke="#C8E6C9" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <ellipse cx="28" cy="14" rx="10" ry="8" fill="#43A047"/>
    </svg>`,

    sunflower: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="27" y="28" width="2" height="22" rx="1" fill="#5A7A3A"/>
      <ellipse cx="30" cy="36" rx="4" ry="2" fill="#66BB6A" transform="rotate(-20 30 36)"/>
      <circle cx="28" cy="20" r="12" fill="#FFD600"/>
      <circle cx="28" cy="20" r="8" fill="#FFEB3B"/>
      <circle cx="28" cy="8" r="3" fill="#FFEB3B"/>
      <circle cx="28" cy="32" r="3" fill="#FFEB3B"/>
      <circle cx="16" cy="20" r="3" fill="#FFEB3B"/>
      <circle cx="40" cy="20" r="3" fill="#FFEB3B"/>
      <circle cx="20" cy="12" r="3" fill="#FFEB3B"/>
      <circle cx="36" cy="12" r="3" fill="#FFEB3B"/>
      <circle cx="20" cy="28" r="3" fill="#FFEB3B"/>
      <circle cx="36" cy="28" r="3" fill="#FFEB3B"/>
      <circle cx="28" cy="20" r="6" fill="#5D4037"/>
      <circle cx="28" cy="20" r="4" fill="#4E342E"/>
    </svg>`,

    dandelion: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="27" y="28" width="2" height="22" rx="1" fill="#5A7A3A"/>
      <circle cx="28" cy="20" r="11" fill="none" stroke="#E8E8E8" stroke-width="1"/>
      <line x1="28" y1="9" x2="28" y2="4" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="37" y1="11" x2="41" y2="8" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="39" y1="20" x2="44" y2="20" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="37" y1="29" x2="41" y2="32" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="19" y1="11" x2="15" y2="8" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="17" y1="20" x2="12" y2="20" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="19" y1="29" x2="15" y2="32" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="28" cy="9" r="2" fill="#F5F5F5"/>
      <circle cx="37" cy="11" r="2" fill="#F5F5F5"/>
      <circle cx="39" cy="20" r="2" fill="#F5F5F5"/>
      <circle cx="37" cy="29" r="2" fill="#F5F5F5"/>
      <circle cx="19" cy="11" r="2" fill="#F5F5F5"/>
      <circle cx="17" cy="20" r="2" fill="#F5F5F5"/>
      <circle cx="19" cy="29" r="2" fill="#F5F5F5"/>
      <circle cx="28" cy="20" r="4" fill="#FFD600"/>
    </svg>`,

    oak: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="28" width="8" height="22" rx="3" fill="#6D4C41"/>
      <ellipse cx="28" cy="18" rx="20" ry="16" fill="#388E3C"/>
      <ellipse cx="18" cy="16" rx="13" ry="10" fill="#43A047"/>
      <ellipse cx="38" cy="16" rx="13" ry="10" fill="#2E7D32"/>
      <ellipse cx="28" cy="10" rx="10" ry="8" fill="#4CAF50"/>
    </svg>`,

    ginkgo: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="28" width="6" height="22" rx="2.5" fill="#8B6348"/>
      <path d="M28 28 Q14 20 10 8 Q28 12 28 28Z" fill="#F9A825"/>
      <path d="M28 28 Q42 20 46 8 Q28 12 28 28Z" fill="#FBC02D"/>
      <path d="M28 24 Q16 16 14 6 Q28 10 28 24Z" fill="#FFD54F"/>
      <path d="M28 24 Q40 16 42 6 Q28 10 28 24Z" fill="#FFE082"/>
    </svg>`,

    "yellow-rose": `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="27" y="30" width="2" height="18" rx="1" fill="#5A7A3A"/>
      <ellipse cx="24" cy="36" rx="4" ry="2" fill="#66BB6A" transform="rotate(-30 24 36)"/>
      <circle cx="28" cy="18" r="10" fill="#FFD600"/>
      <ellipse cx="28" cy="12" rx="7" ry="9" fill="#FFE57F"/>
      <ellipse cx="22" cy="16" rx="6" ry="8" fill="#FFCA28" transform="rotate(-20 22 16)"/>
      <ellipse cx="34" cy="16" rx="6" ry="8" fill="#FFB300" transform="rotate(20 34 16)"/>
      <circle cx="28" cy="18" r="4" fill="#FFA000"/>
    </svg>`,

    ladybug: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="30" rx="16" ry="14" fill="#E53935"/>
      <ellipse cx="28" cy="22" rx="10" ry="8" fill="#1A1A1A"/>
      <line x1="28" y1="16" x2="28" y2="44" stroke="#1A1A1A" stroke-width="2"/>
      <circle cx="22" cy="28" r="4" fill="#1A1A1A"/>
      <circle cx="34" cy="28" r="4" fill="#1A1A1A"/>
      <circle cx="20" cy="36" r="3" fill="#1A1A1A"/>
      <circle cx="36" cy="36" r="3" fill="#1A1A1A"/>
      <circle cx="22" cy="22" r="2.5" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="26" cy="19" r="1.5" fill="#FFFFFF" opacity="0.5"/>
      <line x1="24" y1="16" x2="20" y2="10" stroke="#1A1A1A" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="32" y1="16" x2="36" y2="10" stroke="#1A1A1A" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="20" cy="10" r="2" fill="#1A1A1A"/>
      <circle cx="36" cy="10" r="2" fill="#1A1A1A"/>
    </svg>`,

    caterpillar: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="46" cy="28" r="6" fill="#7CB342"/>
      <circle cx="36" cy="26" r="7" fill="#8BC34A"/>
      <circle cx="26" cy="25" r="7" fill="#7CB342"/>
      <circle cx="16" cy="26" r="7" fill="#8BC34A"/>
      <circle cx="9" cy="30" r="6" fill="#33691E"/>
      <circle cx="9" cy="30" r="6" fill="#388E3C"/>
      <circle cx="7" cy="27" r="2" fill="#FFFFFF"/>
      <circle cx="11" cy="27" r="2" fill="#FFFFFF"/>
      <circle cx="7.5" cy="27.5" r="1" fill="#1A1A1A"/>
      <circle cx="11.5" cy="27.5" r="1" fill="#1A1A1A"/>
      <path d="M8 32 Q9 34 10 32" stroke="#1A1A1A" stroke-width="1" fill="none" stroke-linecap="round"/>
      <line x1="9" y1="24" x2="7" y2="19" stroke="#388E3C" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="9" y1="24" x2="11" y2="19" stroke="#388E3C" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    butterfly: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="18" cy="20" rx="13" ry="10" fill="#FB8C00" transform="rotate(-15 18 20)"/>
      <ellipse cx="38" cy="20" rx="13" ry="10" fill="#FF7043" transform="rotate(15 38 20)"/>
      <ellipse cx="16" cy="34" rx="9" ry="7" fill="#FFA726" transform="rotate(20 16 34)"/>
      <ellipse cx="40" cy="34" rx="9" ry="7" fill="#FF8A65" transform="rotate(-20 40 34)"/>
      <circle cx="18" cy="20" r="4" fill="#1A1A1A" opacity="0.15"/>
      <circle cx="38" cy="20" r="4" fill="#1A1A1A" opacity="0.15"/>
      <rect x="27" y="16" width="2" height="24" rx="1" fill="#1A1A1A"/>
      <line x1="28" y1="16" x2="22" y2="8" stroke="#1A1A1A" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="28" y1="16" x2="34" y2="8" stroke="#1A1A1A" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="22" cy="8" r="2" fill="#1A1A1A"/>
      <circle cx="34" cy="8" r="2" fill="#1A1A1A"/>
    </svg>`,

    snail: `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="38" rx="18" ry="8" fill="#8D6E63"/>
      <circle cx="34" cy="26" r="14" fill="#FF8A65"/>
      <circle cx="34" cy="26" r="10" fill="#FFAB91"/>
      <circle cx="34" cy="26" r="6" fill="#FF7043"/>
      <circle cx="34" cy="26" r="2" fill="#BF360C"/>
      <ellipse cx="16" cy="36" rx="8" ry="4" fill="#A1887F"/>
      <line x1="12" y1="32" x2="9" y2="26" stroke="#8D6E63" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14" y1="31" x2="12" y2="25" stroke="#8D6E63" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="9" cy="25" r="2" fill="#4E342E"/>
      <circle cx="12" cy="24" r="2" fill="#4E342E"/>
    </svg>`,
  }
  return svgs[itemId] ?? `<svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="32">🌱</text></svg>`
}
