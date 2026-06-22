"use client";

import { useState } from "react";
import { MentoringSubmission, SeniorSubmission, ManualSubmission } from "@/types";

interface CalendarTabProps {
  mentoringList: MentoringSubmission[];
  seniorList: SeniorSubmission[];
  manualList: ManualSubmission[];
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarTab({ mentoringList, seniorList, manualList }: CalendarTabProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(6); // 7월

  const INTERN_START = "2026-07-06";
  const INTERN_END = "2026-07-31";

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const mentoringDates = new Set(mentoringList.map((s) => s.date));
  const seniorDates = new Set(seniorList.map((s) => s.date));

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

  const totalSubmissions = mentoringList.length + seniorList.length + manualList.length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 현황 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <SummaryCard label="멘토링 활동일지" count={mentoringList.length} color="blue" icon="📝" />
        <SummaryCard label="선배와의 탐구생활" count={seniorList.length} color="purple" icon="🔍" />
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
            if (!day) return <div key={idx} className="h-20 border-r border-b border-gray-50" />;
            const dateStr = formatDate(day);
            const hasMentoring = mentoringDates.has(dateStr);
            const hasSenior = seniorDates.has(dateStr);
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();
            const isInternPeriod = dateStr >= INTERN_START && dateStr <= INTERN_END;

            return (
              <div
                key={idx}
                className={`h-20 p-2 border-r border-b border-gray-50 ${isToday ? "bg-blue-50" : isInternPeriod ? "bg-amber-50" : ""}`}
              >
                <span
                  className={`text-sm font-medium ${
                    isToday
                      ? "w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs"
                      : "text-gray-700"
                  }`}
                >
                  {day}
                </span>
                <div className="mt-1 flex flex-col gap-0.5">
                  {hasMentoring && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 rounded px-1 truncate">
                      멘토링
                    </span>
                  )}
                  {hasSenior && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 rounded px-1 truncate">
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
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 rounded" /> 멘토링 활동일지</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-100 rounded" /> 선배와의 탐구생활</span>
      </div>

      {/* 최근 제출 목록 */}
      {totalSubmissions > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-700 mb-3">최근 제출 내역</h3>
          <div className="space-y-2">
            {[
              ...mentoringList.map((s) => ({ type: "멘토링 활동일지", name: s.internName, date: s.date, color: "blue" })),
              ...seniorList.map((s) => ({ type: "선배와의 탐구생활", name: s.internName, date: s.date, color: "purple" })),
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
                      "bg-green-100 text-green-700"
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
  };
  return (
    <div className={`rounded-2xl border p-4 ${colorMap[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs mt-0.5 opacity-80">{label}</div>
    </div>
  );
}
