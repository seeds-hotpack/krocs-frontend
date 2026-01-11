"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { fetchAuthStatus } from "@/api/auth"
import { trackEvent } from "@/lib/analytics/gtag"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  user: unknown
  refresh: () => Promise<void>
  markUnauthenticated: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SIGN_UP_TRACK_KEY = "ga_signup_tracked_user"
const USER_ID_KEYS = ["userId", "id", "uid"]
const AUTH_METHOD_KEYS = ["provider", "authProvider", "loginType", "socialType", "platform"]

const readStringProperty = (source: unknown, keys: string[]): string | undefined => {
  if (!source || typeof source !== "object") {
    return undefined
  }

  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
    if (typeof value === "number") {
      return String(value)
    }
  }
  return undefined
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [user, setUser] = useState<unknown>(null)

  const markUnauthenticated = useCallback(() => {
    setStatus("unauthenticated")
    setUser(null)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("goalPageSelectedDate")
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const result = await fetchAuthStatus()
      if (result?.isSuccess) {
        setStatus("authenticated")
        setUser(result?.result ?? null)
      } else {
        markUnauthenticated()
      }
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        markUnauthenticated()
        return
      }
      console.error("Failed to fetch auth status:", error)
      markUnauthenticated()
    }
  }, [markUnauthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (status !== "authenticated" || typeof window === "undefined") {
      return
    }

    const userId = readStringProperty(user, USER_ID_KEYS) ?? "anonymous"
    const alreadyTracked = window.localStorage.getItem(SIGN_UP_TRACK_KEY)
    if (alreadyTracked === userId) {
      return
    }

    const authMethod = readStringProperty(user, AUTH_METHOD_KEYS) ?? "oauth"

    trackEvent("sign_up_complete", {
      user_id: userId !== "anonymous" ? userId : undefined,
      auth_method: authMethod,
    })

    window.localStorage.setItem(SIGN_UP_TRACK_KEY, userId)
  }, [status, user])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      refresh,
      markUnauthenticated,
    }),
    [status, user, refresh, markUnauthenticated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
