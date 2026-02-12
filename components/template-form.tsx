'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Pencil, Trash2, Sparkles, Flag, Clock } from 'lucide-react';
import type { Template } from '@/api/templates';
import { updateSubTemplate, deleteSubTemplate } from '@/api/templates';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { toKoreanISOString } from '@/lib/korean-time';

type EditableSubTemplate = Template['subTemplates'][number];

interface TemplateFormProps {
  template?: Template | null;
  onSubmit: (data: Omit<Template, 'templateId'>) => void;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>;
}

export function TemplateForm({ template, onSubmit, onCancel, onDelete }: TemplateFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [duration, setDuration] = useState<number | ''>('');
  const [subTemplates, setSubTemplates] = useState<EditableSubTemplate[]>([]);

  const [newSubTemplateTitle, setNewSubTemplateTitle] = useState('');
  const [editingSubTemplate, setEditingSubTemplate] = useState<EditableSubTemplate | null>(null);
  const [editingSubTemplateTitle, setEditingSubTemplateTitle] = useState('');
  const [durationError, setDurationError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subTemplateToDelete, setSubTemplateToDelete] = useState<number | null>(null);
  const [showTemplateDeleteModal, setShowTemplateDeleteModal] = useState(false);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setDuration(template.duration);
      setSubTemplates(template.subTemplates || []);

      const p = template.priority as string;
      if (p && (p.toUpperCase() === 'HIGH' || p.toUpperCase() === 'MEDIUM' || p.toUpperCase() === 'LOW')) {
        setPriority(p.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW');
      } else {
        setPriority('MEDIUM');
      }
    } else {
      setTitle('');
      setPriority('MEDIUM');
      setDuration('');
      setSubTemplates([]);
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('템플릿 제목을 입력해주세요.');
      return;
    }
    const durationNum = typeof duration === 'number' ? duration : parseInt(String(duration), 10);
    if (!duration || durationNum < 1) {
      alert('소요시간을 1일 이상 입력해주세요.');
      return;
    }
    if (durationNum > 36500) {
      setDurationError("적절한 소요시간을 입력해 주세요.");
      return;
    }
    if (durationError) {
        return;
    }
    onSubmit({ title, priority, duration: durationNum, subTemplates });
  };

  const handleAddSubTemplate = () => {
    if (!newSubTemplateTitle.trim()) return;
    const newSub: EditableSubTemplate = {
      sub_template_id: Date.now(),
      template_id: template?.templateId || 0,
      title: newSubTemplateTitle.trim(),
      created_at: toKoreanISOString(),
      updated_at: toKoreanISOString(),
    };
    setSubTemplates([...subTemplates, newSub]);
    setNewSubTemplateTitle('');
  };

  const handleRemoveSubTemplate = (id: number) => {
    setSubTemplateToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmRemoveSubTemplate = () => {
    if (subTemplateToDelete === null) return;
    setSubTemplates(subTemplates.filter((st) => st.sub_template_id !== subTemplateToDelete));
    setShowDeleteModal(false);
    setSubTemplateToDelete(null);
  };

  const handleStartEditSubTemplate = (sub: EditableSubTemplate) => {
    setEditingSubTemplate(sub);
    setEditingSubTemplateTitle(sub.title);
  };

  const handleCancelEditSubTemplate = () => {
    setEditingSubTemplate(null);
    setEditingSubTemplateTitle('');
  };

  const handleSaveSubTemplate = () => {
    if (!editingSubTemplate || !editingSubTemplateTitle.trim()) return;

    setSubTemplates(
      subTemplates.map((st) =>
        st.sub_template_id === editingSubTemplate.sub_template_id
          ? { ...st, title: editingSubTemplateTitle.trim() }
          : st
      )
    );
    handleCancelEditSubTemplate();
  };

  const handleDeleteTemplate = async () => {
    if (!template || !template.templateId || !onDelete) return;
    await onDelete();
    setShowTemplateDeleteModal(false);
  };

  const getPriorityLabel = (p: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (p) {
      case "HIGH": return "높음";
      case "MEDIUM": return "보통";
      case "LOW": return "낮음";
      default: return p;
    }
  }

  return (
    <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="relative px-6 py-5 bg-gradient-to-br from-[#ff8b6b] to-[#ff6b47] overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-white flex-shrink-0" />
            <h2 className="text-lg font-bold text-white">
              {template ? '템플릿 수정' : '새 템플릿 생성'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <span>템플릿 제목</span>
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 주간 업무 보고"
            className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-base text-[#0F1C21] placeholder:text-[#5D6E72]/50 focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20 transition-all"
            required
          />
        </div>

        {/* Priority Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <Flag className="h-4 w-4 text-[#5D6E72]" />
            <span>중요도</span>
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => {
              const isSelected = priority === p;
              const colors = {
                HIGH: "from-[#5D6E72] to-[#3D4E52]",
                MEDIUM: "from-[#BBDCE5] to-[#99C6D6]",
                LOW: "from-[#DDEDF2] to-[#C8DCE6]"
              };
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`h-12 rounded-2xl font-semibold text-sm transition-all ${
                    isSelected 
                      ? `bg-gradient-to-br ${colors[p]} text-white shadow-lg scale-105` 
                      : "bg-[#EEF5F7] text-[#5D6E72] hover:bg-[#E0EEF3]"
                  }`}
                >
                  {getPriorityLabel(p)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Duration Input */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#5D6E72]" />
            <span>예상 소요 시간 (일)</span>
          </Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (inputValue === '') {
                setDuration('');
                setDurationError(null);
              } else {
                const val = parseInt(inputValue, 10);
                setDuration(val);
                if (val > 36500) {
                  setDurationError("적절한 소요시간을 입력해 주세요.");
                } else {
                  setDurationError(null);
                }
              }
            }}
            placeholder="예: 7"
            className={`h-12 rounded-2xl border-2 bg-white text-base text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20 transition-all ${durationError ? 'border-red-500' : 'border-[#D3E6ED]'}`}
            required
          />
          {durationError && <p className="text-xs text-red-500 mt-1">{durationError}</p>}
        </div>

        {/* Sub Templates Section */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[#0F1C21]">하위 템플릿 목록</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-1">
            {subTemplates.map((sub) => (
              <div key={sub.sub_template_id} className="flex items-center gap-2 p-2 bg-[#EEF5F7] rounded-xl">
                {editingSubTemplate?.sub_template_id === sub.sub_template_id ? (
                  <>
                    <Input
                      value={editingSubTemplateTitle}
                      onChange={(e) => setEditingSubTemplateTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveSubTemplate()}
                      autoFocus
                      className="flex-1 h-9 rounded-lg border-2 border-[#D3E6ED] focus:border-[#ff8b6b]"
                    />
                    <Button type="button" size="sm" onClick={handleSaveSubTemplate} className="h-9 rounded-lg bg-[#ff8b6b] hover:bg-[#ff7a56] text-white">저장</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancelEditSubTemplate} className="h-9 rounded-lg">취소</Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-[#0F1C21]">{sub.title}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full text-[#5D6E72] hover:bg-white/70" onClick={() => handleStartEditSubTemplate(sub)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full text-red-500 hover:bg-red-100" onClick={() => handleRemoveSubTemplate(sub.sub_template_id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Input
              value={newSubTemplateTitle}
              onChange={(e) => setNewSubTemplateTitle(e.target.value)}
              placeholder="새 하위 템플릿 제목"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubTemplate(); } }}
              className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-base text-[#0F1C21] placeholder:text-[#5D6E72]/50 focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20 transition-all"
            />
            <Button type="button" onClick={handleAddSubTemplate} disabled={!newSubTemplateTitle.trim()} className="h-12 rounded-2xl bg-[#5D6E72] hover:bg-[#4D5E62] text-white font-semibold px-5">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-[#5D6E72] font-semibold hover:bg-[#EEF5F7] transition-all"
          >
            취소
          </Button>
          {template && template.templateId > 0 && onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowTemplateDeleteModal(true)}
              className="flex-1 h-12 rounded-2xl border-2 border-[#FFD7D1] bg-white text-[#d85b48] font-semibold hover:bg-[#FFECEA] transition-all"
            >
              삭제
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#ff8b6b] to-[#ff6b47] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            {template ? '템플릿 저장' : '템플릿 생성'}
          </Button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmRemoveSubTemplate}
        title="하위 템플릿 삭제"
        message="정말로 이 하위 템플릿을 삭제하시겠습니까?"
        confirmText="삭제"
      />

      <ConfirmationModal
        isOpen={showTemplateDeleteModal}
        onClose={() => setShowTemplateDeleteModal(false)}
        onConfirm={handleDeleteTemplate}
        title="템플릿 삭제 확인"
        message="정말로 이 템플릿을 삭제하시겠습니까?"
        confirmText="삭제"
      />
    </div>
  );
}
