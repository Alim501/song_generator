const translations = {
  en: {
    musicGenerator: "Music Generator",
    generateSeed: "Generate Seed",
    inputLikes: "Quantity of Likes",
    seedDescription: "Enter your own seed or generate a random one",
    seedPlaceholder: "Enter a seed or click Generate...",
    go: "Go",
    random: "Random",
    table: "Table",
    gallery: "Gallery",
    tracks: (n: number) => (n > 0 ? `${n} track${n !== 1 ? "s" : ""}` : "No tracks"),
    noTracks: "No tracks",
    generateToDiscover: "Generate a seed to discover music",
    previous: "Previous",
    next: "Next",
    page: (n: number) => `Page ${n}`,
    noMoreTracks: "No more tracks to load",
    likes: (n: number) => `${n} likes`,
    sections: (n: number) => `${n} sections`,
    key: (k: string) => `Key: ${k}`,
    play: "Play",
    stop: "Stop",
    review: "Review",
    exportZip: "Export MP3",
    exporting: "Exporting...",
    loading: "Loading...",
    error: "Error",
  },
  ru: {
    musicGenerator: "Генератор музыки",
    generateSeed: "Генерация сида",
    inputLikes: "Количество лайков",
    seedDescription: "Введите свой сид или сгенерируйте случайный",
    seedPlaceholder: "Введите сид или нажмите Генерировать...",
    go: "Пуск",
    random: "Случайный",
    table: "Таблица",
    gallery: "Галерея",
    tracks: (n: number) => {
      if (n === 0) return "Нет треков";
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return `${n} трек`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} трека`;
      return `${n} треков`;
    },
    noTracks: "Нет треков",
    generateToDiscover: "Сгенерируйте сид для поиска музыки",
    previous: "Назад",
    next: "Вперёд",
    page: (n: number) => `Страница ${n}`,
    noMoreTracks: "Больше треков нет",
    likes: (n: number) => `${n} лайков`,
    sections: (n: number) => `${n} секций`,
    key: (k: string) => `Тональность: ${k}`,
    play: "Играть",
    stop: "Стоп",
    review: "Отзыв",
    exportZip: "Экспорт MP3",
    exporting: "Экспорт...",
    loading: "Загрузка...",
    error: "Ошибка",
  },
} as const;

export type Locale = keyof typeof translations;
export type Translations = (typeof translations)[Locale];

export function t(locale: Locale): Translations {
  return translations[locale];
}
