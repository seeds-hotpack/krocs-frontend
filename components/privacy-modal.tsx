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
            <h3 className="font-semibold text-base">제1조 (개인정보의 처리 목적)</h3>
            <p>
              Krocs(이하 &quot;회사&quot;)는 개인정보를 다음의 목적을 위해 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적</li>
              <li>서비스 제공: 목표 관리, 세부목표 계획, 일정 관리, 회고 작성 및 분석 등 콘텐츠 제공, 맞춤형 서비스 제공</li>
              <li>고충처리: 이용자의 신원 확인, 고충사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 목적</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제2조 (개인정보의 수집 항목 및 방법)</h3>
            <p className="font-semibold">1. 수집 항목</p>
            <p>회사는 회원가입 및 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>
            
            <div className="pl-4 space-y-2">
              <p className="font-semibold">가. 필수 수집 항목 (소셜 로그인 시)</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Google 로그인: 이메일 주소, 이름, 프로필 사진</li>
                <li>Naver 로그인: 이메일 주소, 이름, 프로필 사진</li>
                <li>Kakao 로그인: 이메일 주소, 닉네임, 프로필 사진</li>
              </ul>

              <p className="font-semibold">나. 서비스 이용 과정에서 생성되는 정보</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>서비스 이용 기록: 목표, 세부목표, 일정, 회고 등 작성한 콘텐츠</li>
                <li>접속 로그, 쿠키, 접속 IP 정보, 방문 일시</li>
              </ul>
            </div>

            <p className="font-semibold mt-2">2. 수집 방법</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>소셜 로그인 (Google, Naver, Kakao) 시 해당 플랫폼으로부터 정보 수신</li>
              <li>서비스 이용 과정에서 이용자가 직접 입력</li>
              <li>생성정보 수집 툴을 통한 자동 수집</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제3조 (개인정보의 보유 및 이용기간)</h3>
            <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            
            <ol className="list-decimal list-inside pl-4 space-y-2">
              <li>회원 가입 및 관리: 서비스 이용계약 체결 시부터 서비스 이용계약 해지 시까지. 다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지
                <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                  <li>관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우: 해당 수사·조사 종료 시까지</li>
                  <li>서비스 이용에 따른 채권·채무관계 잔존 시: 해당 채권·채무관계 정산 시까지</li>
                </ul>
              </li>
              <li>부정 이용 방지: 회원 탈퇴 후 1년 (이메일, 닉네임)</li>
            </ol>

            <p className="font-semibold mt-2">관계 법령에 의한 정보보유 사유</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li>서비스 방문 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제4조 (개인정보의 제3자 제공)</h3>
            <p>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
            <p>회사는 현재 개인정보를 제3자에게 제공하고 있지 않습니다.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제5조 (개인정보처리의 위탁)</h3>
            <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
            
            <table className="w-full border-collapse border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">위탁받는 자</th>
                  <th className="border border-gray-300 p-2">위탁업무 내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Google</td>
                  <td className="border border-gray-300 p-2">소셜 로그인 인증</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Naver</td>
                  <td className="border border-gray-300 p-2">소셜 로그인 인증</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Kakao</td>
                  <td className="border border-gray-300 p-2">소셜 로그인 인증</td>
                </tr>
              </tbody>
            </table>

            <p className="mt-2">회사는 위탁계약 체결 시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제6조 (정보주체의 권리·의무 및 행사방법)</h3>
            <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ol>

            <p className="mt-2">제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
            <p>정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</p>
            <p>제1항에 따른 권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 개인정보 보호법 시행규칙 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제7조 (개인정보의 파기)</h3>
            <p className="font-semibold">1. 파기절차</p>
            <p className="pl-4">회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</p>

            <p className="font-semibold mt-2">2. 파기기한</p>
            <p className="pl-4">이용자의 개인정보는 개인정보의 보유기간이 경과된 경우에는 보유기간의 종료일로부터 5일 이내에, 개인정보의 처리 목적 달성 등 그 개인정보가 불필요하게 되었을 때에는 개인정보의 처리가 불필요한 것으로 인정되는 날로부터 5일 이내에 그 개인정보를 파기합니다.</p>

            <p className="font-semibold mt-2">3. 파기방법</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>전자적 파일 형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
              <li>종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제8조 (개인정보의 안전성 확보조치)</h3>
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
              <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
              <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)</h3>
            <p className="font-semibold">1. 쿠키의 사용 목적</p>
            <p className="pl-4">회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 &apos;쿠키(cookie)&apos;를 사용합니다. 쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자의 PC 컴퓨터 내의 하드디스크에 저장되기도 합니다.</p>

            <p className="font-semibold mt-2">2. 쿠키의 설치·운영 및 거부</p>
            <p className="pl-4">이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서 이용자는 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다. 다만, 쿠키의 저장을 거부할 경우 로그인이 필요한 일부 서비스는 이용에 어려움이 있을 수 있습니다.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제10조 (개인정보 보호책임자)</h3>
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            
            <div className="pl-4 mt-2 space-y-1">
              <p className="font-semibold">개인정보 보호책임자</p>
              <ul className="list-none pl-4 space-y-1">
                <li>이메일: krocs8824@gmail.com</li>
              </ul>
            </div>

            <p className="mt-2">정보주체는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다. 회사는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제11조 (권익침해 구제방법)</h3>
            <p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
            
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
              <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
              <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
              <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">제12조 (개인정보 처리방침의 변경)</h3>
            <p>본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">부칙</h3>
            <p>본 방침은 2025년 11월 24일부터 시행합니다.</p>
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
