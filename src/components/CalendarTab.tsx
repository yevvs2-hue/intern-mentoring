"use client";

import { useState } from "react";
import { MentoringSubmission, SeniorSubmission, ManualSubmission, PlanSubmission } from "@/types";
import { DEADLINES } from "@/lib/deadlines";

interface CalendarTabProps {
  mentoringList: MentoringSubmission[];
  seniorList: SeniorSubmission[];
  manualList: ManualSubmission[];
  planList: PlanSubmission[];
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarTab({ mentoringList, seniorList, manualList, planList }: CalendarTabProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(6); // 7월

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const mentoringDates = new Set(mentoringList.map((s) => s.date));
  const seniorDates = new Set(seniorList.map((s) => s.date));
  const manualDates = new Set(manualList.map((s) => s.submittedAt.slice(0, 10)));
  const planDates = new Set(planList.map((s) => s.submittedAt.slice(0, 10)));

  const isDeadlineSubmitted = (color: string, dateStr: string) => {
    if (color === "blue") return mentoringDates.has(dateStr);
    if (color === "purple") return seniorDates.has(dateStr);
    if (color === "green") return manualDates.has(dateStr);
    if (color === "gray") return planDates.has(dateStr);
    return false;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const formatDate = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const totalSubmissions = mentoringList.length + seniorList.length + manualList.length + planList.length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 현황 요약 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SummaryCard label="계획서" count={planList.length} color="gray" icon="📋" />
        <SummaryCard label="멘토링 활동일지" count={mentoringList.length} color="blue" icon="📝" />
        <SummaryCard label="선배 탐구생활" count={seniorList.length} color="purple" icon="🔍" />
        <SummaryCard label="우리팀 사용 설명서" count={manualList.length} color="green" icon="📖" />
      </div>

      {/* 캘린더 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {viewYear}년 {viewMonth + 1}월
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            →
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-3">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className="h-24 border-r border-b border-gray-50" />;
            const dateStr = formatDate(day);
            const hasMentoring = mentoringDates.has(dateStr);
            const hasSenior = seniorDates.has(dateStr);
            const deadlines = DEADLINES[dateStr] ?? [];
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();

            return (
              <div
                key={idx}
                className={`h-24 p-1.5 border-r border-b border-gray-50 flex flex-col items-start gap-1 overflow-hidden ${isToday ? "bg-blue-50" : ""}`}
              >
                <span
                  className={`text-xs font-medium leading-none ${
                    isToday
                      ? "w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center"
                      : "text-gray-700"
                  }`}
                >
                  {day}
                </span>
                <div className="flex flex-col gap-0.5 w-full">
                  {deadlines.map((item, i) => {
                    const submitted = isDeadlineSubmitted(item.color, dateStr);
                    const filledCls: Record<string, string> = {
                      blue: "bg-blue-500 text-white",
                      purple: "bg-purple-500 text-white",
                      green: "bg-green-500 text-white",
                      gray: "bg-gray-500 text-white",
                    };
                    const lightCls: Record<string, string> = {
                      blue: "bg-blue-50 text-blue-400",
                      purple: "bg-purple-50 text-purple-400",
                      green: "bg-green-50 text-green-400",
                      gray: "bg-gray-100 text-gray-400",
                    };
                    return (
                      <span
                        key={i}
                        className={`text-[10px] leading-tight rounded px-1 py-0.5 truncate w-full ${
                          submitted ? filledCls[item.color] : lightCls[item.color]
                        }`}
                      >
                        {item.text}
                      </span>
                    );
                  })}
                  {deadlines.length === 0 && hasMentoring && (
                    <span className="text-[10px] leading-tight rounded px-1 py-0.5 truncate w-full bg-blue-500 text-white">
                      멘토링
                    </span>
                  )}
                  {deadlines.length === 0 && hasSenior && (
                    <span className="text-[10px] leading-tight rounded px-1 py-0.5 truncate w-full bg-purple-500 text-white">
                      탐구생활
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex gap-4 mt-4 text-sm text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" /> 제출 완료</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-50 border border-blue-200 rounded" /> 미제출</span>
      </div>

      {/* 최근 제출 목록 */}
      {totalSubmissions > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-700 mb-3">최근 제출 내역</h3>
          <div className="space-y-2">
            {[
              ...planList.map((s) => ({ type: "계획서", name: s.internName, date: s.submittedAt.slice(0, 10), color: "gray" })),
              ...mentoringList.map((s) => ({ type: "멘토링 활동일지", name: s.internName, date: s.date, color: "blue" })),
              ...seniorList.map((s) => ({ type: "선배 탐구생활", name: s.internName, date: s.date, color: "purple" })),
              ...manualList.map((s) => ({ type: "우리팀 사용 설명서", name: s.internName, date: s.submittedAt.slice(0, 10), color: "green" })),
            ]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.color === "blue" ? "bg-blue-100 text-blue-700" :
                      item.color === "purple" ? "bg-purple-100 text-purple-700" :
                      item.color === "green" ? "bg-green-100 text-green-700" :
                      "bg-gray-200 text-gray-700"
                    }`}>{item.type}</span>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    green: "bg-green-50 border-green-100 text-green-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colorMap[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs mt-0.5 opacity-80">{label}</div>
    </div>
  );
}
