const KOREAN_TIMEZONE = "Asia/Seoul"

const getSeoulParts = (date?: Date | string) => {
  const target = date ? new Date(date) : new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: KOREAN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts: Record<string, string> = {}

  formatter.formatToParts(target).forEach((part) => {
    if (part.type !== "literal") {
      parts[part.type] = part.value
    }
  })

  return {
    year: parts.year ?? "0000",
    month: parts.month ?? "00",
    day: parts.day ?? "00",
    hour: parts.hour ?? "00",
    minute: parts.minute ?? "00",
    second: parts.second ?? "00",
  }
}

export const toKoreanDateString = (date?: Date | string) => {
  const { year, month, day } = getSeoulParts(date)
  return `${year}-${month}-${day}`
}

export const toKoreanDateTimeLocalString = (date?: Date | string) => {
  const { hour, minute } = getSeoulParts(date)
  return `${toKoreanDateString(date)}T${hour}:${minute}`
}

export const toKoreanISOString = (date?: Date | string) => {
  const { year, month, day, hour, minute, second } = getSeoulParts(date)
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`
}

export const formatKoreanDate = (date?: Date | string, options: Intl.DateTimeFormatOptions = {}) => {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KOREAN_TIMEZONE,
    ...options,
  }).format(date ? new Date(date) : new Date())
}
