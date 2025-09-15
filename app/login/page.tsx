// app/login/page.tsx

import { Button } from "@/components/ui/button";
import Link from "next/link";

const LoginPage = () => {
  const backendOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : "https://api.krocs.life";

  const kakaoLoginUrl = `${backendOrigin}/oauth2/authorization/kakao`;
  const naverLoginUrl = `${backendOrigin}/oauth2/authorization/naver`;
  const googleLoginUrl = `${backendOrigin}/oauth2/authorization/google`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
        <div className="space-y-3">
          <Button asChild className="w-full bg-[#FEE500] text-black hover:bg-[#FEE500]/90">
            <Link href={kakaoLoginUrl}>카카오로 로그인</Link>
          </Button>
          <Button asChild className="w-full bg-[#03C75A] text-white hover:bg-[#03C75A]/90">
            <Link href={naverLoginUrl}>네이버로 로그인</Link>
          </Button>
          <Button asChild className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100">
            <Link href={googleLoginUrl}>구글로 로그인</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
