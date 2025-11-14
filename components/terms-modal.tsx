"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">이용약관</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제1조 (목적)</h3>
            <p>
              본 약관은 우리.zip(이하 &quot;회사&quot;)가 제공하는 모든 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제2조 (용어의 정의)</h3>
            <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>회원: 본 약관에 동의하고 개인정보를 제공하여 회원 등록을 한 자로서, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
              <li>서비스: 회사가 제공하는 스마트 캘린더, 가계부, 할일 관리, 커뮤니티 등 모든 기능을 의미합니다.</li>
              <li>게시물: 회원이 서비스를 이용함에 있어 서비스 상에 게시한 부호, 문자, 음성, 화상, 동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제3조 (약관의 효력 및 변경)</h3>
            <p>
            회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 &quot;약관의 규제에 관한 법률&quot;, &quot;정보통신망 이용촉진 및 정보보호 등에 관한 법률&quot; 등 관련 법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제4조 (서비스의 제공 및 변경)</h3>
            <p>회사는 회원에게 아래와 같은 서비스를 제공합니다.</p>
            <p className="pl-4">우리꺼적고</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제5조 (회원의 의무)</h3>
            <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>타인의 정보 도용</li>
              <li>회사 또는 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>공공질서 및 미풍양속에 위반되는 내용의 정보, 문장, 도형, 음성 등을 타인에게 유포하는 행위</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t">
          <DialogClose asChild>
            <Button type="button" onClick={onClose}>
              닫기
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
