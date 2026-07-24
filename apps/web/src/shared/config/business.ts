/** Public storefront business details — Lahore shop */
export const businessInfo = {
  name: 'LabaikMobiles',
  email: 'hello@labaikmobiles.com',
  address: 'Shop # 5, Block # 1, Near Ali Computer College, Karim Park, Lahore',
  addressLines: [
    'Shop # 5, Block # 1',
    'Near Ali Computer College',
    'Karim Park, Lahore',
  ] as const,
  phones: [
    { display: '0307 8600067', tel: '+923078600067', whatsapp: '923078600067' },
    { display: '0300 0065558', tel: '+923000065558', whatsapp: '923000065558' },
  ] as const,
  mapQuery: 'Shop # 5 Block # 1 Near Ali Computer College Karim Park Lahore',
} as const

export function mapsEmbedUrl(query: string = businessInfo.mapQuery): string {
  const q = encodeURIComponent(query)
  return `https://maps.google.com/maps?q=${q}&z=16&output=embed`
}

export function mapsOpenUrl(query: string = businessInfo.mapQuery): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function whatsappUrl(phoneDigits: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}
