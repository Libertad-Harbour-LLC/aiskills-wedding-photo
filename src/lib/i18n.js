"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STRINGS = {
  en: {
    upload: "Upload from device",
    uploading: "Uploading…",
    pasteLink: "Paste a public link to the file (https://…)",
    add: "Add",
    remove: "Remove",
    linkHint: "Use a direct public link (for example a Google Drive file shared with “Anyone with the link”).",
    uploadOff: "Upload from device is off on this site — paste a link instead.",
    generate: "Generate",
    generating: "Starting…",
    price: "Price",
    priceFrom: "from",
    perRun: "per run",
    charged: "Charged from the site owner's AI SKILLS balance at aiskills.team prices. Failed results are refunded automatically.",
    result: "Result",
    emptyTitle: "Your results will appear here",
    emptyText: "Add your files, pick the options on the left and press Generate.",
    processing: "Processing…",
    queued: "Queued…",
    failed: "Failed — the money was refunded",
    download: "Download",
    open: "Open",
    history: "Recent on this device",
    clear: "Clear",
    notConfigured: "The site owner has not set AISKILLS_API_KEY yet. Create a key at aiskills.team/api-keys and add it to the project environment.",
    accessTitle: "Access code",
    accessText: "This studio is private. Enter the access code from the site owner.",
    accessSave: "Continue",
    before: "Before",
    after: "After",
    variants: "Variants",
    aspect: "Format",
    resolution: "Resolution",
    needInput: "Add the required files first.",
    poweredBy: "Powered by",
    err_insufficient_funds: "Not enough money on the AI SKILLS balance of this site's owner.",
    err_key_limit_reached: "The API key of this site has reached its spending limit.",
    err_too_many_active: "Too many generations are running right now — wait a bit and try again.",
    err_rate_limited: "Too many starts per minute — wait a bit and try again.",
    err_access_code_required: "Wrong access code.",
    err_input_download_failed: "Could not download your file from the link. Check that the link is public.",
    err_bad_input_file: "The link does not point to a file of the right type.",
    err_bad_input_url: "Only public https links are accepted.",
    err_image_too_large: "The image is too large (max 20 MB).",
    err_video_too_large: "The video is too large (max 200 MB).",
    err_missing_api_key: "The site owner has not set AISKILLS_API_KEY.",
    err_invalid_api_key: "The site's API key is invalid or revoked.",
    err_api_key_revoked: "The site's API key was revoked.",
    err_generic: "Something went wrong. Try again.",
  },
  ru: {
    upload: "Загрузить с устройства",
    uploading: "Загрузка…",
    pasteLink: "Вставьте публичную ссылку на файл (https://…)",
    add: "Добавить",
    remove: "Убрать",
    linkHint: "Нужна прямая публичная ссылка (например, файл Google Диска с доступом «Всем, у кого есть ссылка»).",
    uploadOff: "Загрузка с устройства на этом сайте выключена — вставьте ссылку.",
    generate: "Создать",
    generating: "Запускаем…",
    price: "Цена",
    priceFrom: "от",
    perRun: "за запуск",
    charged: "Списывается с баланса AI SKILLS владельца сайта по ценам aiskills.team. Неудачный результат возвращается автоматически.",
    result: "Результат",
    emptyTitle: "Здесь появится результат",
    emptyText: "Добавьте файлы, выберите настройки слева и нажмите «Создать».",
    processing: "Обрабатываем…",
    queued: "В очереди…",
    failed: "Не получилось — деньги вернулись",
    download: "Скачать",
    open: "Открыть",
    history: "Недавнее на этом устройстве",
    clear: "Очистить",
    notConfigured: "Владелец сайта ещё не указал AISKILLS_API_KEY. Создайте ключ на aiskills.team/api-keys и добавьте его в переменные проекта.",
    accessTitle: "Код доступа",
    accessText: "Студия закрыта. Введите код доступа от владельца сайта.",
    accessSave: "Продолжить",
    before: "До",
    after: "После",
    variants: "Вариантов",
    aspect: "Формат",
    resolution: "Разрешение",
    needInput: "Сначала добавьте нужные файлы.",
    poweredBy: "Работает на",
    err_insufficient_funds: "На балансе AI SKILLS владельца сайта недостаточно денег.",
    err_key_limit_reached: "Ключ API этого сайта исчерпал свой лимит расходов.",
    err_too_many_active: "Сейчас идёт слишком много генераций — подождите и попробуйте снова.",
    err_rate_limited: "Слишком много запусков в минуту — подождите и попробуйте снова.",
    err_access_code_required: "Неверный код доступа.",
    err_input_download_failed: "Не удалось скачать файл по ссылке. Проверьте, что ссылка публичная.",
    err_bad_input_file: "По ссылке файл не того типа.",
    err_bad_input_url: "Принимаются только публичные ссылки https.",
    err_image_too_large: "Картинка слишком большая (до 20 МБ).",
    err_video_too_large: "Видео слишком большое (до 200 МБ).",
    err_missing_api_key: "Владелец сайта не указал AISKILLS_API_KEY.",
    err_invalid_api_key: "Ключ API сайта неверный или отозван.",
    err_api_key_revoked: "Ключ API сайта отозван.",
    err_generic: "Что-то пошло не так. Попробуйте ещё раз.",
  },
};

const LangCtx = createContext({ lang: "en", setLang: () => {}, t: (k) => k, tx: (v) => v });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "ru" || saved === "en") setLangState(saved);
      else if ((navigator.language || "").toLowerCase().startsWith("ru")) setLangState("ru");
    } catch {}
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };
  const t = (k) => STRINGS[lang][k] ?? STRINGS.en[k] ?? k;
  // tx: pick the language from an { en, ru } object (or return a plain string as is).
  const tx = (v) => (v && typeof v === "object" ? v[lang] ?? v.en : v);
  return <LangCtx.Provider value={{ lang, setLang, t, tx }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

export function errorText(t, code) {
  const s = t(`err_${code}`);
  return s.startsWith("err_") ? t("err_generic") : s;
}
