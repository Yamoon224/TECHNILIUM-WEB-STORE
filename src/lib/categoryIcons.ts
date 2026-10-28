import {
  Camera,
  Cable,
  Gamepad2,
  Headphones,
  Laptop,
  LayoutGrid,
  Monitor,
  Printer,
  Smartphone,
  Speaker,
  Tablet,
  Tv,
  Watch,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon for a category, chosen from its name/slug (the categories themselves
 * come from the API; only the pictogram is a presentation choice). First
 * matching keyword wins; unknown categories get a neutral grid icon.
 */
const RULES: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["smartphone", "telephone", "mobile", "iphone"], icon: Smartphone },
  { keywords: ["tablette", "tablet", "ipad"], icon: Tablet },
  { keywords: ["ordinateur", "laptop", "pc-portable", "portable", "macbook"], icon: Laptop },
  { keywords: ["ecran", "moniteur", "monitor"], icon: Monitor },
  { keywords: ["tv", "television", "televiseur"], icon: Tv },
  { keywords: ["audio", "casque", "ecouteur", "airpods"], icon: Headphones },
  { keywords: ["enceinte", "speaker", "haut-parleur"], icon: Speaker },
  { keywords: ["photo", "camera", "video"], icon: Camera },
  { keywords: ["jeu", "gaming", "console", "manette"], icon: Gamepad2 },
  { keywords: ["montre", "watch", "connecte", "wearable"], icon: Watch },
  { keywords: ["reseau", "wifi", "routeur", "modem"], icon: Wifi },
  { keywords: ["imprimante", "printer", "bureau"], icon: Printer },
  { keywords: ["accessoire", "cable", "chargeur", "batterie"], icon: Cable },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function categoryIcon(category: { name: string; slug: string }): LucideIcon {
  const haystack = normalize(`${category.slug} ${category.name}`);
  const match = RULES.find((rule) => rule.keywords.some((keyword) => haystack.includes(keyword)));
  return match?.icon ?? LayoutGrid;
}
