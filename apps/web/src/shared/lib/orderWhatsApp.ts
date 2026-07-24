import { businessInfo, whatsappUrl } from '@/shared/config/business'
import { formatPkr } from '@/shared/lib/money'

export type OrderMessageInput = {
  productName: string
  brand?: string
  category?: string
  color?: string
  pricePkr?: number
  showPrice?: boolean
  productUrl?: string
  askForPrice?: boolean
}

/** Simple order text the customer sends to the shop on WhatsApp. */
export function buildOrderWhatsAppMessage(input: OrderMessageInput): string {
  const lines = [
    'Assalam o Alaikum!',
    '',
    'I want to buy this product from LabaikMobiles:',
    '',
    `*Product:* ${input.productName}`,
  ]

  if (input.brand) lines.push(`*Brand:* ${input.brand}`)
  if (input.category) lines.push(`*Category:* ${input.category}`)
  if (input.color) lines.push(`*Color:* ${input.color}`)

  if (input.askForPrice || input.showPrice === false) {
    lines.push('*Price:* Please tell me the price')
  } else if (input.pricePkr != null) {
    lines.push(`*Price:* ${formatPkr(input.pricePkr)}`)
  }

  if (input.productUrl) {
    lines.push(`*Link:* ${input.productUrl}`)
  }

  lines.push('', 'Please check stock and reply. Thank you!')

  return lines.join('\n')
}

export function orderWhatsAppHref(input: OrderMessageInput, phoneDigits?: string): string {
  const phone = phoneDigits ?? businessInfo.phones[0].whatsapp
  return whatsappUrl(phone, buildOrderWhatsAppMessage(input))
}
