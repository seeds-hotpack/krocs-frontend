'use client'

import type { Template } from '@/app/templates/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Clock, Zap, ListChecks } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
}

const priorityMap = {
  HIGH: { text: '높음', className: 'text-red-500' },
  MEDIUM: { text: '중간', className: 'text-yellow-500' },
  LOW: { text: '낮음', className: 'text-green-500' },
};

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const { title, priority, duration, subTemplates } = template;
  const priorityInfo = priorityMap[priority];

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400 pt-1">{subTemplates.length}개의 하위 템플릿</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>수정하기</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
              삭제하기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-4 text-sm text-slate-700 dark:text-slate-300 mb-4">
            <div className="flex items-center gap-1.5">
                <Zap className={`h-4 w-4 ${priorityInfo.className}`} />
                <span className={priorityInfo.className}>{priorityInfo.text}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{duration}일</span>
            </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="mb-2 text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <ListChecks className="h-4 w-4" />
                하위 템플릿 목록
            </h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                {subTemplates.slice(0, 4).map(sub => (
                    <li key={sub.sub_template_id} className="truncate">{sub.title}</li>
                ))}
                {subTemplates.length > 4 && (
                    <li className="text-xs text-slate-500">...외 {subTemplates.length - 4}개</li>
                )}
            </ul>
        </div>
      </CardContent>
    </Card>
  );
}
