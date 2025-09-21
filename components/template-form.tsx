'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Template, SubTemplate } from '@/app/templates/page';
import { updateSubTemplate, deleteSubTemplate } from '@/api/templates';

interface TemplateFormProps {
  template?: Template | null;
  onSubmit: (data: Omit<Template, 'templateId'>) => void;
  onCancel: () => void;
}

export function TemplateForm({ template, onSubmit, onCancel }: TemplateFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [duration, setDuration] = useState(1);
  const [subTemplates, setSubTemplates] = useState<SubTemplate[]>([]);

  const [newSubTemplateTitle, setNewSubTemplateTitle] = useState('');
  const [editingSubTemplate, setEditingSubTemplate] = useState<SubTemplate | null>(null);
  const [editingSubTemplateTitle, setEditingSubTemplateTitle] = useState('');
  const [durationError, setDurationError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setDuration(template.duration);
      setSubTemplates(template.subTemplates || []);

      const p = template.priority as string; // Cast to string to allow for case-insensitive comparison
      if (p === 'HIGH' || p === 'high') {
        setPriority('HIGH');
      } else if (p === 'LOW' || p === 'low') {
        setPriority('LOW');
      } else if (p === 'MEDIUM' || p === 'medium') {
        setPriority('MEDIUM');
      } else {
        setPriority('MEDIUM'); // Fallback for any other case
      }
    } else {
      setTitle('');
      setPriority('MEDIUM');
      setDuration(1);
      setSubTemplates([]);
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('템플릿 제목을 입력해주세요.');
      return;
    }
    if (duration < 1) {
      alert('소요시간을 1일 이상 입력해주세요.');
      return;
    }
    if (duration > 36500) {
      setDurationError("적절한 소요시간을 입력해 주세요.");
      return;
    }
    if (durationError) { // Redundant check for safety
        return;
    }
    onSubmit({ title, priority, duration, subTemplates });
  };

  const handleAddSubTemplate = () => {
    if (!newSubTemplateTitle.trim()) return;
    const newSub: SubTemplate = {
      sub_template_id: Date.now(), // 임시 ID
      template_id: template?.templateId || 0,
      title: newSubTemplateTitle.trim(),
    };
    setSubTemplates([...subTemplates, newSub]);
    setNewSubTemplateTitle('');
  };

  const handleRemoveSubTemplate = (id: number) => {
    if (!confirm("정말로 이 하위 템플릿을 삭제하시겠습니까?")) {
      return; // User cancelled, do nothing
    }
    setSubTemplates(subTemplates.filter((st) => st.sub_template_id !== id));
  };

  const handleStartEditSubTemplate = (sub: SubTemplate) => {
    setEditingSubTemplate(sub);
    setEditingSubTemplateTitle(sub.title);
  };

  const handleCancelEditSubTemplate = () => {
    setEditingSubTemplate(null);
    setEditingSubTemplateTitle('');
  };

  const handleSaveSubTemplate = async () => {
    if (!editingSubTemplate || !editingSubTemplateTitle.trim() || !template) return;

    if (editingSubTemplate.sub_template_id > 100000) {
        setSubTemplates(
          subTemplates.map((st) =>
            st.sub_template_id === editingSubTemplate.sub_template_id
              ? { ...st, title: editingSubTemplateTitle.trim() }
              : st
          )
        );
        handleCancelEditSubTemplate();
        return;
    }

    try {
      const updatedSubTemplate = await updateSubTemplate(template.templateId, editingSubTemplate.sub_template_id, {
        title: editingSubTemplateTitle.trim(),
      });
      setSubTemplates(
        subTemplates.map((st) =>
          st.sub_template_id === editingSubTemplate.sub_template_id
            ? { ...st, ...updatedSubTemplate }
            : st
        )
      );
      handleCancelEditSubTemplate();
    } catch (error) {
      console.error('Failed to update sub-template:', error);
      alert('하위 템플릿 수정에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {template ? '템플릿 수정' : '새 템플릿 추가'}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-slate-100 dark:hover:bg-slate-700">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">템플릿 제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 주간 업무 보고"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">우선순위</Label>
          <Select 
            value={priority}
            onValueChange={(v) => {
              if (v === 'HIGH' || v === 'MEDIUM' || v === 'LOW') {
                setPriority(v);
              }
            }}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="우선순위 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">높음</SelectItem>
              <SelectItem value="MEDIUM">중간</SelectItem>
              <SelectItem value="LOW">낮음</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">예상 소요 시간 (일)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 0;
              setDuration(val);
              if (val > 36500) {
                setDurationError("적절한 소요시간을 입력해 주세요.");
              } else {
                setDurationError(null);
              }
            }}
            placeholder="예: 7"
            required
            className={durationError ? 'border-red-500' : ''}
          />
          {durationError && <p className="text-sm text-red-500 mt-1">{durationError}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <Label>하위 템플릿 목록</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {subTemplates.map((sub) => (
            <div key={sub.sub_template_id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
              {editingSubTemplate?.sub_template_id === sub.sub_template_id ? (
                <Input
                  value={editingSubTemplateTitle}
                  onChange={(e) => setEditingSubTemplateTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSubTemplate()}
                  autoFocus
                  className="flex-1 h-8"
                />
              ) : (
                <span className="flex-1 text-sm text-slate-800 dark:text-slate-200">{sub.title}</span>
              )}

              {editingSubTemplate?.sub_template_id === sub.sub_template_id ? (
                <Button type="button" size="sm" onClick={handleSaveSubTemplate}>저장</Button>
              ) : (
                <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStartEditSubTemplate(sub)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleRemoveSubTemplate(sub.sub_template_id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Input
            value={newSubTemplateTitle}
            onChange={(e) => setNewSubTemplateTitle(e.target.value)}
            placeholder="새 하위 템플릿 제목 입력"
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubTemplate();
                }
            }}
          />
          <Button type="button" onClick={handleAddSubTemplate} disabled={!newSubTemplateTitle.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            추가
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {template ? '템플릿 저장' : '템플릿 생성'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          취소
        </Button>
      </div>
    </form>
  );
}
