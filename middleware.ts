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

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const isAuthenticated = AUTH_COOKIES.some((name) => request.cookies.has(name))

    if (isAuthenticated) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/goal"
      redirectUrl.search = request.nextUrl.search
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/"],
}
