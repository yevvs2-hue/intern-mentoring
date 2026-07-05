"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { downloadPdf } from "@/lib/download-pdf";
import CalendarTab from "@/components/CalendarTab";
import { MentoringSubmission, SeniorSubmission, ManualSubmission, PhotoSubmission, PlanSubmission, Intern } from "@/types";

interface AllSubmissions {
  interns: Intern[];
  mentoring: MentoringSubmission[];
  senior: SeniorSubmission[];
  manual: ManualSubmission[];
  photos: PhotoSubmission[];
  plan: PlanSubmission[];
}

type AdminTab = "overview" | "interns" | "calendar" | "plan" | "mentoring" | "senior" | "manual";

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [data, setData] = useState<AllSubmissions | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") {
      setIsAuthed(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (isAuthed) {
      fetchData();
    }
  }, [isAuthed, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem("adminAuth", "true");
        setIsAuthed(true);
      } else {
        setAuthError(json.error ?? "로그인에 실패했습니다.");
      }
    } catch {
      setAuthError("서버 오류가 발생했습니다.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthed(false);
    setData(null);
    setPassword("");
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <img src="/logo.png" alt="미래에셋증권" className="h-7 object-contain" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">2026 하반기 체험형 인턴</h1>
              <p className="text-xs font-medium text-blue-900">멘토링 프로그램 · 관리자</p>
            </div>

            {authError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  관리자 비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="비밀번호를 입력하세요"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {authLoading ? "확인 중..." : "로그인"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <a href="/" className="text-xs text-gray-400 hover:text-gray-600">← 인턴 로그인으로 돌아가기</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const adminTabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: "overview", label: "현황", icon: "📊" },
    { id: "interns", label: "인턴 관리", icon: "👤" },
    { id: "calendar", label: "캘린더", icon: "🗓️" },
    { id: "plan", label: "계획서", icon: "📋" },
    { id: "mentoring", label: "멘토링", icon: "📝" },
    { id: "senior", label: "선배탐구", icon: "🔍" },
    { id: "manual", label: "멘토링 리뷰", icon: "📖" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <img src="/logo.png" alt="미래에셋증권" className="hidden sm:block h-7 object-contain" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">2026 하반기 체험형 인턴</h1>
              <p className="text-xs font-medium text-blue-900">멘토링 프로그램 · 관리자</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              새로고침
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <nav className="max-w-5xl mx-auto flex overflow-x-auto px-6">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-gray-800 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-5xl mx-auto p-6">
        {!data ? (
          <div className="text-center text-gray-400 py-20 text-sm">데이터를 불러오는 중...</div>
        ) : (
          <>
            {activeTab === "overview" && <OverviewTab data={data} />}
            {activeTab === "interns" && <InternManagementTab interns={data.interns} onRefresh={fetchData} />}
            {activeTab === "calendar" && (
              <CalendarTab
                mentoringList={data.mentoring}
                seniorList={data.senior}
                manualList={data.manual}
                planList={data.plan ?? []}
              />
            )}
            {activeTab === "plan" && <PlanAdminTab plans={data.plan ?? []} />}
            {activeTab === "mentoring" && <MentoringAdminTab submissions={data.mentoring} photos={data.photos} onRefresh={fetchData} />}
            {activeTab === "senior" && <SeniorAdminTab submissions={data.senior} photos={data.photos} onRefresh={fetchData} />}
            {activeTab === "manual" && <ManualAdminTab submissions={data.manual} />}
          </>
        )}
      </main>
    </div>
  );
}

function InternManagementTab({ interns, onRefresh }: { interns: Intern[]; onRefresh: () => void }) {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [xlsxLoading, setXlsxLoading] = useState(false);
  const [xlsxResult, setXlsxResult] = useState<{ added: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setXlsxResult(null);
    setError("");
    setXlsxLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<{ [key: string]: unknown }>(ws, { defval: "" });
      const interns = rows.map((row) => {
        const keys = Object.keys(row);
        const idKey = keys.find((k) => k.includes("사번")) ?? keys[0];
        const nameKey = keys.find((k) => k.includes("이름")) ?? keys[1];
        return { name: String(row[nameKey] ?? ""), employeeId: String(row[idKey] ?? "") };
      }).filter((r) => r.name && r.employeeId);

      if (interns.length === 0) {
        setError("유효한 데이터가 없습니다. '이름'과 '사번' 컬럼을 확인하세요.");
        return;
      }

      const res = await fetch("/api/admin/interns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interns }),
      });
      const json = await res.json();
      if (res.ok) {
        setXlsxResult({ added: json.added, skipped: json.skipped });
        onRefresh();
      } else {
        setError(json.error ?? "업로드에 실패했습니다.");
      }
    } catch {
      setError("파일을 읽는 중 오류가 발생했습니다.");
    } finally {
      setXlsxLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/interns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, employeeId }),
      });
      const json = await res.json();
      if (res.ok) {
        setName("");
        setEmployeeId("");
        onRefresh();
      } else {
        setError(json.error ?? "추가에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, internName: string) => {
    if (!confirm(`"${internName}" 인턴을 삭제하시겠습니까?\n제출한 활동일지는 유지됩니다.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/interns", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: id }),
      });
      const json = await res.json();
      if (res.ok) {
        onRefresh();
      } else {
        setError(json.error ?? "삭제에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">인턴 추가</h2>
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
            {error}
          </div>
        )}
        {xlsxResult && (
          <div className="mb-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm">
            {xlsxResult.added}명 추가됨{xlsxResult.skipped > 0 ? ` · ${xlsxResult.skipped}명 중복/빈값 스킵` : ""}
          </div>
        )}
        <div className="mb-4 flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelUpload}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className={`cursor-pointer inline-flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${xlsxLoading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <span>📊</span>
            {xlsxLoading ? "업로드 중..." : "엑셀로 일괄 추가"}
          </label>
          <span className="text-xs text-gray-400">1행: 사번 / 이름 헤더, 2행~: 데이터</span>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-3">개별 추가</p>
        </div>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="사번"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {loading ? "추가 중..." : "인턴 추가"}
          </button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-700">등록된 인턴 ({interns.length}명)</h2>
        </div>
        {interns.length === 0 ? (
          <div className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 p-10 text-center">
            등록된 인턴이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {interns.map((intern) => (
              <div key={intern.employeeId} className="flex items-center justify-between px-5 py-4">
                <div>
                  <span className="font-medium text-gray-800">{intern.name}</span>
                  <span className="text-xs text-gray-400 ml-2">사번: {intern.employeeId}</span>
                </div>
                <button
                  onClick={() => handleDelete(intern.employeeId, intern.name)}
                  disabled={deletingId === intern.employeeId}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40"
                >
                  {deletingId === intern.employeeId ? "삭제 중..." : "삭제"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const REQUIRED = { mentoring: 3, senior: 3, manual: 1 } as const;

function Dots({ filled, total, color }: { filled: number; total: number; color: string }) {
  const dotFilled: Record<string, string> = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  };
  const dotEmpty = "bg-gray-200";
  return (
    <span className="inline-flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`inline-block rounded-full ${i < filled ? dotFilled[color] : dotEmpty}`}
          style={{ width: 8, height: 8 }}
        />
      ))}
    </span>
  );
}

function OverviewTab({ data }: { data: AllSubmissions }) {
  const n = data.interns.length;
  const mentoringComplete = data.interns.filter(
    (i) => data.mentoring.filter((s) => s.employeeId === i.employeeId).length >= REQUIRED.mentoring
  ).length;
  const seniorComplete = data.interns.filter(
    (i) => data.senior.filter((s) => s.employeeId === i.employeeId).length >= REQUIRED.senior
  ).length;
  const manualComplete = data.interns.filter(
    (i) => data.manual.filter((s) => s.employeeId === i.employeeId).length >= REQUIRED.manual
  ).length;
  const allComplete = data.interns.filter((i) => {
    const m = data.mentoring.filter((s) => s.employeeId === i.employeeId).length;
    const sr = data.senior.filter((s) => s.employeeId === i.employeeId).length;
    const mn = data.manual.filter((s) => s.employeeId === i.employeeId).length;
    return m >= REQUIRED.mentoring && sr >= REQUIRED.senior && mn >= REQUIRED.manual;
  }).length;

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="text-2xl mb-1">👤</div>
          <div className="text-2xl font-bold text-gray-700">{n}</div>
          <div className="text-xs text-gray-500 mt-0.5">등록 인턴</div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-2xl font-bold text-blue-700">{mentoringComplete}<span className="text-sm font-normal text-blue-400">/{n}</span></div>
          <div className="text-xs text-blue-600 mt-0.5">멘토링 완료 (3회)</div>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
          <div className="text-2xl mb-1">🔍</div>
          <div className="text-2xl font-bold text-purple-700">{seniorComplete}<span className="text-sm font-normal text-purple-400">/{n}</span></div>
          <div className="text-xs text-purple-600 mt-0.5">선배탐구 완료 (3회)</div>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
          <div className="text-2xl mb-1">📖</div>
          <div className="text-2xl font-bold text-green-700">{manualComplete}<span className="text-sm font-normal text-green-400">/{n}</span></div>
          <div className="text-xs text-green-600 mt-0.5">멘토링 리뷰 제출 (1회)</div>
        </div>
      </div>

      {/* 전체 완료 배너 */}
      {n > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">전체 과제 완료</span>
          <span className="text-sm font-semibold text-gray-800">{allComplete}명 / {n}명
            <span className="ml-2 text-xs font-normal text-gray-400">({n > 0 ? Math.round(allComplete / n * 100) : 0}%)</span>
          </span>
        </div>
      )}

      {/* 인턴별 제출 현황 테이블 */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">인턴별 제출 현황</h2>
        {data.interns.length === 0 ? (
          <div className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 p-6 text-center">
            등록된 인턴이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 헤더 */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 gap-4">
              <span>이름</span>
              <span className="text-center w-24">멘토링 (3회)</span>
              <span className="text-center w-24">선배탐구 (3회)</span>
              <span className="text-center w-20">멘토링 리뷰 (1회)</span>
              <span className="text-center w-12">완료</span>
            </div>
            {data.interns.map((intern) => {
              const m = data.mentoring.filter((s) => s.employeeId === intern.employeeId).length;
              const sr = data.senior.filter((s) => s.employeeId === intern.employeeId).length;
              const mn = data.manual.filter((s) => s.employeeId === intern.employeeId).length;
              const done = m >= REQUIRED.mentoring && sr >= REQUIRED.senior && mn >= REQUIRED.manual;
              return (
                <div key={intern.employeeId} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-5 py-3.5 border-b border-gray-50 last:border-0 gap-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <span className="font-medium text-gray-800 text-sm">{intern.name}</span>
                    <span className="text-xs text-gray-400 ml-1.5">{intern.employeeId}</span>
                  </div>
                  <div className="w-24 flex flex-col items-center gap-1">
                    <Dots filled={Math.min(m, REQUIRED.mentoring)} total={REQUIRED.mentoring} color="blue" />
                    <span className={`text-xs font-medium ${m >= REQUIRED.mentoring ? "text-blue-600" : m > 0 ? "text-amber-500" : "text-gray-400"}`}>{m}/{REQUIRED.mentoring}</span>
                  </div>
                  <div className="w-24 flex flex-col items-center gap-1">
                    <Dots filled={Math.min(sr, REQUIRED.senior)} total={REQUIRED.senior} color="purple" />
                    <span className={`text-xs font-medium ${sr >= REQUIRED.senior ? "text-purple-600" : sr > 0 ? "text-amber-500" : "text-gray-400"}`}>{sr}/{REQUIRED.senior}</span>
                  </div>
                  <div className="w-20 flex flex-col items-center gap-1">
                    <Dots filled={Math.min(mn, REQUIRED.manual)} total={REQUIRED.manual} color="green" />
                    <span className={`text-xs font-medium ${mn >= REQUIRED.manual ? "text-green-600" : "text-gray-400"}`}>{mn}/{REQUIRED.manual}</span>
                  </div>
                  <div className="w-12 flex justify-center">
                    {done
                      ? <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">완료</span>
                      : <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">진행중</span>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 주차별 현황 */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">주차별 현황</h2>
        <WeeklySection data={data} />
      </div>
    </div>
  );
}

function WeeklySection({ data }: { data: AllSubmissions }) {
  const weekSet = new Set<string>();
  data.mentoring.forEach((s) => weekSet.add(getMonday(s.date)));
  data.senior.forEach((s) => weekSet.add(getMonday(s.date)));
  data.manual.forEach((s) => weekSet.add(getMonday(s.submittedAt.slice(0, 10))));
  const weeks = Array.from(weekSet).sort((a, b) => b.localeCompare(a));

  if (weeks.length === 0) return <EmptyState message="아직 제출된 활동일지가 없습니다." />;

  return (
    <div className="space-y-4">
      {weeks.map((monday, wi) => {
        const weekLabel = `${weeks.length - wi}주차`;
        const mSubs = data.mentoring.filter((s) => getMonday(s.date) === monday);
        const srSubs = data.senior.filter((s) => getMonday(s.date) === monday);
        const mnSubs = data.manual.filter((s) => getMonday(s.submittedAt.slice(0, 10)) === monday);
        const mIds = new Set(mSubs.map((s) => s.employeeId));
        const srIds = new Set(srSubs.map((s) => s.employeeId));
        const mnIds = new Set(mnSubs.map((s) => s.employeeId));
        const activeInterns = data.interns.filter(
          (i) => mIds.has(i.employeeId) || srIds.has(i.employeeId) || mnIds.has(i.employeeId)
        );
        const n = data.interns.length;
        const notSubmitted = data.interns.filter(
          (i) => !mIds.has(i.employeeId) && !srIds.has(i.employeeId) && !mnIds.has(i.employeeId)
        );

        return (
          <div key={monday} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">{weekLabel}</span>
                <span className="text-sm text-gray-400">{formatWeekRange(monday)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-1 font-medium">멘토링 {mIds.size}명</span>
                <span className="bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-2.5 py-1 font-medium">선배탐구 {srIds.size}명</span>
                <span className="bg-green-50 text-green-700 border border-green-100 rounded-full px-2.5 py-1 font-medium">멘토링 리뷰 {mnIds.size}명</span>
                <span className="text-gray-400">/{n}명</span>
              </div>
            </div>
            {activeInterns.length > 0 && (
              <div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] px-5 py-2 border-b border-gray-50 text-xs font-medium text-gray-400 gap-4">
                  <span>이름</span>
                  <span className="w-20 text-center">멘토링</span>
                  <span className="w-20 text-center">선배탐구</span>
                  <span className="w-20 text-center">멘토링 리뷰</span>
                </div>
                {activeInterns.map((intern) => {
                  const mCount = mSubs.filter((s) => s.employeeId === intern.employeeId).length;
                  const srCount = srSubs.filter((s) => s.employeeId === intern.employeeId).length;
                  const mnCount = mnSubs.filter((s) => s.employeeId === intern.employeeId).length;
                  return (
                    <div key={intern.employeeId} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 border-b border-gray-50 last:border-0 gap-4 hover:bg-gray-50 transition-colors">
                      <div>
                        <span className="text-sm font-medium text-gray-800">{intern.name}</span>
                        <span className="text-xs text-gray-400 ml-1.5">{intern.employeeId}</span>
                      </div>
                      <div className="w-20 text-center">
                        {mCount > 0 ? <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-2.5 py-0.5">{mCount}회</span> : <span className="text-gray-300 text-xs">—</span>}
                      </div>
                      <div className="w-20 text-center">
                        {srCount > 0 ? <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold rounded-full px-2.5 py-0.5">{srCount}회</span> : <span className="text-gray-300 text-xs">—</span>}
                      </div>
                      <div className="w-20 text-center">
                        {mnCount > 0 ? <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold rounded-full px-2.5 py-0.5">제출</span> : <span className="text-gray-300 text-xs">—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {notSubmitted.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-400">미제출 {notSubmitted.length}명: </span>
                <span className="text-xs text-gray-500">{notSubmitted.map((i) => i.name).join(", ")}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MentoringAdminTab({ submissions, photos, onRefresh }: { submissions: MentoringSubmission[]; photos: PhotoSubmission[]; onRefresh: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const myPhotos = photos.filter((p) => p.type === "mentoring");

  const handleDelete = async (id: string) => {
    if (!confirm("이 제출 건을 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "mentoring" }),
      });
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  if (submissions.length === 0) {
    return <EmptyState message="제출된 멘토링 활동일지가 없습니다." />;
  }

  const grouped = groupByIntern(submissions);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">총 {submissions.length}건 · {grouped.length}명</p>
        {myPhotos.length > 0 && (
          <a
            href="/api/admin/download-photos?type=mentoring"
            download
            className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 flex items-center gap-1"
          >
            📸 사진 전체 다운로드 ({myPhotos.length}장)
          </a>
        )}
      </div>
      {grouped.map(({ employeeId, internName, items }) => {
        const internPhotos = myPhotos.filter((p) => p.employeeId === employeeId);
        return (
        <div key={employeeId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setOpenId(openId === employeeId ? null : employeeId)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-800">{internName}</span>
              <span className="text-xs text-gray-400">사번: {employeeId}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{items.length}건</span>
              {internPhotos.length > 0 && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">📸 {internPhotos.length}장</span>}
            </div>
            <span className="text-gray-400 text-xs">{openId === employeeId ? "▲" : "▼"}</span>
          </button>
          {openId === employeeId && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {items.map((s) => {
                const logPhotos = internPhotos.filter((p) => p.submissionId ? p.submissionId === s.id : p.date === s.date);
                return (
                <div key={s.id} className="px-5 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">{s.department} · 멘토: {s.mentorName}{s.duration && ` · ${s.duration}`}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{s.date}</span>
                      <button type="button" onClick={() => downloadPdf(`/api/pdf/mentoring/${s.id}`, `멘토링활동일지_${s.internName}_${s.date}.pdf`)} className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded px-2 py-0.5">PDF</button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-0.5 disabled:opacity-40"
                      >
                        {deletingId === s.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.content}</p>
                  {s.learned && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-400">배운 점 / 느낀 점</span>
                      <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{s.learned}</p>
                    </div>
                  )}
                  {s.nextPlan && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-400">다음 계획</span>
                      <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{s.nextPlan}</p>
                    </div>
                  )}
                  {logPhotos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-400 block mb-2">📸 활동 사진 ({logPhotos.length}장)</span>
                      <div className="grid grid-cols-3 gap-2">
                        {logPhotos.map((p) => (
                          <a key={p.id} href={`/api/photos/${p.id}`} target="_blank" rel="noopener noreferrer">
                            <img src={`/api/photos/${p.id}`} alt={p.caption} className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition-opacity" />
                            {p.caption && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{p.caption}</p>}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}

function SeniorAdminTab({ submissions, photos, onRefresh }: { submissions: SeniorSubmission[]; photos: PhotoSubmission[]; onRefresh: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const myPhotos = photos.filter((p) => p.type === "senior");

  const handleDelete = async (id: string) => {
    if (!confirm("이 제출 건을 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "senior" }),
      });
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  if (submissions.length === 0) {
    return <EmptyState message="제출된 선배탐구 일지가 없습니다." />;
  }

  const grouped = groupByIntern(submissions);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">총 {submissions.length}건 · {grouped.length}명</p>
        {myPhotos.length > 0 && (
          <a
            href="/api/admin/download-photos?type=senior"
            download
            className="text-sm text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg px-3 py-1.5 flex items-center gap-1"
          >
            📷 사진 전체 다운로드 ({myPhotos.length}장)
          </a>
        )}
      </div>
      {grouped.map(({ employeeId, internName, items }) => {
        const internPhotos = myPhotos.filter((p) => p.employeeId === employeeId);
        return (
        <div key={employeeId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setOpenId(openId === employeeId ? null : employeeId)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-800">{internName}</span>
              <span className="text-xs text-gray-400">사번: {employeeId}</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{items.length}건</span>
              {internPhotos.length > 0 && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">📷 {internPhotos.length}장</span>}
            </div>
            <span className="text-gray-400 text-xs">{openId === employeeId ? "▲" : "▼"}</span>
          </button>
          {openId === employeeId && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {items.map((s) => {
                const logPhotos = internPhotos.filter((p) => p.submissionId ? p.submissionId === s.id : p.date === s.date);
                return (
                <div key={s.id} className="px-5 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-600">{s.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{s.date}</span>
                      <button type="button" onClick={() => downloadPdf(`/api/pdf/senior/${s.id}`, `선배탐구생활_${s.internName}_${s.date}.pdf`)} className="text-xs text-purple-600 hover:text-purple-700 border border-purple-200 rounded px-2 py-0.5">PDF</button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-0.5 disabled:opacity-40"
                      >
                        {deletingId === s.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{s.department} · 선배: {s.seniorName}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.content}</p>
                  {s.insights && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-400">인사이트 / 느낀 점</span>
                      <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{s.insights}</p>
                    </div>
                  )}
                  {logPhotos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-400 block mb-2">📷 활동 사진 ({logPhotos.length}장)</span>
                      <div className="grid grid-cols-3 gap-2">
                        {logPhotos.map((p) => (
                          <a key={p.id} href={`/api/photos/${p.id}`} target="_blank" rel="noopener noreferrer">
                            <img src={`/api/photos/${p.id}`} alt={p.caption} className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition-opacity" />
                            {p.caption && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{p.caption}</p>}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}

function PlanAdminTab({ plans }: { plans: PlanSubmission[] }) {
  if (plans.length === 0) {
    return <EmptyState message="제출된 계획서가 없습니다." />;
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{plans.length}명 제출</p>
      {plans.map((p) => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-semibold text-gray-800">{p.internName}</span>
              <span className="text-xs text-gray-400 ml-2">사번: {p.employeeId}</span>
              <span className="text-xs text-gray-400 ml-2">{p.department}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">멘토: {p.mentorName}</p>
              <p className="text-xs text-gray-400">{new Date(p.submittedAt).toLocaleDateString("ko-KR")}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">멘토링 계획</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.mentoringPlan}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">선배 탐구생활 계획</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.seniorPlan}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">인턴 기간 목표</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.goal}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ManualAdminTab({ submissions }: { submissions: ManualSubmission[] }) {
  if (submissions.length === 0) {
    return <EmptyState message="제출된 팀 사용 설명서가 없습니다." />;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">총 {submissions.length}건</p>
        <button
          type="button"
          onClick={() => downloadPdf("/api/admin/download-manuals", "멘토링 리뷰_전체.zip")}
          className="text-sm text-green-600 hover:text-green-700 border border-green-200 rounded-lg px-3 py-1.5 flex items-center gap-1"
        >
          📥 전체 다운로드 ({submissions.length}건)
        </button>
      </div>
      {submissions.slice().reverse().map((s) => (
        <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="font-semibold text-gray-800">{s.internName}</span>
              <span className="text-xs text-gray-400 ml-2">사번: {s.employeeId}</span>
              <span className="text-xs text-gray-400 ml-2">{s.department}</span>
            </div>
            <button
              type="button"
              onClick={() => s.fileUrl && downloadPdf(s.fileUrl, s.fileName)}
              disabled={!s.fileUrl}
              className="text-xs text-green-600 hover:text-green-700 border border-green-200 rounded-lg px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다운로드
            </button>
          </div>
          {s.description && <p className="text-sm text-gray-600 mt-1">{s.description}</p>}
          <p className="text-xs text-gray-400 mt-2">{s.fileName} · {(s.fileSize / 1024 / 1024).toFixed(1)}MB</p>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <p className="text-gray-700 mt-0.5 line-clamp-2">{value}</p>
    </div>
  );
}

function groupByIntern<T extends { employeeId: string; internName: string }>(items: T[]) {
  const map = new Map<string, { employeeId: string; internName: string; items: T[] }>();
  for (const item of items) {
    if (!map.has(item.employeeId)) {
      map.set(item.employeeId, { employeeId: item.employeeId, internName: item.internName, items: [] });
    }
    map.get(item.employeeId)!.items.push(item);
  }
  return Array.from(map.values());
}

function getMonday(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function formatWeekRange(monday: string): string {
  const start = new Date(monday);
  const end = new Date(monday);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${fmt(start)}(${days[start.getDay()]}) ~ ${fmt(end)}(${days[end.getDay()]})`;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 p-10 text-center">
      {message}
    </div>
  );
}
