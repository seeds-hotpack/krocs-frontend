"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCcw, Trash2 } from "lucide-react"

import {
  deleteGoalRetrospective,
  getRetrospectiveFactors,
  getRetrospectiveMyPage,
  type RetrospectiveMyPageResult,
  type RetrospectiveOutcome,
  type RetrospectiveSummaryItem,
} from "@/api/retrospectives"
import { GlobalNav } from "@/components/global-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { cn } from "@/lib/utils"

type OutcomeFilter = "ALL" | RetrospectiveOutcome

const OUTCOME_LABELS: Record<RetrospectiveOutcome, string> = {
  COMPLETE_SUCCESS: "성공",
  COMPLETE_FAILURE: "실패",
  RETRY_FAILURE: "재시도",
}

const OUTCOME_COLORS: Record<RetrospectiveOutcome, string> = {
  COMPLETE_SUCCESS: "border-[#b4dfc1] bg-[#ecfbf1] text-[#1f8a4d]",
  COMPLETE_FAILURE: "border-[#f5b8b5] bg-[#ffecec] text-[#c0342c]",
  RETRY_FAILURE: "border-[#ffdcb0] bg-[#fff7e8] text-[#c26a0f]",
}

const FILTER_OPTIONS: { label: string; value: OutcomeFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "성공", value: "COMPLETE_SUCCESS" },
  { label: "실패", value: "COMPLETE_FAILURE" },
  { label: "재시도", value: "RETRY_FAILURE" },
]

const MY_PAGE_TABS = [
  { key: "RETROSPECTIVE", label: "회고" },
  { key: "SETTINGS", label: "설정" },
] as const

