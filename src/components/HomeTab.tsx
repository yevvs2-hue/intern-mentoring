"use client";

import { useState } from "react";
import { MentoringSubmission, SeniorSubmission, ManualSubmission, PlanSubmission } from "@/types";

const NOTICES: { title: string; content: string; important?: boolean }[] = [
  // 나중에 유의사항을 여기에 추가하세요
];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const DEADLINES: Record<string, { text: string; color: string }[]> = {
  "2026-07-16": [{ text: "멘토링 1차", color: "blue" }, { text: "탐구 1차", color: "purple" }],
  "2026-07-23": [{ text: "멘토링 2차", color: "blue" }, { text: "탐구 2차", color: "purple" }],
  "2026-07-29": [{ text: "멘토링 3차", color: "blue" }, { text: "탐구 3차", color: "purple" }, { text: "멘토링 리뷰", color: "green" }],
};

interface HomeTabProps {
  internName: string;
  mentoringList: MentoringSubmission[];
  seniorList: SeniorSubmission[];
  manualList: ManualSubmission[];
  plan: PlanSubmission | null;
}

export default function HomeTab({ internName, mentoringList, seniorList, manualList, plan }: HomeTabProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(6); // 7월

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
    <div className="p-4 sm:p-6 max-w-3xl lg:max-w-4xl mx-auto space-y-5">
      {/* 환영 배너 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <img src="/logo.png" alt="미래에셋증권" className="h-6 object-contain" />
          <span className="text-xs text-gray-400">2026 하반기 체험형 인턴</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">안녕하세요, {internName}님</h2>
        <p className="text-sm text-gray-400">멘토링 프로그램 · 7월 6일 ~ 7월 31일</p>
      </div>

      {/* 제출 현황 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="계획서" count={plan ? 1 : 0} total={1} color="gray" icon="📋" />
        <SummaryCard label="멘토링 활동일지" count={mentoringList.length} total={3} color="blue" icon="📝" />
        <SummaryCard label="선배탐구생활" count={seniorList.length} total={3} color="purple" icon="🔍" />
        <SummaryCard label="멘토링 리뷰" count={manualList.length} total={1} color="green" icon="📖" />
      </div>

      {/* 공지 */}
      {NOTICES.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">공지 및 유의사항</h3>
          <div className="space-y-2">
            {NOTICES.map((notice, i) => (
              <div key={i} className={`rounded-xl border p-4 ${notice.important ? "bg-red-50 border-red-100" : "bg-white border-gray-200"}`}>
                <div className="flex items-start gap-2">
                  {notice.important && (
                    <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full mt-0.5 shrink-0">중요</span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{notice.title}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{notice.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 캘린더 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">제출 캘린더</h3>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">←</button>
            <span className="text-base font-semibold text-gray-800">{viewYear}년 {viewMonth + 1}월</span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">→</button>
          </div>
          <div className="grid grid-cols-7 border-b border-gray-100">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} className="h-12 border-r border-b border-gray-50 last:border-r-0" />;
              const dateStr = formatDate(day);
              const hasMentoring = mentoringDates.has(dateStr);
              const hasSenior = seniorDates.has(dateStr);
              const deadlines = DEADLINES[dateStr] ?? [];
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
              return (
                <div key={idx} className={`h-12 p-1.5 border-r border-b border-gray-50 last:border-r-0 flex flex-col items-center gap-1 ${isToday ? "bg-blue-50" : ""}`}>
                  <span className={`text-xs font-medium leading-none ${isToday ? "w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center" : "text-gray-700"}`}>
                    {day}
                  </span>
                  <div className="flex gap-0.5 flex-wrap justify-center">
                    {hasMentoring && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />}
                    {hasSenior && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />}
                    {deadlines.length > 0 && <span className="w-1.5 h-1.5 rounded-full border border-red-400 inline-block" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 멘토링 제출</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> 탐구 제출</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-red-400 inline-block" /> 마감일</span>
        </div>
      </div>

      {/* 마감일 목록 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">마감일 안내</h3>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {Object.entries(DEADLINES).sort().map(([date, items]) => {
            const d = new Date(date);
            const month = d.getMonth() + 1;
            const day = d.getDate();
            const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
            const colorMap: Record<string, string> = {
              blue: "bg-blue-100 text-blue-700",
              purple: "bg-purple-100 text-purple-700",
              green: "bg-green-100 text-green-700",
            };
            return (
              <div key={date} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-gray-800">
                  {month}월 {day}일 <span className="text-gray-400 font-normal">({weekday})</span>
                </span>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {items.map((item, i) => (
                    <span key={i} className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorMap[item.color]}`}>
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 최근 제출 */}
      {totalSubmissions > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">최근 제출 내역</h3>
          <div className="space-y-2">
            {[
              ...mentoringList.map((s) => ({ type: "멘토링", date: s.date, color: "blue" })),
              ...seniorList.map((s) => ({ type: "선배탐구", date: s.date, color: "purple" })),
              ...manualList.map((s) => ({ type: "멘토링 리뷰", date: s.submittedAt.slice(0, 10), color: "green" })),
            ]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.color === "blue" ? "bg-blue-100 text-blue-700" :
                    item.color === "purple" ? "bg-purple-100 text-purple-700" :
                    "bg-green-100 text-green-700"
                  }`}>{item.type}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}


function SummaryCard({ label, count, total, color, icon }: { label: string; count: number; total: number; color: string; icon: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    green: "bg-green-50 border-green-100 text-green-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };
  return (
    <div className={`rounded-2xl border p-3 ${colorMap[color]}`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-3xl font-bold leading-tight">{count}<span className="text-sm font-normal opacity-50">/{total}</span></div>
      <div className="text-sm font-medium mt-1 leading-tight">{label}</div>
    </div>
  );
}
