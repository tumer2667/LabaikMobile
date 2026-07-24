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
  /** Exact shop pin — Karim Park, Lahore */
  coordinates: {
    lat: 31.589296,
    lng: 74.299992,
  },
} as const

export function mapsEmbedUrl(
  lat: number = businessInfo.coordinates.lat,
  lng: number = businessInfo.coordinates.lng,
): string {
  const q = encodeURIComponent(`${lat},${lng}`)
  return `https://maps.google.com/maps?q=${q}&ll=${lat},${lng}&z=17&output=embed`
}

export function mapsOpenUrl(
  lat: number = businessInfo.coordinates.lat,
  lng: number = businessInfo.coordinates.lng,
): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`
}

export function whatsappUrl(phoneDigits: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}
