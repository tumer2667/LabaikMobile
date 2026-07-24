const REFRESH_KEY = 'labaik.refresh'
const ACCESS_KEY = 'labaik.access'

export const tokenStorage = {
  getAccess(): string | null {
    return sessionStorage.getItem(ACCESS_KEY)
  },
  setAccess(token: string | null) {
    if (token) sessionStorage.setItem(ACCESS_KEY, token)
    else sessionStorage.removeItem(ACCESS_KEY)
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },
  setRefresh(token: string | null) {
    if (token) localStorage.setItem(REFRESH_KEY, token)
    else localStorage.removeItem(REFRESH_KEY)
  },
  clear() {
    sessionStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
