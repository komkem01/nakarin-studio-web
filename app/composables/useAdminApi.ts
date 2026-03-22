type ApiResponse<T> = {
  code: string
  message: string
  data: T
}

type RefreshPayload = {
  access_token: string
  refresh_token: string
  admin_id: string
  username: string
  role: string
}

type RequestOptions = {
  method?: 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'
  body?: BodyInit | Record<string, any> | null
  query?: Record<string, unknown>
  headers?: HeadersInit
}

const apiPrefix = '/api/v1'

const normalizePath = (baseURL: string, path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const baseHasApiPrefix = baseURL.endsWith(apiPrefix)

  if (baseHasApiPrefix && normalizedPath.startsWith(`${apiPrefix}/`)) {
    return normalizedPath.slice(apiPrefix.length)
  }

  return normalizedPath
}

const decodeJwtExp = (token: string): number | null => {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    const payload = parts[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

    if (typeof atob !== 'function') return null
    const json = atob(padded)

    const parsed = JSON.parse(json) as { exp?: number }
    return typeof parsed.exp === 'number' ? parsed.exp : null
  } catch {
    return null
  }
}

const isAccessTokenExpired = (token: string, skewSeconds = 30): boolean => {
  const exp = decodeJwtExp(token)
  if (!exp) return false
  const now = Math.floor(Date.now() / 1000)
  return exp <= now + skewSeconds
}

export const useAdminApi = () => {
  const config = useRuntimeConfig()
  const baseURL = String(config.public.apiBase || '').replace(/\/+$/, '')

  const adminSession = useCookie<string | null>('admin_session', {
    sameSite: 'lax',
    secure: !import.meta.dev
  })
  const adminAccessToken = useCookie<string | null>('admin_access_token', {
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: 2 * 60 * 60
  })
  const adminRefreshToken = useCookie<string | null>('admin_refresh_token', {
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: 30 * 24 * 60 * 60
  })

  const refreshInFlight = useState<Promise<string | null> | null>('admin-refresh-in-flight', () => null)

  const clearAuth = () => {
    adminAccessToken.value = null
    adminRefreshToken.value = null
    adminSession.value = null
  }

  const refreshAccessToken = async (): Promise<string | null> => {
    if (refreshInFlight.value) return refreshInFlight.value

    const refreshToken = adminRefreshToken.value
    if (!refreshToken) {
      clearAuth()
      return null
    }

    const refreshPromise = (async () => {
      try {
        const response = await $fetch<ApiResponse<RefreshPayload>>(normalizePath(baseURL, '/api/v1/admins/refresh'), {
          baseURL,
          method: 'POST',
          body: {
            refresh_token: refreshToken
          }
        })

        const payload = response?.data
        if (!payload?.access_token || !payload?.refresh_token) {
          clearAuth()
          return null
        }

        adminAccessToken.value = payload.access_token
        adminRefreshToken.value = payload.refresh_token
        adminSession.value = 'active'
        return payload.access_token
      } catch {
        clearAuth()
        return null
      }
    })()

    refreshInFlight.value = refreshPromise

    try {
      return await refreshPromise
    } finally {
      refreshInFlight.value = null
    }
  }

  const ensureAccessToken = async (): Promise<string | null> => {
    const token = adminAccessToken.value
    if (!token) {
      return refreshAccessToken()
    }

    if (isAccessTokenExpired(token)) {
      return refreshAccessToken()
    }

    return token
  }

  const request = async <T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> => {
    const token = await ensureAccessToken()

    const headers = new Headers(options.headers as HeadersInit | undefined)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    try {
      const response = await $fetch<ApiResponse<T> | T | null>(normalizePath(baseURL, path), {
        baseURL,
        ...options,
        headers
      })

      if (response === null || response === undefined) {
        return null as T
      }

      if (typeof response === 'object' && response !== null && 'data' in response) {
        return (response as ApiResponse<T>).data
      }

      return response as T
    } catch (error: any) {
      const isUnauthorized = Number(error?.statusCode || error?.status) === 401
      if (retry && isUnauthorized) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          return request<T>(path, options, false)
        }
      }
      throw error
    }
  }

  const ensureAdminAuth = async (): Promise<boolean> => {
    const token = await ensureAccessToken()
    return Boolean(token)
  }

  const backofficeRequest = async <T>(path: string, options: RequestOptions = {}) => {
    const normalized = path.startsWith('/') ? path : `/${path}`
    return request<T>(`/api/v1/backoffice${normalized}`, options)
  }

  return {
    request,
    backofficeRequest,
    ensureAdminAuth,
    refreshAccessToken,
    clearAuth,
    accessToken: adminAccessToken,
    refreshToken: adminRefreshToken,
    adminSession
  }
}
