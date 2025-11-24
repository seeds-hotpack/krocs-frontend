import React from "react"
import { AlertTriangle, X } from "lucide-react"

import { Button } from "./button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/90 shadow-[0_20px_60px_rgba(15,28,33,0.15)] backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-[#ff8b6b] via-[#ff774f] to-[#ff6b47] px-6 py-5 text-white">
          <div className="absolute inset-0">
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-12 -right-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
          </div>
          <div className="relative flex items-start gap-4">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">확인 필요</p>
              <h2 className="mt-1 text-xl font-bold leading-tight">{title}</h2>
            </div>
            <button
              type="button"
              aria-label="모달 닫기"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white transition hover:bg-white/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 px-6 py-6">
          <div className="rounded-2xl border border-[#FFE2D8] bg-[#FFF6F2] px-4 py-3 text-sm leading-relaxed text-[#5D6E72]">
            {message}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#F5E8E2] px-6 py-6 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 rounded-2xl border-2 border-[#E7EDF1] bg-white font-semibold text-[#5D6E72] hover:bg-[#F5FAFD]"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-gradient-to-r from-[#ff8b6b] to-[#ff6b47] font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
