'use client'

import type { Template } from '@/api/templates';
import { Button } from '@/components/ui/button';
import { Clock, Flag, ListChecks, Pencil, Target, Trash2 } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
  onUseTemplate: () => void;
}

const priorityMeta: Record<Template['priority'], { label: string; className: string; accent: string }> = {
  HIGH: {
    label: '높음',
    className: 'bg-[#5D6E72] text-white',
    accent: 'text-[#5D6E72]',
  },
  MEDIUM: {
    label: '보통',
    className: 'bg-[#BBDCE5] text-[#0F1C21]',
    accent: 'text-[#3E6B79]',
  },
  LOW: {
    label: '낮음',
    className: 'bg-[#DDEDF2] text-[#0F1C21]',
    accent: 'text-[#3E6B79]',
  },
};

export function TemplateCard({ template, onEdit, onDelete, onUseTemplate }: TemplateCardProps) {
  const { title, priority, duration, subTemplates } = template;
  const badge = priorityMeta[priority];

  return (
    <div className="rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-xs transition-all hover:shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/40">Goal Template</p>
          <h3 className="mt-1 text-lg font-bold text-[#0F1C21] line-clamp-2">{title}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#0F1C21]">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#5D6E72]" />
          <span className="font-medium">{duration}일 루틴</span>
        </div>
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-[#5D6E72]" />
          <span className="font-medium">{subTemplates.length}단계</span>
        </div>
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-[#5D6E72]" />
          <span className={`font-semibold ${badge.accent}`}>{badge.label} 우선</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-[#EEF5F7] p-3 text-sm text-[#0F1C21] shadow-inner">
        {subTemplates.length === 0 ? (
          <p className="text-black/50">하위 템플릿이 아직 없어요.</p>
        ) : (
          <ul className="space-y-1">
            {subTemplates.slice(0, 5).map((sub) => (
              <li key={sub.sub_template_id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#99C6D6]" />
                <span className="truncate">{sub.title}</span>
              </li>
            ))}
            {subTemplates.length > 5 && (
              <li className="text-xs text-black/50">외 {subTemplates.length - 5}개 항목</li>
            )}
          </ul>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 sm:mt-5">
        <Button
          className="flex-1 rounded-2xl bg-[#ff8b6b] px-4 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[#ff7a56] sm:py-5"
          onClick={onUseTemplate}
        >
          <Target className="h-4 w-4" />
          <span>목표 생성</span>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-2xl bg-[#EEF5F7] text-[#0F1C21]"
          onClick={onEdit}
          aria-label="템플릿 수정"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-2xl text-red-500 hover:bg-red-50"
          onClick={onDelete}
          aria-label="템플릿 삭제"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
