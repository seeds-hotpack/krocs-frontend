"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { fetchAuthStatus } from "@/api/auth"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  user: unknown
  refresh: () => Promise<void>
  markUnauthenticated: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [user, setUser] = useState<unknown>(null)

  const markUnauthenticated = useCallback(() => {
    setStatus("unauthenticated")
    setUser(null)
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
