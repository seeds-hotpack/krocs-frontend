'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TemplateCard } from '@/components/template-card';
import { TemplateForm } from '@/components/template-form';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { GoalForm } from '@/components/goal-form';
import { AppNavigationBar } from '@/components/app-navigation-bar';
import { createGoal as createGoalApi } from '@/api/createGoal';
import type { Goal } from '@/api/goals';
import {
  createTemplate,
  updateTemplate,
  createSubTemplates,
  getTemplates,
  deleteTemplate,
  deleteSubTemplate,
  type PaginatedTemplatesResponse,
  type Template as ApiTemplate,
} from '@/api/templates';
import { Plus, Search, Target } from 'lucide-react';
import { toKoreanDateString, toKoreanISOString } from '@/lib/korean-time';

type Template = ApiTemplate;

const priorityColorMap: Record<Template['priority'], string> = {
  HIGH: '#5D6E72',
  MEDIUM: '#BBDCE5',
  LOW: '#DDEDF2',
};

const priorityLabelMap: Record<Template['priority'], string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

const formatDate = (date: Date) => toKoreanDateString(date);

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 6;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [templateForGoal, setTemplateForGoal] = useState<Template | null>(null);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const listSectionRef = useRef<HTMLDivElement | null>(null);

  const priorityCounts = useMemo(
    () =>
      templates.reduce(
        (acc, template) => {
          acc[template.priority] = (acc[template.priority] || 0) + 1;
          return acc;
        },
        { HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<Template['priority'], number>,
      ),
    [templates],
  );

  const averageDuration = useMemo(() => {
    if (templates.length === 0) return 0;
    const totalDuration = templates.reduce((sum, template) => sum + (template.duration || 0), 0);
    return Math.round(totalDuration / templates.length);
  }, [templates]);

  const goalPrefill = useMemo<Goal | null>(() => {
    if (!templateForGoal) return null;
    const today = new Date();
    const durationDays = Math.max(templateForGoal.duration || 1, 1);
    const end = new Date(today);
    end.setDate(end.getDate() + durationDays - 1);

    return {
      goalId: templateForGoal.templateId,
      title: templateForGoal.title,
      priority: templateForGoal.priority,
      color: priorityColorMap[templateForGoal.priority],
    startDate: toKoreanDateString(today),
    endDate: toKoreanDateString(end),
      duration: durationDays,
      completed: false,
      subGoals: templateForGoal.subTemplates.map((sub) => ({
        sub_goal_id: sub.sub_template_id,
        title: sub.title,
        completed: false,
      })),
      completionPercentage: 0,
      createdAt: toKoreanISOString(),
      updatedAt: toKoreanISOString(),
    };
  }, [templateForGoal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const fetchTemplatesData = useCallback(
    async (
      searchValue: string = debouncedSearchTerm,
      pageValue: number = currentPage,
    ): Promise<PaginatedTemplatesResponse> => {
      return getTemplates(searchValue, { page: pageValue - 1, size: itemsPerPage, sort: 'createdAt,desc' });
    },
    [debouncedSearchTerm, currentPage, itemsPerPage],
  );

  const applyTemplateResponse = (response: PaginatedTemplatesResponse) => {
    setTemplates(response.content);
    setTotalPages(response.totalPages);
    setTotalTemplates(response.totalElements);
  };

  useEffect(() => {
    let isMounted = true;

    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetchTemplatesData();
        if (!isMounted) return;
        applyTemplateResponse(response);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError('템플릿을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTemplates();

    return () => {
      isMounted = false;
    };
  }, [fetchTemplatesData]);

  const handleAddNew = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = (templateId: number) => {
    setTemplateToDelete(templateId);
    setShowDeleteModal(true);
  };

  const handleUseTemplate = (template: Template) => {
    setTemplateForGoal(template);
    setShowGoalForm(true);
  };

  const closeGoalForm = () => {
    setShowGoalForm(false);
    setTemplateForGoal(null);
  };

  const confirmDeleteTemplate = async () => {
    if (templateToDelete === null) return;

    try {
      await deleteTemplate(templateToDelete);
      const response = await fetchTemplatesData();
      applyTemplateResponse(response);
      if (response.content.length === 0 && currentPage > 1) {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
      alert('템플릿 삭제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    }
  };

  const handleFormSubmit = async (formData: Omit<Template, 'templateId'>) => {
    try {
      if (editingTemplate) {
        const templateData = {
          title: formData.title,
          priority: formData.priority,
          duration: formData.duration,
        };
        await updateTemplate(editingTemplate.templateId, templateData);

        const originalSubTemplates = editingTemplate.subTemplates || [];
        const finalSubTemplates = formData.subTemplates || [];

        const originalIds = new Set(originalSubTemplates.map((st) => st.sub_template_id));
        const finalIds = new Set(finalSubTemplates.map((st) => st.sub_template_id));

        const deletedIds = originalSubTemplates
          .filter((st) => !finalIds.has(st.sub_template_id))
          .map((st) => st.sub_template_id);

        if (deletedIds.length > 0) {
          await Promise.all(deletedIds.map((id) => deleteSubTemplate(editingTemplate.templateId, id)));
        }

        const newSubTemplates = finalSubTemplates
          .filter((st) => !originalIds.has(st.sub_template_id))
          .map((st) => ({ title: st.title }));

        if (newSubTemplates.length > 0) {
          await createSubTemplates(editingTemplate.templateId, newSubTemplates);
        }
      } else {
        const templateData = {
          title: formData.title,
          priority: formData.priority,
          duration: formData.duration,
        };
        const newTemplateResult = await createTemplate(templateData);
        const subTemplatesToCreate = (formData.subTemplates || []).map((st) => ({ title: st.title }));
        if (subTemplatesToCreate.length > 0) {
          await createSubTemplates(newTemplateResult.templateId, subTemplatesToCreate);
        }
      }

      const response = await fetchTemplatesData();
      applyTemplateResponse(response);
      setShowForm(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        alert('이미 사용 중인 템플릿 제목입니다. 다른 제목을 사용해주세요.');
      } else {
        alert('템플릿 저장에 실패했습니다.');
        setShowForm(false);
        setEditingTemplate(null);
      }
    }
  };

  const isValidGoalPayload = (payload: {
    title?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    color?: string;
  }) => {
    if (!payload.title || !payload.title.trim()) {
      alert('목표 이름을 입력해 주세요.');
      return false;
    }
    if (!payload.priority || !['HIGH', 'MEDIUM', 'LOW'].includes(payload.priority)) {
      alert('중요도를 선택해 주세요.');
      return false;
    }
    if (!payload.startDate || !payload.endDate) {
      alert('시작일과 종료일을 모두 입력해 주세요.');
      return false;
    }
    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      alert('유효한 날짜를 입력해 주세요.');
      return false;
    }
    if (start > end) {
      alert('시작일은 종료일보다 늦을 수 없습니다.');
      return false;
    }
    if (!payload.color || !payload.color.trim()) {
      alert('목표 색상을 선택해 주세요.');
      return false;
    }
    return true;
  };

  const handleGoalCreate = async (goalPayload: {
    title: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    startDate: string;
    endDate: string;
    color: string;
  }) => {
    if (!isValidGoalPayload(goalPayload)) {
      return;
    }

    setIsCreatingGoal(true);
    try {
      await createGoalApi(1, goalPayload);
      alert('템플릿을 기반으로 목표를 생성했습니다.');
      closeGoalForm();
    } catch (err) {
      console.error('Failed to create goal from template:', err);
      alert('목표 생성에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const skeletonCards = Array.from({ length: 3 }).map((_, index) => (
    <div
      key={index}
      className="h-32 rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-xs animate-pulse"
    >
      <div className="h-4 w-3/4 rounded-full bg-[#BBDCE5]/40" />
      <div className="mt-4 h-3 w-1/2 rounded-full bg-[#BBDCE5]/30" />
      <div className="mt-6 h-2 w-full rounded-full bg-[#BBDCE5]/20" />
    </div>
  ));

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#0F1C21]">
      <AppNavigationBar className="sticky top-0 z-30" contentClassName="w-full max-w-7xl px-6" />

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-6">

        <section className="rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <Search className="h-4 w-4 text-[#5D6E72]" />
              </div>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="템플릿 제목으로 검색해 보세요"
                className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-[#EEF5F7] pl-12 text-sm placeholder:text-[#5D6E72]/60"
              />
            </div>
            <Button
              variant="ghost"
              className="rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] text-sm font-semibold text-[#0F1C21]"
              onClick={handleAddNew}
            >
              <Plus className="h-4 w-4" />
              <span className="ml-1">추가</span>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-[#0F1C21]">
            {(Object.keys(priorityLabelMap) as Array<Template['priority']>).map((priority) => (
              <div
                key={priority}
                className="rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] px-3 py-2"
              >
                <p>{priorityLabelMap[priority]}</p>
                <p className="mt-0.5 text-black/60">{priorityCounts[priority]}개</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4" ref={listSectionRef}>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold">나의 템플릿</h3>
            <span className="text-xs font-semibold text-black/50">
              총 {totalTemplates}개 · {currentPage}/{Math.max(totalPages, 1)}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">{skeletonCards}</div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-3xl border border-[#D3E6ED] bg-white p-10 text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#BBDCE5]/40">
                <Target className="h-7 w-7 text-[#0F1C21]" />
              </div>
              <p className="text-base font-semibold">
                {searchTerm ? '검색 결과가 없습니다.' : '저장된 템플릿이 없어요.'}
              </p>
              <p className="mt-2 text-sm text-black/60">
                {searchTerm ? '검색어를 바꾸거나 새로운 템플릿을 만들어보세요.' : '첫 템플릿을 만들어 목표를 빠르게 생성해보세요.'}
              </p>
              <Button
                className="mt-5 rounded-full bg-[#ff8b6b] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#ff7a56]"
                onClick={handleAddNew}
              >
                <Plus className="h-4 w-4" />
                <span className="ml-2">새 템플릿 만들기</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.templateId}
                  template={template}
                  onEdit={() => handleEdit(template)}
                  onDelete={() => handleDelete(template.templateId)}
                  onUseTemplate={() => handleUseTemplate(template)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#99C6D6] px-4 text-sm font-semibold text-[#0F1C21]"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              <span className="text-xs font-semibold text-black/60">
                {currentPage}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#99C6D6] px-4 text-sm font-semibold text-[#0F1C21]"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#D3E6ED] bg-white shadow-2xl">
            <TemplateForm
              template={editingTemplate}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTemplate(null);
              }}
            />
          </div>
        </div>
      )}

      {showGoalForm && goalPrefill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-2xl">
            <GoalForm goal={goalPrefill} onSubmit={handleGoalCreate} onCancel={closeGoalForm} />
          </div>
        </div>
      )}

      {isCreatingGoal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#0F1C21] shadow-lg">
            목표를 생성하는 중입니다...
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteTemplate}
        title="템플릿 삭제 확인"
        message="정말로 이 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
      />
    </div>
  );
}
