"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import krocsLogo from "@/assets/krocslogo.png"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const backendOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : "https://api.krocs.life";

  const handleGoogleLogin = () => {
    window.location.href = `${backendOrigin}/oauth2/authorization/google`
  }

  const handleNaverLogin = () => {
    window.location.href = `${backendOrigin}/oauth2/authorization/naver`
  }

  const handleKakaoLogin = () => {
    window.location.href = `${backendOrigin}/oauth2/authorization/kakao`
  }

  const slogans = [
    "시간을 관리하면 인생이 바뀝니다",
    "오늘의 시간, 내일의 성공",
    "당신의 시간, 더 가치있게",
    "효율적인 시간 관리로 꿈을 이루세요",
    "시간은 금이다, 현명하게 사용하세요",
    "매 순간을 소중하게",
    "시간 관리의 시작, Krocs와 함께",
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#ffc0a8] via-[#eef5f7] to-[#eef5f7] relative overflow-hidden">


      {/* 헤더 */}
      <header className="w-full p-6 relative z-10">
        <Link href="/">
          <Image
            src={krocsLogo}
            alt="Krocs Logo"
            width={100}
            height={40}
            className="object-contain"
          />
        </Link>
      </header>

      {/* 메인 로그인 영역 */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-md">
                          
                  <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl font-bold text-[#ff8b6b]">로그인</CardTitle>
              <CardDescription className="text-center text-sm text-muted-foreground">소셜 계정으로 간편하게 시작하세요</CardDescription>

            </CardHeader>
            <CardContent className="space-y-4">
              {/* 소셜 로그인 버튼들 */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
                  className="w-full h-14 text-base hover:bg-gray-50 bg-transparent rounded-full"
                >
                  <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google로 계속하기
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={handleNaverLogin}
                  className="w-full h-14 text-base hover:bg-gray-50 bg-transparent rounded-full"
                >
                  <div className="h-6 w-6 mr-3 flex items-center justify-center">
                    <span style={{
                      color: "#03C75A",
                      fontWeight: 900,
                      fontSize: "24px",
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}>N</span>
                  </div>
                  네이버로 계속하기
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={handleKakaoLogin}
                  className="w-full h-14 text-base hover:bg-gray-50 bg-transparent rounded-full"
                >
                  <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="4" fill="#FEE500" />
                    <path
                      d="M12 4C7.582 4 4 6.686 4 10c0 2.09 1.352 3.93 3.406 5.089l-.87 3.197c-.068.25.186.457.414.337l3.384-2.25C10.87 16.458 11.425 16.5 12 16.5c4.418 0 8-2.686 8-6s-3.582-6-8-6z"
                      fill="#3C1E1E"
                    />
                  </svg>
                  카카오로 계속하기
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-center text-sm text-muted-foreground">
                로그인하면{" "}
                <a href="#" className="font-medium text-purple-600 hover:text-purple-700 hover:underline">
                  이용약관
                </a>
                과{" "}
                <a href="#" className="font-medium text-purple-600 hover:text-purple-700 hover:underline">
                  개인정보처리방침
                </a>
                에 동의하게 됩니다
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
