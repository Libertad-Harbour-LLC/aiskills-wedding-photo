// Wedding Photo Studio — wedding and engagement photos of a couple, a bride or a groom from everyday photos.
// Model: nano-banana-2-1-edit (combines up to 14 photos and keeps people's faces).

export const MODEL = "nano-banana-2-1-edit";

export const WHO = [
  { id: "couple", label: { en: "Couple", ru: "Пара" }, prompt: "the couple" },
  { id: "bride", label: { en: "Bride", ru: "Невеста" }, prompt: "the bride" },
  { id: "groom", label: { en: "Groom", ru: "Жених" }, prompt: "the groom" },
];

export const SCENES = [
  { id: "beach", label: { en: "Beach at sunset", ru: "Пляж на закате" }, prompt: "on a tropical beach at golden sunset, soft waves, warm backlight" },
  { id: "garden", label: { en: "Castle garden", ru: "Сад у замка" }, prompt: "in a manicured European castle garden with roses and a stone fountain, soft afternoon light" },
  { id: "vineyard", label: { en: "Vineyard", ru: "Виноградник" }, prompt: "among the rows of a Tuscan vineyard at golden hour, rolling hills behind" },
  { id: "mountains", label: { en: "Mountain peak", ru: "Горы" }, prompt: "on a mountain overlook with dramatic peaks and clouds, epic wide landscape" },
  { id: "cathedral", label: { en: "Cathedral", ru: "Собор" }, prompt: "inside a grand cathedral with tall arches and stained-glass light, at the altar aisle" },
  { id: "barn", label: { en: "Rustic barn", ru: "Рустик-амбар" }, prompt: "at a rustic wooden barn wedding with string lights, hay bales and wildflowers" },
  { id: "rooftop", label: { en: "City rooftop at night", ru: "Крыша ночного города" }, prompt: "on a city rooftop at night with skyline lights and bokeh" },
  { id: "sakura", label: { en: "Cherry blossoms", ru: "Цветущая сакура" }, prompt: "under blooming cherry blossom trees with falling petals, soft spring light" },
  { id: "boho", label: { en: "Desert boho", ru: "Бохо в пустыне" }, prompt: "in a desert at sunset with a boho macrame arch and pampas grass" },
  { id: "paris", label: { en: "Paris streets", ru: "Улицы Парижа" }, prompt: "on a Paris street at blue hour with the Eiffel Tower softly blurred behind" },
  { id: "winter", label: { en: "Snowy forest", ru: "Зимний лес" }, prompt: "in a snowy pine forest with gentle falling snow, cozy winter mood" },
  { id: "studio", label: { en: "Classic studio", ru: "Классическая студия" }, prompt: "in a classic photo studio with a neutral backdrop and soft beauty lighting, timeless portrait" },
];

export const ATTIRE = [
  { id: "classic", label: { en: "Classic", ru: "Классика" }, prompt: "a classic white wedding gown with a veil and a black tuxedo" },
  { id: "modern", label: { en: "Modern minimal", ru: "Современный минимализм" }, prompt: "a sleek minimalist satin wedding dress and a slim-fit light grey suit" },
  { id: "boho", label: { en: "Boho", ru: "Бохо" }, prompt: "a flowy lace boho wedding dress with a flower crown and a linen beige suit" },
  { id: "vintage", label: { en: "Vintage", ru: "Винтаж" }, prompt: "a 1950s vintage tea-length wedding dress and a classic three-piece suit with a bow tie" },
  { id: "keep", label: { en: "Keep my outfit", ru: "Моя одежда" }, prompt: "" },
];

export const ASPECTS = ["3:4", "4:5", "1:1", "16:9", "9:16"];
export const RESOLUTIONS = ["1k", "2k"];

export const APP = {
  id: "wedding-photo-studio",
  name: "Wedding Photo Studio",
  theme: "sunset",
  tagline: { en: "Dream wedding photos", ru: "Свадебные фото мечты" },
  kicker: { en: "AI wedding photographer", ru: "ИИ-свадебный фотограф" },
  headline: { en: "Wedding photos anywhere in the world", ru: "Свадебная фотосессия в любой точке мира" },
  description: {
    en: "Add everyday photos of the couple, the bride or the groom, pick a location and an outfit style — get romantic wedding shots with your real faces.",
    ru: "Добавьте обычные фото пары, невесты или жениха, выберите место и стиль нарядов — получите романтичные свадебные кадры с вашими настоящими лицами.",
  },
  cta: { en: "Create wedding photos", ru: "Создать свадебные фото" },
  models: [MODEL],
  upload: { types: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"], maxBytes: 20 * 1024 * 1024 },
  slots: [{
    key: "photos", kind: "image", min: 1, max: 4,
    label: { en: "Your photos", ru: "Ваши фото" },
    hint: { en: "For a couple: one photo of you together, or one photo of each. Faces clearly visible.", ru: "Для пары: одно общее фото или по одному фото каждого. Лица хорошо видны." },
  }],
  counts: [1, 2, 4],
  compare: false,
  initialState: () => ({ who: "couple", scene: SCENES[0].id, attire: "classic", aspect: "3:4", resolution: "1k", count: 1, note: "" }),
  priceModel: () => MODEL,
  label: (s, tx) => [tx(WHO.find((w) => w.id === s.who)?.label), tx(SCENES.find((x) => x.id === s.scene)?.label)].filter(Boolean).join(" · "),
};
