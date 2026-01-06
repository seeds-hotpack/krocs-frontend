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
              본 약관은 Krocs(이하 &quot;회사&quot;)가 제공하는 목표 관리 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제2조 (용어의 정의)</h3>
            <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>&quot;회원&quot;: 본 약관에 동의하고 회원 가입을 완료한 자로서, 회사가 제공하는 서비스를 지속적으로 이용할 수 있는 자를 말합니다.</li>
              <li>&quot;서비스&quot;: 회사가 제공하는 목표 설정 및 관리, 세부목표 계획, 일정 관리, 회고 작성 및 분석 등 모든 기능을 의미합니다.</li>
              <li>&quot;아이디(ID)&quot;: 회원 식별과 서비스 이용을 위해 회원이 선택하고 회사가 승인한 소셜 로그인 계정을 말합니다.</li>
              <li>&quot;게시물&quot;: 회원이 서비스를 이용하면서 작성한 목표, 세부목표, 일정, 회고 등의 모든 콘텐츠를 말합니다.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제3조 (약관의 효력 및 변경)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면 또는 연결 화면에 게시합니다.</li>
              <li>회사는 &quot;약관의 규제에 관한 법률&quot;, &quot;정보통신망 이용촉진 및 정보보호 등에 관한 법률&quot; 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
              <li>회사가 약관을 개정할 경우 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기 화면에 그 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</li>
              <li>회원이 개정약관의 적용에 동의하지 않는 경우 회사 또는 회원은 서비스 이용계약을 해지할 수 있습니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제4조 (회원가입)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입 신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
              <li>회사는 Google, Naver, Kakao 등 소셜 로그인을 통한 간편 회원가입을 제공합니다.</li>
              <li>회원가입 시 제공되는 정보는 소셜 로그인 제공자로부터 수신한 정보를 기반으로 하며, 회원은 정확한 정보를 제공해야 합니다.</li>
              <li>회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                  <li>타인의 명의를 도용한 경우</li>
                  <li>이용 신청 시 필요사항을 허위로 기재한 경우</li>
                  <li>사회의 안녕질서 또는 미풍양속을 저해할 목적으로 신청한 경우</li>
                  <li>기타 회사가 정한 이용 신청 요건이 미비한 경우</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제5조 (서비스의 제공 및 변경)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회사는 회원에게 아래와 같은 서비스를 제공합니다.
                <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                  <li>목표 설정 및 관리 서비스</li>
                  <li>세부목표 계획 및 추적 서비스</li>
                  <li>일정 및 스케줄 관리 서비스</li>
                  <li>회고 작성 및 분석 서비스</li>
                  <li>목표 템플릿 제공 서비스</li>
                  <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 일체의 서비스</li>
                </ul>
              </li>
              <li>회사는 서비스의 내용을 변경할 경우 변경사항을 서비스 화면에 공지합니다.</li>
              <li>회사는 상당한 이유가 있는 경우 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제6조 (서비스의 중단)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
              <li>회사는 천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우 서비스의 전부 또는 일부를 제한하거나 중지할 수 있습니다.</li>
              <li>회사는 제1항 및 제2항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 회원 또는 제3자가 입은 손해에 대하여는 배상하지 않습니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제7조 (회원의 의무)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회원은 다음 행위를 하여서는 안 됩니다.
                <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                  <li>신청 또는 변경 시 허위 내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사 또는 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 또는 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공공질서 미풍양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                  <li>기타 불법적이거나 부당한 행위</li>
                </ul>
              </li>
              <li>회원은 관계법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제8조 (회사의 의무)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고 안정적으로 서비스를 제공하는 데 최선을 다하여야 합니다.</li>
              <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 회원의 개인정보 보호를 위한 보안 시스템을 구축하며 개인정보처리방침을 공시하고 준수합니다.</li>
              <li>회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 객관적으로 인정될 경우 적절한 절차를 거쳐 즉시 처리하여야 합니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제9조 (개인정보의 보호)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회사는 회원의 개인정보를 보호하기 위하여 정보통신망법 및 개인정보보호법 등 관계 법령에서 정하는 바를 준수합니다.</li>
              <li>회사는 개인정보의 수집 목적 또는 제공받은 목적을 달성한 때에는 당해 개인정보를 지체 없이 파기합니다.</li>
              <li>회사의 개인정보 보호에 관한 자세한 사항은 개인정보처리방침에 따릅니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제10조 (게시물의 관리)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회원의 게시물이 정보통신망법 및 저작권법 등 관련 법령에 위반되는 내용을 포함하는 경우, 권리자는 관련 법령이 정한 절차에 따라 해당 게시물의 게시중단 및 삭제 등을 요청할 수 있으며, 회사는 관련 법령에 따라 조치를 취합니다.</li>
              <li>회사는 전항에 따른 권리자의 요청이 없는 경우라도 권리침해가 인정될 만한 사유가 있거나 기타 회사 정책 및 관련 법령에 위반되는 경우 관련 법령에 따라 해당 게시물에 대해 임시조치 등을 취할 수 있습니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제11조 (저작권의 귀속)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회사가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 회사에 귀속합니다.</li>
              <li>회원은 회사를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
              <li>회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제12조 (계약 해지 및 이용 제한)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회원은 언제든지 서비스 이용을 원하지 않는 경우 회원 탈퇴를 통해 이용계약을 해지할 수 있습니다.</li>
              <li>회사는 회원이 다음 각 호의 사유에 해당하는 경우 사전통지 없이 이용계약을 해지하거나 또는 기간을 정하여 서비스 이용을 중지할 수 있습니다.
                <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                  <li>타인의 서비스 이용을 방해하거나 타인의 개인정보를 도용한 경우</li>
                  <li>서비스를 이용하여 법령 또는 본 약관이 금지하는 행위를 하는 경우</li>
                  <li>기타 회사가 합리적인 판단에 기하여 서비스 제공을 거부할 필요가 있다고 인정할 경우</li>
                </ul>
              </li>
              <li>회사가 이용계약을 해지하는 경우 회사는 회원에게 이메일 등을 통해 통지합니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제13조 (손해배상)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 회사가 고의로 행한 범죄행위를 제외하고는 이에 대하여 책임을 부담하지 아니합니다.</li>
              <li>회원이 본 약관의 규정을 위반함으로 인하여 회사에 손해가 발생하게 되는 경우, 본 약관을 위반한 회원은 회사에 발생하는 모든 손해를 배상하여야 합니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제14조 (면책조항)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
              <li>회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
              <li>회사는 회원이 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제15조 (분쟁의 해결)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회사는 회원으로부터 제출되는 불만사항 및 의견을 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 회원에게 그 사유와 처리일정을 즉시 통보합니다.</li>
              <li>회사와 회원 간 발생한 분쟁은 전자문서 및 전자거래 기본법 제32조 및 동 시행령 제15조에 의하여 설치된 전자문서·전자거래분쟁조정위원회의 조정에 따를 수 있습니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제16조 (재판권 및 준거법)</h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>서비스 이용과 관련하여 회사와 회원 사이에 분쟁이 발생한 경우, 회사와 회원은 분쟁의 해결을 위해 성실히 협의합니다.</li>
              <li>본 약관은 대한민국 법률에 따라 규율되고 해석됩니다.</li>
              <li>회사와 회원 간 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">부칙</h3>
            <p>본 약관은 2025년 11월 24일부터 시행합니다.</p>
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
