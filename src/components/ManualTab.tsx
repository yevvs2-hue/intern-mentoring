"use client";

import { useState, useRef } from "react";
import { ManualSubmission } from "@/types";

interface ManualTabProps {
  onSubmit: (formData: FormData) => Promise<void>;
  submissions: ManualSubmission[];
}

const ACCEPTED = ".ppt,.pptx,.pdf,.mp4,.mov,.avi,.webm";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["ppt", "pptx"].includes(ext ?? "")) return "📊";
  if (ext === "pdf") return "📄";
  if (["mp4", "mov", "avi", "webm"].includes(ext ?? "")) return "🎬";
  return "📁";
}

export default function ManualTab({ onSubmit, submissions }: ManualTabProps) {
  const [internName, setInternName] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError("");
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("파일을 선택해 주세요."); return; }
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("internName", internName);
      fd.append("department", department);
      fd.append("description", description);
      fd.append("file", file);
      await onSubmit(fd);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setInternName("");
      setDepartment("");
      setDescription("");
      setFile(null);
    } catch {
      setError("제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">멘토링 리뷰 제출</h2>
        <p className="text-sm text-gray-500 mt-1">PPT, PDF, 동영상 파일을 업로드해 주세요.</p>
      </div>

      {submitted && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✅ 멘토링 리뷰가 성공적으로 제출되었습니다!
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
            <input value={internName} onChange={e => setInternName(e.target.value)} required placeholder="홍길동" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">소속 부서 <span className="text-red-500">*</span></label>
            <input value={department} onChange={e => setDepartment(e.target.value)} required placeholder="예: 개발팀" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="멘토링 리뷰에 대한 간단한 설명을 입력해 주세요."
            className={textareaCls}
          />
        </div>

        {/* 파일 드래그 앤 드롭 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">파일 <span className="text-red-500">*</span></label>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{fileIcon(file.name)}</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="ml-2 text-gray-400 hover:text-red-500 text-lg"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">📂</p>
                <p className="text-sm font-medium text-gray-600">클릭하거나 파일을 여기에 끌어다 놓으세요</p>
                <p className="text-xs text-gray-400 mt-1">PPT, PPTX, PDF, MP4, MOV, AVI, WEBM</p>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {submitting ? "업로드 중..." : "멘토링 리뷰 제출하기"}
        </button>
      </form>

      {submissions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-700 mb-3">제출 내역 ({submissions.length}건)</h3>
          <div className="space-y-3">
            {submissions.slice().reverse().map((s) => (
              <div key={s.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                <span className="text-3xl">{fileIcon(s.fileName)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.fileName}</p>
                  <p className="text-xs text-gray-400">{s.internName} · {s.department} · {formatBytes(s.fileSize)}</p>
                  {s.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{s.description}</p>}
                </div>
                <a
                  href={s.fileUrl}
                  download={s.fileName}
                  className="text-xs text-green-600 hover:text-green-700 font-medium border border-green-200 rounded-lg px-3 py-1.5 shrink-0"
                >
                  다운로드
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
const textareaCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none";
