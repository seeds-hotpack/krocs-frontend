import React from "react"
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
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#0F1C21]">{title}</h2>
          <p className="text-sm text-[#5D6E72]">{message}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-[#D3E6ED] text-[#5D6E72]">
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1 bg-[#ff8b6b] text-white hover:bg-[#ff7a56]">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