type MyPageTab = (typeof MY_PAGE_TABS)[number]["key"]

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_SORT = "createdAt,desc"

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const FactorList = ({
  title,
  factors,
}: {
  title: string
  factors: { description: string; count: number }[]
}) => {
  const maxCount = Math.max(...factors.map((item) => item.count), 1)

  return (
    <Card className="border-[#D3E6ED] bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-[#0F1C21]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {factors.length === 0 ? (
          <p className="text-sm text-[#5D6E72]">집계된 요인이 없어요.</p>
        ) : (
          <ul className="space-y-4">
            {factors.map((factor, index) => {
              const shadeClass = ["bg-[#ff8b6b]", "bg-[#ffaf97]", "bg-[#ffc6b6]"][index] ?? "bg-[#ffdcd0]"
              return (
                <li key={factor.description}>
                  <div className="flex items-center justify-between text-sm font-semibold text-[#0F1C21]">
                    <span>{factor.description}</span>
                    <span className="text-xs text-[#5D6E72]">{factor.count}회</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#EEF5F7]">
                    <div
                      className={cn("h-full rounded-full transition-all", shadeClass)}
                      style={{ width: `${Math.round((factor.count / maxCount) * 100)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default function MyPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<OutcomeFilter>("ALL")
  const [page, setPage] = useState(0)
  const [data, setData] = useState<RetrospectiveMyPageResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<RetrospectiveSummaryItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [factorDescriptions, setFactorDescriptions] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<MyPageTab>("RETROSPECTIVE")

  useEffect(() => {
    let isMounted = true
    getRetrospectiveFactors()
      .then((result) => {
        if (!isMounted) return
        const map: Record<string, string> = {}
        ;[...(result.successFactors ?? []), ...(result.failureFactors ?? [])].forEach((factor) => {
          map[factor.key] = factor.description
        })
        setFactorDescriptions(map)
      })
      .catch((error) => {
        console.error("Failed to load retrospective factors", error)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const fetchRetrospectives = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getRetrospectiveMyPage({
        outcome: filters === "ALL" ? undefined : filters,
        page,
        size: DEFAULT_PAGE_SIZE,
        sort: DEFAULT_SORT,
      })
      setData(result)
    } catch (err: any) {
      console.error("Failed to fetch retrospectives", err)
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        alert(err?.response?.data?.message || "로그인이 필요합니다.")
        router.push("/login")
        return
      }
      setError(err?.response?.data?.message || "회고를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [filters, page, router])

  useEffect(() => {
    fetchRetrospectives()
  }, [fetchRetrospectives])

  const handleChangeFilter = (value: OutcomeFilter) => {
    setFilters(value)
    setPage(0)
  }

  const openDeleteModal = (item: RetrospectiveSummaryItem) => {
    if (deletingId) return
    setPendingDelete(item)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setPendingDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    setDeletingId(pendingDelete.retrospectiveId)
    try {
      await deleteGoalRetrospective(pendingDelete.goalId, pendingDelete.retrospectiveId)
      closeDeleteModal()
      await fetchRetrospectives()
    } catch (err: any) {
      console.error("Failed to delete retrospective", err)
      alert(err?.response?.data?.message || "회고 삭제에 실패했습니다.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleMovePage = (direction: "prev" | "next") => {
    if (!data) return
    if (direction === "prev" && page > 0) {
      setPage((prev) => prev - 1)
    } else if (direction === "next" && !data.retrospectives.isLast) {
      setPage((prev) => prev + 1)
    }
  }

  const totalElements = data?.retrospectives.totalElements ?? 0
  const totalPages = data?.retrospectives.totalPages ?? 0
  const currentCount = data?.retrospectives.content.length ?? 0
  const rangeStart = totalElements === 0 ? 0 : page * DEFAULT_PAGE_SIZE + 1
  const rangeEnd = totalElements === 0 ? 0 : rangeStart + Math.max(currentCount - 1, 0)

  const successFactors = useMemo(
    () =>
      data?.statistics.topSuccessFactors.map((item) => ({
        description: item.description,
        count: item.count,
      })) ?? [],
    [data?.statistics.topSuccessFactors]
  )

  const failureFactors = useMemo(
    () =>
      data?.statistics.topFailureFactors.map((item) => ({
        description: item.description,
        count: item.count,
      })) ?? [],
    [data?.statistics.topFailureFactors]
  )

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchRetrospectives()
  }

  const getFactorLabel = (key: string) => factorDescriptions[key] || key

  const renderRetrospectiveContent = () => (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <FactorList title="성공 요인 TOP 3" factors={successFactors} />
        <FactorList title="실패 요인 TOP 3" factors={failureFactors} />
      </div>

      <section className="rounded-3xl border border-[#D3E6ED] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5D6E72]">회고 조회</p>
            <p className="text-xs text-[#5D6E72]">
              총 {totalElements}건 · {page + 1}/{Math.max(totalPages, 1)}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((option) => {
                const isActive = filters === option.value
                return (
                  <Button
                    key={option.value}
                    type="button"
                    onClick={() => handleChangeFilter(option.value)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                      isActive
                        ? "bg-[#ff8b6b] text-white shadow-sm hover:bg-[#ff7a56]"
                        : "bg-[#E3E8ED] text-[#5D6E72] hover:bg-[#D3E0EA]"
                    )}
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              aria-label="새로고침"
              className="h-10 w-10 rounded-full bg-[#E3E8ED] text-[#5D6E72] hover:bg-[#D3E0EA]"
            >
              <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#f8f9fb] p-10 text-center text-sm text-[#5D6E72]">
              회고를 불러오는 중입니다...
            </div>
          ) : data && data.retrospectives.content.length > 0 ? (
            data.retrospectives.content.map((item) => {
              const showEtcContent = item.factors.includes("ETC") && item.content
              return (
                <article
                  key={item.retrospectiveId}
                  className="rounded-2xl border border-[#D3E6ED] bg-white p-4 shadow-sm transition hover:border-[#bcd4df] sm:p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-[#0F1C21]">{item.goalName}</h3>
                      <p className="text-xs text-[#5D6E72]">작성일 {formatDate(item.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold",
                          OUTCOME_COLORS[item.outcome]
                        )}
                      >
                        {OUTCOME_LABELS[item.outcome]}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="회고 삭제"
                        onClick={() => openDeleteModal(item)}
                        disabled={deletingId === item.retrospectiveId}
                        className="rounded-2xl text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {showEtcContent && (
                    <div className="mt-4 rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5D6E72]">추가 기록</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#0F1C21]">{item.content}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.factors.length > 0 ? (
                      item.factors.map((factor) =>
                        factor === "ETC" && !item.content ? null : (
                          <span
                            key={factor}
                            className="rounded-full border border-[#d9dee5] bg-[#EEF5F7] px-3 py-1 text-xs font-semibold text-[#0F1C21]"
                          >
                            {getFactorLabel(factor)}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-xs text-[#5D6E72]">선택된 요인이 없습니다.</span>
                    )}
                  </div>
                </article>
              )
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#f8f9fb] p-10 text-center text-sm text-[#5D6E72]">
              아직 조회할 회고가 없습니다.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[#D3E6ED] pt-4 text-sm text-[#5D6E72] sm:flex-row">
          <div>
            {totalElements > 0
              ? currentCount > 0
                ? `총 ${totalElements}건 · ${page + 1}/${Math.max(totalPages, 1)}`
                : `총 ${totalElements}건`
              : "표시할 회고가 없습니다."}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMovePage("prev")}
              disabled={page === 0 || loading}
              className="rounded-full border-[#D3E6ED] text-[#5D6E72] hover:bg-[#EEF5F7]"
            >
              이전
            </Button>
            <span className="text-xs font-semibold text-[#0F1C21]">{page + 1}/{Math.max(totalPages, 1)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMovePage("next")}
              disabled={loading || data?.retrospectives.isLast}
              className="rounded-full border-[#D3E6ED] text-[#5D6E72] hover:bg-[#EEF5F7]"
            >
              다음
            </Button>
          </div>
        </div>
      </section>
    </div>
  )

  const renderSettingsPlaceholder = () => (
    <div className="rounded-3xl border border-dashed border-[#D3E6ED] bg-white/80 p-10 text-center text-[#5D6E72] shadow-sm">
      <p className="text-lg font-semibold text-[#0F1C21]">설정 페이지를 준비 중이에요.</p>
      <p className="mt-2 text-sm text-[#5D6E72]">곧 더 많은 마이페이지 기능을 만나보실 수 있어요!</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#0F1C21]">
      <GlobalNav />
      <main className="mx-auto max-w-7xl px-4 pt-6 pb-28 md:px-6 md:pb-6">
        <div className="rounded-[32px] bg-white/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="w-full shrink-0 border-b border-[#f0f0f0] pb-4 lg:w-48 lg:border-b-0 lg:border-r lg:pr-4">
              <nav className="flex gap-3 lg:flex-col">
                {MY_PAGE_TABS.map((tab) => {
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-[#ff8b6b] text-white shadow-sm"
                          : "bg-[#f4f6f8] text-[#5D6E72] hover:bg-[#e8eaee]"
                      )}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </aside>
            <section className="flex-1">
              {activeTab === "RETROSPECTIVE" ? renderRetrospectiveContent() : renderSettingsPlaceholder()}
            </section>
          </div>
        </div>
      </main>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="회고를 삭제할까요?"
        message={`"${pendingDelete?.goalName ?? ""}" 회고를 삭제하면 복구할 수 없어요.`}
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  )
}
