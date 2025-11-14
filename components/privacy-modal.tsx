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

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">개인정보처리방침</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제1조 (총칙)</h3>
            <p>
              krocs(이하 &quot;회사&quot;)은 귀하의 개인정보보호를 매우 중요시하며, 『개인정보보호법』을 준수하고 있습니다. 회사는 개인정보처리방침을 통하여 귀하께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제2조 (개인정보의 수집 항목 및 이용 목적)</h3>
            <p>회사는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 아래와 같은 최소한의 개인정보를 필수항목으로 수집하고 있습니다.</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>수집 항목: 이메일 주소, 닉네임, 프로필 사진, 소셜 로그인 정보 식별자</li>
              <li>이용 목적: 회원 식별, 서비스 제공, 고객 지원, 공지사항 전달</li>
            </ul>
            <p>회사는 수집한 개인정보를 다음의 목적 이외의 용도로는 이용하지 않으며, 이용 목적이 변경될 시에는 사전 동의를 구할 것입니다.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제3조 (개인정보의 보유 및 이용기간)</h3>
            <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>보존 항목: 이메일, 닉네임</li>
              <li>보존 근거: 서비스 이용의 혼선 방지, 불법적 사용자에 대한 관련 기관 수사협조</li>
              <li>보존 기간: 회원 탈퇴 후 1년</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제4조 (개인정보의 파기절차 및 방법)</h3>
            <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>파기절차: 회원님이 회원가입 등을 위해 입력하신 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다.</li>
              <li>파기방법: 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base">제5조 (개인정보 제공)</h3>
            <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>이용자들이 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
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
