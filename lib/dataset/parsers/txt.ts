import {
  previewConvertedCsv,
  unsupportedPreview,
  csvEscape,
  type AutoConvertedPreviewData,
} from "../autoConvert"

export type WhatsappLocale = "DMY" | "MDY" | "YMD"

interface WhatsappParsedMessage {
  date: string
  time: string
  sender: string
  message: string
}

const WHATSAPP_LINE_START = new RegExp(
  "^\\[?" +
    "(\\d{1,2}/\\d{1,2}/\\d{2,4})" +
    ",?\\s" +
    "(\\d{1,2}:\\d{2}(?::\\d{2})?(?:[\\s\\u202f]?[ap]\\.?\\s?m\\.?)?)" +
    "\\]?" +
    "\\s-?\\s?" +
    "([^:]+):\\s" +
    "([\\s\\S]*)$",
  "i"
)

const WHATSAPP_SYSTEM_LINE = new RegExp(
  "^\\[?(\\d{1,2}/\\d{1,2}/\\d{2,4}),?\\s(\\d{1,2}:\\d{2}(?::\\d{2})?(?:[\\s\\u202f]?[ap]\\.?\\s?m\\.?)?)\\]?\\s-?\\s?([\\s\\S]*)$",
  "i"
)

export function isWhatsappChat(text: string, sampleSize = 30): boolean {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\u200e\u200f]/, "").trim())
    .filter(Boolean)
    .slice(0, sampleSize)

  if (lines.length === 0) return false

  const matches = lines.filter(
    (l) => WHATSAPP_LINE_START.test(l) || WHATSAPP_SYSTEM_LINE.test(l)
  ).length

  return matches / lines.length >= 0.5
}

function normalizeDate(raw: string, locale: WhatsappLocale): string {
  const parts = raw.split("/").map((p) => Number(p.trim()))
  let d: number, m: number, y: number
  if (locale === "DMY") [d, m, y] = parts
  else if (locale === "MDY") [m, d, y] = parts
  else [y, m, d] = parts
  if (y < 100) y += 2000
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function normalizeTime(raw: string): string {
  let t = raw.replace(/\u202f/g, " ").trim()
  const ampmMatch = t.match(/([ap])\.?\s?m\.?/i)
  if (ampmMatch) {
    const isPM = ampmMatch[1].toLowerCase() === "p"
    t = t.replace(/\s?[ap]\.?\s?m\.?/i, "")
    const [hh, mm, ss] = t.split(":").map(Number)
    let hour24 = hh % 12
    if (isPM) hour24 += 12
    return `${String(hour24).padStart(2, "0")}:${String(mm).padStart(2, "0")}${
      ss !== undefined ? ":" + String(ss).padStart(2, "0") : ""
    }`
  }
  return t
}

export function whatsappTxtToCsv(
  text: string,
  locale: WhatsappLocale = "DMY"
): string {
  const lines = text.split(/\r?\n/)
  const rows: string[] = ["fecha,hora,remitente,mensaje"]
  let current: WhatsappParsedMessage | null = null

  const flush = () => {
    if (current) {
      rows.push(
        [
          current.date,
          current.time,
          csvEscape(current.sender),
          csvEscape(current.message),
        ].join(",")
      )
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[\u200e\u200f]/, "")

    const m = WHATSAPP_LINE_START.exec(line)
    if (m) {
      flush()
      const [, rawDate, rawTime, sender, message] = m
      current = {
        date: normalizeDate(rawDate, locale),
        time: normalizeTime(rawTime),
        sender: sender.trim(),
        message: message.trim(),
      }
      continue
    }

    const sm = WHATSAPP_SYSTEM_LINE.exec(line)
    if (sm) {
      flush()
      current = {
        date: normalizeDate(sm[1], locale),
        time: normalizeTime(sm[2]),
        sender: "Sistema",
        message: sm[3].trim(),
      }
      continue
    }

    if (current) {
      current.message += "\n" + line
    }
  }
  flush()

  return rows.join("\n")
}

export async function previewTxt(
  file: File,
  options?: { locale?: WhatsappLocale }
): Promise<AutoConvertedPreviewData> {
  const text = await file.text()

  if (!isWhatsappChat(text)) {
    return unsupportedPreview(
      "El archivo .txt no parece ser un chat de WhatsApp exportado ni un dataset reconocido."
    )
  }

  const csvContent = whatsappTxtToCsv(text, options?.locale ?? "DMY")

  return previewConvertedCsv(
    csvContent,
    file.name,
    "whatsapp-chat",
    "Detectamos que este archivo es un chat de WhatsApp exportado. Lo convertimos automáticamente a CSV."
  )
}
