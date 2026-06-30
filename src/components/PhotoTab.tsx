"use client";

import { useState, useRef } from "react";
import { PhotoSubmission } from "@/types";

interface PhotoTabProps {
  type: "mentoring" | "senior";
  onSubmit: (formData: FormData) => Promise<void>;
  submissions: PhotoSubmission[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const LABEL = {
  mentoring: { title: "멘토링 활동 사진", desc: "멘토링 활동 중 촬영한 사진을 업로드해 주세요.", color: "blue" },
  senior: { title: "선배탐구 활동 사진", desc: "선배와의 탐구생활 활동 사진을 업로드해 주세요.", color: "purple" },
};

export default function PhotoTab({ type, onSubmit, submissions }: PhotoTabProps) {
  const { title, desc, color } = LABEL[type];
  const ringColor = color === "blue" ? "focus:ring-blue-500" : "focus:ring-purple-500";
  const btnColor = color === "blue"
    ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
    : "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400";

  const [internName, setInternName] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setError("");
    const valid: File[] = [];
    for (const f of Array.from(incoming)) {
      if (!f.type.startsWith("image/")) {
        setError("이미지 파일만 업로드할 수 있습니다.");
        continue;
      }
      valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) { setError("사진을 선택해 주세요."); return; }
    setSubmitting(true);
    setError("");
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("type", type);
        fd.append("internName", internName);
        fd.append("department", department);
        fd.append("date", date);
        fd.append("caption", caption);
        fd.append("file", file);
        await onSubmit(fd);
      }
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setInternName("");
      setDepartment("");
      setDate("");
      setCaption("");
      setFiles([]);
    } catch {
      setError("제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const mySubmissions = submissions.filter((s) => s.type === type);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
      </div>

      {submitted && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✅ 사진이 성공적으로 제출되었습니다!
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 <span className="text-red-500">*</span></label>
            <input value={internName} onChange={e => setInternName(e.target.value)} required placeholder="홍길동"
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">소속 부서 <span className="text-red-500">*</span></label>
            <input value={department} onChange={e => setDepartment(e.target.value)} required placeholder="예: 개발팀"
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">활동 날짜 <span className="text-red-500">*</span></label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사진 설명</label>
          <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="사진에 대한 간단한 설명을 입력해 주세요."
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`} />
        </div>

        {/* 드래그 앤 드롭 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사진 <span className="text-red-500">*</span></label>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {files.length === 0 ? (
              <div>
                <p className="text-3xl mb-2">🖼️</p>
                <p className="text-sm font-medium text-gray-600">클릭하거나 사진을 끌어다 놓으세요</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP · 여러 장 선택 가능</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFiles(prev => prev.filter((_, j) => j !== i)); }}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{formatBytes(f.size)}</p>
                  </div>
                ))}
                <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-2xl">+</div>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => addFiles(e.target.files)} />
        </div>

        <button type="submit" disabled={submitting} className={`w-full ${btnColor} text-white font-semibold py-3 rounded-xl transition-colors`}>
          {submitting ? `업로드 중... (${files.length}장)` : `사진 제출하기${files.length > 0 ? ` (${files.length}장)` : ""}`}
        </button>
      </form>

      {/* 제출된 사진 목록 */}
      {mySubmissions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-700 mb-3">제출된 사진 ({mySubmissions.length}장)</h3>
          <div className="grid grid-cols-2 gap-3">
            {mySubmissions.slice().reverse().map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <img src={s.fileUrl} alt={s.caption || s.fileName} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <p className="text-xs text-gray-500">{s.date}</p>
                  {s.caption && <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">{s.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
