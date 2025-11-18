import type { Metadata } from "next"
import LoginPageClient from "./login-page-client"

export const metadata: Metadata = {
  title: "로그인",
}

export default function LoginPage() {
  return <LoginPageClient />
}
