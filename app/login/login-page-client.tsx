"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import krocsLogo from "@/assets/krocslogo.png"
import TermsModal from "@/components/terms-modal"
import PrivacyModal from "@/components/privacy-modal"
import { useAuth } from "@/components/auth/auth-provider"

export default function LoginPageClient() {
  const router = useRouter()
  const { status: authStatus } = useAuth()
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)

  const backendOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : "https://api.krocs.life"

  const handleGoogleLogin = () => {
    window.location.href = `${backendOrigin}/oauth2/authorization/google`
  }

  const handleNaverLogin = () => {
    window.location.href = `${backendOrigin}/oauth2/authorization/naver`
  }

  const handleKakaoLogin = () => {
    window.location.href = `${backendOrigin}/oauth2/authorization/kakao`
  }

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.replace("/goal")
    }
  }, [authStatus, router])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#ffc0a8] via-[#eef5f7] to-[#eef5f7] relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="space-y-1">
              <Link href="/landing">
                <Image
                  src={krocsLogo}
                  alt="Krocs Logo"
                  width={100}
                  height={40}
                  className="object-contain block mx-auto"
                />
              </Link>
              <CardDescription className="text-center text-sm text-muted-foreground">
                소셜 계정으로 간편하게 시작하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <button className="login-btn google-btn" onClick={handleGoogleLogin}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.61l6.91-6.91C35.82 2.02 30.3 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.04 6.24C12.6 13.45 17.84 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.5 24c0-1.64-.15-3.23-.44-4.76H24v9.04h12.68c-.55 2.98-2.2 5.51-4.68 7.21l7.19 5.59C43.79 37.17 46.5 30.96 46.5 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.6 28.98A14.42 14.42 0 0 1 9.5 24c0-1.74.31-3.41.87-4.98L2.33 13.2A23.85 23.85 0 0 0 0 24c0 3.91.91 7.63 2.53 10.89l8.07-6.91z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.92-2.13 15.89-5.79l-7.3-5.68c-2.07 1.39-4.74 2.2-8.59 2.2-6.19 0-11.44-3.98-13.31-9.55l-8.07 6.91C6.46 42.62 14.59 48 24 48z"
                    />
                  </svg>
                  Google로 로그인
                </button>
                <button className="login-btn naver-btn" onClick={handleNaverLogin}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M4 4h4.8l4.4 7V4H20v16h-4.8l-4.4-7v7H4z" />
                  </svg>
                  네이버 로그인
                </button>
                <button className="login-btn kakao-btn" onClick={handleKakaoLogin}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#3A1D1D">
                    <path d="M12 2C6.48 2 2 5.58 2 10c0 2.54 1.61 4.78 4.03 6.17-.21.79-.76 2.85-.87 3.3 0 0-.02.14.07.19.09.05.2.01.2.01.26-.04 3.01-1.97 3.49-2.3.66.1 1.34.15 2.08.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                  </svg>
                  카카오 로그인
                </button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-center text-sm text-muted-foreground">
                로그인하면{" "}
                <button
                  onClick={() => setIsTermsModalOpen(true)}
                  className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  이용약관
                </button>
                과{" "}
                <button
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  개인정보처리방침
                </button>
                에 동의하게 됩니다
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
      <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
    </div>
  )
}
