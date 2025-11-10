"use client"

export function DifferentiationSection() {
  return (
    <section id="differentiation" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 break-keep text-balance">
            단순한 일정 관리와는 다릅니다.
          </h2>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse rounded-2xl overflow-hidden shadow-lg">
            <thead>
              <tr style={{ backgroundColor: "var(--landing-table-header)" }}>
                <th className="p-3 md:p-4 text-left text-xs md:text-sm lg:text-base font-bold text-white">구분</th>
                <th className="p-3 md:p-4 text-left text-xs md:text-sm lg:text-base font-bold text-white">기존 앱</th>
                <th className="p-3 md:p-4 text-left text-xs md:text-sm lg:text-base font-bold text-white">Krocs</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: "var(--landing-table-row)" }}>
                <td className="p-3 md:p-4 text-xs md:text-sm lg:text-base font-semibold border-b border-white break-keep text-balance">
                  동기 구조
                </td>
                <td className="p-3 md:p-4 text-xs md:text-sm lg:text-base text-muted-foreground border-b border-white break-keep text-balance">
                  외부 자극 (금전/챌린지)
                </td>
                <td
                  className="p-3 md:p-4 text-xs md:text-sm lg:text-base font-semibold border-b border-white break-keep text-balance"
                  style={{ color: "var(--landing-accent-dark)" }}
                >
                  내부 피드백 (복기, 감정, 의미)
                </td>
              </tr>
              <tr style={{ backgroundColor: "var(--landing-table-row-alt)" }}>
                <td className="p-3 md:p-4 text-xs md:text-sm lg:text-base font-semibold border-b border-white">초점</td>
                <td className="p-3 md:p-4 text-xs md:text-sm lg:text-base text-muted-foreground border-b border-white">
                  목표 달성
                </td>
                <td
                  className="p-3 md:p-4 text-xs md:text-sm lg:text-base font-semibold border-b border-white break-keep text-balance"
                  style={{ color: "var(--landing-accent-dark)" }}
                >
                  실행 루프와 회복 루프
                </td>
              </tr>
              <tr style={{ backgroundColor: "var(--landing-table-row)" }}>
                <td className="p-3 md:p-4 text-xs md:text-sm lg:text-base font-semibold border-b border-white break-keep text-balance">
                  설계 철학
                </td>
                <td className="p-3 md:p-4 text-xs md:text-sm lg:text-base text-muted-foreground border-b border-white">
                  효율
                </td>
                <td
                  className="p-3 md:p-4 text-xs md:text-sm lg:text-base font-semibold border-b border-white"
                  style={{ color: "var(--landing-accent-dark)" }}
                >
                  유연성
                </td>
              </tr>
              <tr style={{ backgroundColor: "var(--landing-table-row-alt)" }}>
                <td className="p-3 md:p-4 text-xs md:text-sm lg:text-base font-semibold">사용자 경험</td>
                <td className="p-3 md:p-4 text-xs md:text-sm lg:text-base text-muted-foreground">일정 관리</td>
                <td className="p-3 md:p-4 text-xs md:text-sm lg:text-base font-semibold" style={{ color: "var(--landing-accent-dark)" }}>
                  시간 조율
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
