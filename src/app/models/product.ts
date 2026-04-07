export type ProductCategory =
  | "power bank"
  | "covers"
  | "keyboard"
  | "mouse"
  | "pencil"
  | "airpods"
  | "whoop"
  | "controller"
  | string;

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  description: string;
  pricePaise: number;
  compareAtPricePaise?: number;
  imagePath?: string;
  isTopPick?: boolean;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function paiseToInr(paise: number): number {
  return Math.round(paise) / 100;
}
export function fallbackImageForCategory(category: string) {
  const key = (category || "accessories").toLowerCase();
  const map: Record<string, string> = {
    "power bank": "powerbank",
    covers: "phone-case",
    keyboard: "keyboard",
    mouse: "computer-mouse",
    pencil: "stylus",
    airpods: "earbuds",
    whoop: "fitness-band",
    controller: "game-controller"
  };

  const q = map[key] || "apple accessories";
  // Unsplash Source (no API key), stable image per category
  return `https://source.unsplash.com/featured/800x600?${encodeURIComponent(q)}`;
}
