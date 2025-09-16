'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, ArrowLeft, Search, Sun, Moon, Monitor } from 'lucide-react';
import { TemplateCard } from '@/components/template-card';
import { TemplateForm } from '@/components/template-form';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  createTemplate,
  updateTemplate,
  createSubTemplates,
  getTemplates,
  deleteTemplate,
  deleteSubTemplate,
} from '@/api/templates';

// API 명세에 따른 타입 정의
export interface SubTemplate {
  sub_template_id: number;
  template_id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface Template {
  templateId: number;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  duration: number;
  subTemplates: SubTemplate[];
  createdAt?: string;
  updatedAt?: string;
}

// Debounce custom hook
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
  const [showForm, setShowForm] = useState(false);
  const { theme, setTheme } = useTheme();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const itemsPerPage = 6; // 페이지 당 항목 수

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const fetchedTemplates = await getTemplates(debouncedSearchTerm);
        setTemplates(fetchedTemplates as Template[]);
        setError(null);
      } catch (err) {
        setError("템플릿을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, [debouncedSearchTerm]);

  // 페이지네이션 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = templates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(templates.length / itemsPerPage);

  // 검색어가 변경될 때 현재 페이지를 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleAddNew = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm("정말로 이 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }
    try {
      await deleteTemplate(templateId);
      setTemplates(prevTemplates => prevTemplates.filter((t) => t.templateId !== templateId));
      // alert("템플릿이 성공적으로 삭제되었습니다."); // You might want a more subtle notification
    } catch (err) {
      console.error("Failed to delete template:", err);
      alert("템플릿 삭제에 실패했습니다. 다시 시도해 주세요.");
    }
  };

 const handleFormSubmit = async (formData: Omit<Template, 'templateId'>) => {
    try {
      if (editingTemplate) {
        // 1. Update main template properties
        const templateData = { title: formData.title, priority: formData.priority, duration: formData.duration };
        await updateTemplate(editingTemplate.templateId, templateData);

        const originalSubTemplates = editingTemplate.subTemplates || [];
        const finalSubTemplates = formData.subTemplates || [];

        const originalIds = new Set(originalSubTemplates.map(st => st.sub_template_id));
        const finalIds = new Set(finalSubTemplates.map(st => st.sub_template_id));

        // 2. Find and DELETE removed sub-templates
        const deletedIds = originalSubTemplates
          .filter(st => !finalIds.has(st.sub_template_id))
          .map(st => st.sub_template_id);
        
        if (deletedIds.length > 0) {
          // Concurrently delete all removed sub-templates
          await Promise.all(deletedIds.map(id => deleteSubTemplate(id)));
        }

        // 3. Find and CREATE new sub-templates
        const newSubTemplates = finalSubTemplates
          .filter(st => !originalIds.has(st.sub_template_id))
          .map(st => ({ title: st.title }));

        if (newSubTemplates.length > 0) {
          await createSubTemplates(editingTemplate.templateId, newSubTemplates);
        }

      } else {
        const templateData = { title: formData.title, priority: formData.priority, duration: formData.duration };
        const newTemplateResult = await createTemplate(templateData);
        const subTemplatesToCreate = formData.subTemplates.map(st => ({ title: st.title }));
        if (subTemplatesToCreate.length > 0) {
          await createSubTemplates(newTemplateResult.templateId, subTemplatesToCreate);
        }
      }
      
      // SUCCESS: Re-fetch and close form
      const fetchedTemplates = await getTemplates(debouncedSearchTerm);
      setTemplates(fetchedTemplates as Template[]);
      setShowForm(false);
      setEditingTemplate(null);

    } catch (error) {
      console.error("Failed to save template:", error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        alert("이미 사용 중인 템플릿 제목입니다. 다른 제목을 사용해주세요.");
        // 409 에러 시에는 폼을 닫지 않음
      } else {
        alert("템플릿 저장에 실패했습니다.");
        setShowForm(false);
        setEditingTemplate(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-8 gap-4">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">템플릿 관리</h1>
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-8 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>목표로 돌아가기</span>
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                    placeholder="템플릿 제목으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full"
                />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 bg-transparent"
                >
                  {theme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Monitor className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="h-4 w-4 mr-2" />
                  라이트 모드
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="h-4 w-4 mr-2" />
                  다크 모드
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="h-4 w-4 mr-2" />
                  시스템 설정
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleAddNew} className="flex-shrink-0">
                <PlusCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">새 템플릿 추가</span>
            </Button>
          </div>
        </div>

        {isLoading && <p className="text-center py-10">템플릿을 불러오는 중...</p>}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}

        {!isLoading && !error && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((template) => (
              <TemplateCard
                key={template.templateId}
                template={template}
                onEdit={() => handleEdit(template)}
                onDelete={() => handleDelete(template.templateId)}
              />
            ))}
          </div>
        )}

        {!isLoading && !error && templates.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{searchTerm ? "검색 결과가 없습니다." : "템플릿이 없습니다."}</h3>
                <p className="text-sm text-slate-500 mt-2">{searchTerm ? "다른 검색어를 입력하시거나 새 템플릿을 추가해보세요." : "새 템플릿을 추가해보세요."}</p>
            </div>
        )}

        {!isLoading && !error && templates.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              다음
            </Button>
          </div>
        )}
      </div>

      {showForm && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
    </div>
  );
}
