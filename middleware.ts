import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const DEFAULT_AUTH_COOKIE_NAMES = [
  "accessToken",
  "refreshToken",
  "ACCESS_TOKEN",
  "REFRESH_TOKEN",
  "Authorization",
  "authToken",
  "AUTH-TOKEN",
  "JSESSIONID",
  "SESSION",
  "sid",
]

const parsedEnvCookies =
  process.env.AUTH_COOKIE_NAMES ||
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAMES ||
  ""

const AUTH_COOKIE_NAMES = parsedEnvCookies
  .split(",")
  .map((cookie) => cookie.trim())
  .filter(Boolean)

const AUTH_COOKIES = AUTH_COOKIE_NAMES.length ? AUTH_COOKIE_NAMES : DEFAULT_AUTH_COOKIE_NAMES

const PUBLIC_PATHS = ["/", "/landing", "/login"]

const rawApiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8080/api/v1"
const API_BASE_URL = rawApiBase.replace(/\/$/, "")
const AUTH_ME_ENDPOINT = `${API_BASE_URL}/auth/me`

const isPathMatch = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

async function verifyAuthWithApi(request: NextRequest): Promise<boolean | null> {
  const cookieHeader = request.headers.get("cookie")
  if (!cookieHeader) return false

  try {
    const response = await fetch(AUTH_ME_ENDPOINT, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json().catch(() => null)

    if (data && typeof data === "object") {
      if ("code" in data && typeof data.code === "string" && data.code === "GLOBAL401") {
        return false
      }
      if ("isSuccess" in data && data.isSuccess === false) {
        return false
      }
    }

    return true
  } catch {
    return null
  }
}

async function determineAuthStatus(request: NextRequest, hasServerAuthCookie: boolean) {
  if (!hasServerAuthCookie) {
    return false
  }

  const apiVerification = await verifyAuthWithApi(request)
  if (apiVerification !== null) {
    return apiVerification
  }

  return hasServerAuthCookie
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublicPath = isPathMatch(pathname, PUBLIC_PATHS)

  const hasServerAuthCookie = AUTH_COOKIES.some((name) => request.cookies.has(name))

  const needsAuthEvaluation = pathname === "/" || !isPublicPath
  const isAuthenticated = needsAuthEvaluation
    ? await determineAuthStatus(request, hasServerAuthCookie)
    : false

  if (!isPublicPath && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === "/" && isAuthenticated) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/goal"
    redirectUrl.search = request.nextUrl.search
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
