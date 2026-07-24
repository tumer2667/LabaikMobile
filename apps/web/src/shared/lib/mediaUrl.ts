import { appConfig } from '@/shared/config/env'

/** Turn API-relative upload paths into absolute URLs the browser can load. */
export function resolveMediaUrl(src: string | null | undefined): string {
  if (!src?.trim()) return ''
  const url = src.trim()
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  const apiOrigin = appConfig.apiUrl.replace(/\/api\/v1\/?$/, '')
  return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`
}
