import { Button } from "@/components/ui/button"

interface RetrospectiveExitModalProps {
  isOpen: boolean
  title: string
  message: string
  onRequestClose: () => void
  onContinueWriting: () => void
  onSkipRetrospective: () => void
  onCancelCompletion: () => void
  isSkipSubmitting: boolean
  errorMessage?: string | null
}

export function RetrospectiveExitModal({
  isOpen,
  title,
  message,
  onRequestClose,
  onContinueWriting,
  onSkipRetrospective,
  onCancelCompletion,
  isSkipSubmitting,
  errorMessage,
}: RetrospectiveExitModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onRequestClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#0F1C21]">{title}</h2>
          <p className="text-sm text-[#5D6E72]">{message}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={onContinueWriting}
            className="w-full justify-center rounded-2xl border-[#D3E6ED] bg-white text-sm font-semibold text-[#0F1C21] hover:bg-white/80"
          >
            계속 작성
          </Button>
          <Button
            onClick={onSkipRetrospective}
            disabled={isSkipSubmitting}
            className="w-full justify-center rounded-2xl bg-[#5D6E72] text-sm font-semibold text-white hover:bg-[#48575b] disabled:opacity-50"
          >
            {isSkipSubmitting ? "처리 중..." : "회고 건너뛰고 완료"}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancelCompletion}
            className="w-full justify-center rounded-2xl border border-[#FFD1CC] bg-[#FFF3F0] text-sm font-semibold text-[#D64545] hover:bg-[#FFE1DB]"
          >
            취소
          </Button>
        </div>

        {errorMessage && (
          <p className="mt-4 text-center text-sm font-semibold text-red-500">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}
