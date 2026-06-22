"use client";

import { useState, useEffect, useCallback } from "react";
import { MentoringSubmission, SeniorSubmission, ManualSubmission, PhotoSubmission, Intern } from "@/types";

interface AllSubmissions {
  interns: Intern[];
  mentoring: MentoringSubmission[];
  senior: SeniorSubmission[];
  manual: ManualSubmission[];
  photos: PhotoSubmission[];
}

type AdminTab = "overview" | "mentoring" | "senior" | "manual";

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
              <div className="text-3xl mb-2">🔐</div>
              <h1 className="text-xl font-bold text-gray-900">관리자 로그인</h1>
              <p className="text-xs text-gray-400 mt-1">2026 여름 인턴 멘토링 관리</p>
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
    { id: "overview", label: "전체 현황", icon: "📊" },
    { id: "mentoring", label: "멘토링", icon: "📝" },
    { id: "senior", label: "선배탐구", icon: "🔍" },
    { id: "manual", label: "발표 자료", icon: "📖" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-sm text-gray-400 mt-0.5">2026 여름 인턴 멘토링 전체 현황</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            로그아웃
          </button>
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
            {activeTab === "mentoring" && <MentoringAdminTab submissions={data.mentoring} photos={data.photos} />}
            {activeTab === "senior" && <SeniorAdminTab submissions={data.senior} photos={data.photos} />}
            {activeTab === "manual" && <ManualAdminTab submissions={data.manual} />}
          </>
        )}
      </main>
    </div>
  );
}

function OverviewTab({ data }: { data: AllSubmissions }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="등록 인턴" count={data.interns.length} color="gray" icon="👤" />
        <StatCard label="멘토링 활동일지" count={data.mentoring.length} color="blue" icon="📝" />
        <StatCard label="선배와의 탐구생활" count={data.senior.length} color="purple" icon="🔍" />
        <StatCard label="팀 사용 설명서" count={data.manual.length} color="green" icon="📖" />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">등록된 인턴 목록</h2>
        {data.interns.length === 0 ? (
          <div className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 p-6 text-center">
            등록된 인턴이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {data.interns.map((intern) => {
              const mentoring = data.mentoring.filter((s) => s.employeeId === intern.employeeId).length;
              const senior = data.senior.filter((s) => s.employeeId === intern.employeeId).length;
              const manual = data.manual.filter((s) => s.employeeId === intern.employeeId).length;
              return (
                <div key={intern.employeeId} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <span className="font-medium text-gray-800">{intern.name}</span>
                    <span className="text-xs text-gray-400 ml-2">사번: {intern.employeeId}</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">멘토링 {mentoring}</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">탐구 {senior}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">설명서 {manual}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: string }) {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-50 border-gray-100 text-gray-700",
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

function MentoringAdminTab({ submissions, photos }: { submissions: MentoringSubmission[]; photos: PhotoSubmission[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const myPhotos = photos.filter((p) => p.type === "mentoring");

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
              {items.map((s) => (
                <div key={s.id} className="px-5 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">{s.department} · 멘토: {s.mentorName}{s.duration && ` · ${s.duration}`}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{s.date}</span>
                      <a href={`/api/pdf/mentoring/${s.id}`} download className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded px-2 py-0.5">PDF</a>
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
                </div>
              ))}
              {internPhotos.length > 0 && (
                <div className="px-5 py-4">
                  <span className="text-xs font-medium text-gray-400 block mb-2">제출된 사진 ({internPhotos.length}장)</span>
                  <div className="grid grid-cols-3 gap-2">
                    {internPhotos.map((p) => (
                      <a key={p.id} href={p.fileUrl} target="_blank" rel="noopener noreferrer">
                        <img src={p.fileUrl} alt={p.caption} className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition-opacity" />
                        {p.caption && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{p.caption}</p>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}

function SeniorAdminTab({ submissions, photos }: { submissions: SeniorSubmission[]; photos: PhotoSubmission[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const myPhotos = photos.filter((p) => p.type === "senior");

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
              {items.map((s) => (
                <div key={s.id} className="px-5 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-600">{s.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{s.date}</span>
                      <a href={`/api/pdf/senior/${s.id}`} download className="text-xs text-purple-600 hover:text-purple-700 border border-purple-200 rounded px-2 py-0.5">PDF</a>
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
                </div>
              ))}
              {internPhotos.length > 0 && (
                <div className="px-5 py-4">
                  <span className="text-xs font-medium text-gray-400 block mb-2">제출된 사진 ({internPhotos.length}장)</span>
                  <div className="grid grid-cols-3 gap-2">
                    {internPhotos.map((p) => (
                      <a key={p.id} href={p.fileUrl} target="_blank" rel="noopener noreferrer">
                        <img src={p.fileUrl} alt={p.caption} className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition-opacity" />
                        {p.caption && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{p.caption}</p>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}

function ManualAdminTab({ submissions }: { submissions: ManualSubmission[] }) {
  if (submissions.length === 0) {
    return <EmptyState message="제출된 팀 사용 설명서가 없습니다." />;
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">총 {submissions.length}건</p>
      {submissions.slice().reverse().map((s) => (
        <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="font-semibold text-gray-800">{s.internName}</span>
              <span className="text-xs text-gray-400 ml-2">사번: {s.employeeId}</span>
              <span className="text-xs text-gray-400 ml-2">{s.department}</span>
            </div>
            {s.teamName && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{s.teamName}</span>}
          </div>
          <div className="space-y-2 text-sm">
            <InfoRow label="업무 스타일" value={s.workStyle} />
            <InfoRow label="강점" value={s.strengths} />
            {s.weaknesses && <InfoRow label="약점/주의사항" value={s.weaknesses} />}
            <InfoRow label="소통 팁" value={s.communicationTip} />
            {s.funFact && <InfoRow label="TMI" value={s.funFact} />}
          </div>
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 p-10 text-center">
      {message}
    </div>
  );
}
