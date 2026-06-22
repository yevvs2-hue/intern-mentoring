"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TabNav from "@/components/TabNav";
import HomeTab from "@/components/HomeTab";
import CalendarTab from "@/components/CalendarTab";
import MentoringTab from "@/components/MentoringTab";
import SeniorTab from "@/components/SeniorTab";
import ManualTab from "@/components/ManualTab";
import PhotoTab from "@/components/PhotoTab";
import { MentoringSubmission, SeniorSubmission, ManualSubmission, PhotoSubmission, Intern } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [intern, setIntern] = useState<Intern | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [mentoringList, setMentoringList] = useState<MentoringSubmission[]>([]);
  const [seniorList, setSeniorList] = useState<SeniorSubmission[]>([]);
  const [manualList, setManualList] = useState<ManualSubmission[]>([]);
  const [photoList, setPhotoList] = useState<PhotoSubmission[]>([]);

  const fetchSubmissions = useCallback(async (employeeId: string) => {
    try {
      const res = await fetch(`/api/submissions?employeeId=${encodeURIComponent(employeeId)}`);
      if (res.ok) {
        const data = await res.json();
        setMentoringList(data.mentoring ?? []);
        setSeniorList(data.senior ?? []);
        setManualList(data.manual ?? []);
        setPhotoList(data.photos ?? []);
      }
    } catch {
      // silently fail — data will remain empty
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("internUser");
    if (!stored) {
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(stored) as Intern;
      setIntern(parsed);
      fetchSubmissions(parsed.employeeId);
    } catch {
      router.push("/");
    }
  }, [router, fetchSubmissions]);

  const handleLogout = () => {
    localStorage.removeItem("internUser");
    router.push("/");
  };

  const handleMentoringSubmit = async (data: Omit<MentoringSubmission, "id" | "submittedAt" | "employeeId">) => {
    if (!intern) return;
    await fetch("/api/submissions/mentoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, employeeId: intern.employeeId }),
    });
    await fetchSubmissions(intern.employeeId);
  };

  const handleSeniorSubmit = async (data: Omit<SeniorSubmission, "id" | "submittedAt" | "employeeId">) => {
    if (!intern) return;
    await fetch("/api/submissions/senior", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, employeeId: intern.employeeId }),
    });
    await fetchSubmissions(intern.employeeId);
  };

  const handleManualSubmit = async (formData: FormData) => {
    if (!intern) return;
    formData.append("employeeId", intern.employeeId);
    await fetch("/api/submissions/manual", { method: "POST", body: formData });
    await fetchSubmissions(intern.employeeId);
  };

  const handlePhotoSubmit = async (formData: FormData) => {
    if (!intern) return;
    formData.append("employeeId", intern.employeeId);
    await fetch("/api/submissions/photo", { method: "POST", body: formData });
    await fetchSubmissions(intern.employeeId);
  };

  if (!intern) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="미래에셋증권" className="h-7 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">2026 하반기 체험형 인턴</h1>
              <p className="text-xs font-medium text-blue-900">멘토링 프로그램</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            안녕하세요, <span className="font-medium text-gray-700">{intern.name}</span>님 👋
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      <main>
        {activeTab === "home" && (
          <HomeTab internName={intern.name} />
        )}
        {activeTab === "calendar" && (
          <CalendarTab
            mentoringList={mentoringList}
            seniorList={seniorList}
            manualList={manualList}
          />
        )}
        {activeTab === "mentoring" && (
          <MentoringTab
            submissions={mentoringList}
            onSubmit={handleMentoringSubmit}
            onPhotoSubmit={handlePhotoSubmit}
            photos={photoList}
          />
        )}
        {activeTab === "senior" && (
          <SeniorTab
            submissions={seniorList}
            onSubmit={handleSeniorSubmit}
            onPhotoSubmit={handlePhotoSubmit}
            photos={photoList}
          />
        )}
        {activeTab === "manual" && (
          <ManualTab
            submissions={manualList}
            onSubmit={handleManualSubmit as (formData: FormData) => Promise<void>}
          />
        )}
      </main>
    </div>
  );
}
