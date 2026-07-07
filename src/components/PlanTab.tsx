"use client";

import { useState, useRef, useEffect } from "react";
import { PlanSubmission } from "@/types";
import { useDraft } from "@/hooks/useDraft";
import { downloadPdf } from "@/lib/download-pdf";

interface PlanTabProps {
  plan: PlanSubmission | null;
  internName: string;
  onSubmit: (data: Omit<PlanSubmission, "id" | "submittedAt" | "employeeId" | "internName">) => Promise<void>;
}

export default function PlanTab({ plan, internName, onSubmit }: PlanTabProps) {
  const [editing, setEditing] = useState(!plan);
  const syncedInitialPlan = useRef(false);
  useEffect(() => {
    if (!syncedInitialPlan.current && plan) {
      setEditing(false);
      syncedInitialPlan.current = true;
    }
  }, [plan]);
  const { value: form, save: saveForm, clear: clearDraft, savedAt: draftSavedAt } = useDraft("draft_plan", {
    department: plan?.department ?? "",
    mentorName: plan?.mentorName ?? "",
    mentoringPlan: plan?.mentoringPlan ?? "",
    seniorPlan: plan?.seniorPlan ?? "",
    goal: plan?.goal ?? "",
  });
  const syncedInitialForm = useRef(false);
  useEffect(() => {
    if (!syncedInitialForm.current && plan) {
      saveForm({
        department: plan.department,
        mentorName: plan.mentorName,
        mentoringPlan: plan.mentoringPlan,
        seniorPlan: plan.seniorPlan,
        goal: plan.goal,
      });
      syncedInitialForm.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(form);
      clearDraft();
      setEditing(false);
    } catch {
      setError("제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!editing && plan) {
    return (
      <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">멘토링 계획서</h2>
            <div className="flex gap-2">
              <button
                onClick={() => downloadPdf(`/api/pdf/plan/${plan.id}`, `멘토링계획서_${plan.internName}.pdf`)}
                className="text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors"
              >
                PDF
              </button>
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                수정
              </button>
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">이름</p>
                <p className="text-sm text-gray-800">{plan.internName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">부서</p>
                <p className="text-sm text-gray-800">{plan.department}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">멘토 이름</p>
                <p className="text-sm text-gray-800">{plan.mentorName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">멘토링 계획</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.mentoringPlan}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">선배 탐구생활 계획</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.seniorPlan}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">인턴 기간 목표</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.goal}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            제출일: {new Date(plan.submittedAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">멘토링 계획서</h2>
        <ul className="text-sm text-gray-400 mb-6 space-y-1 list-disc list-inside">
          <li>이 계획은 완벽한 일정표가 아니라 방향을 잡기 위한 출발점입니다.</li>
          <li>계획을 세우기 전 멘토와 충분히 상의해서 목표를 함께 정하세요.</li>
          <li>실제로 해보면서 계획은 얼마든지 바뀔 수 있습니다.</li>
        </ul>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={internName}
                readOnly
                className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-default"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부서 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => saveForm({ ...form, department: e.target.value })}
                required
                placeholder="예: 인재개발팀"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                멘토 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.mentorName}
                onChange={(e) => saveForm({ ...form, mentorName: e.target.value })}
                required
                placeholder="예: 김멘토"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              멘토링 계획 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.mentoringPlan}
              onChange={(e) => saveForm({ ...form, mentoringPlan: e.target.value })}
              required
              rows={5}
              placeholder="주차별로 진행할 업무 또는 배울 내용에 대해 써주세요."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              선배 탐구생활 계획 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.seniorPlan}
              onChange={(e) => saveForm({ ...form, seniorPlan: e.target.value })}
              required
              rows={4}
              placeholder="인터뷰 예정인 선배의 이름과 부서, 만날 날짜를 작성해 주세요."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              인턴 기간 목표 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.goal}
              onChange={(e) => saveForm({ ...form, goal: e.target.value })}
              required
              rows={4}
              placeholder="인턴 기간 동안의 목표를 작성해 주세요."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {draftSavedAt && (
            <p className="text-xs text-gray-400 text-center">
              임시저장됨 · {draftSavedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            {plan && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {submitting ? "제출 중..." : plan ? "수정 완료" : "제출하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
