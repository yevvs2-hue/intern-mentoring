"use client";

import { useState, useRef } from "react";
import { MentoringSubmission, PhotoSubmission } from "@/types";

interface MentoringTabProps {
  onSubmit: (data: Omit<MentoringSubmission, "id" | "submittedAt" | "employeeId">) => void | Promise<void>;
  onPhotoSubmit: (formData: FormData) => Promise<void>;
  submissions: MentoringSubmission[];
  photos: PhotoSubmission[];
}

export default function MentoringTab({ onSubmit, onPhotoSubmit, submissions, photos }: MentoringTabProps) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    internName: "",
    mentorName: "",
    department: "",
    duration: "",
    content: "",
    learned: "",
    nextPlan: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...form });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm((prev) => ({ ...prev, content: "", learned: "", nextPlan: "" }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">멘토링 활동일지 제출</h2>
        <p className="text-sm text-gray-500 mt-1">멘토와의 활동 내용을 기록하고 제출해 주세요.</p>
      </div>

      {submitted && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✅ 활동일지가 성공적으로 제출되었습니다!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="활동 날짜" required>
            <input type="date" name="date" value={form.date} onChange={handleChange} required min="2026-07-06" max="2026-07-31" className={inputCls} />
          </Field>
          <Field label="소속 부서" required>
            <input name="department" value={form.department} onChange={handleChange} required placeholder="예: 개발팀" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="인턴 이름" required>
            <input name="internName" value={form.internName} onChange={handleChange} required placeholder="홍길동" className={inputCls} />
          </Field>
          <Field label="멘토 이름" required>
            <input name="mentorName" value={form.mentorName} onChange={handleChange} required placeholder="김멘토" className={inputCls} />
          </Field>
        </div>

        <Field label="활동 시간">
          <select name="duration" value={form.duration} onChange={handleChange} className={inputCls}>
            <option value="">선택</option>
            <option>30분</option>
            <option>1시간</option>
            <option>1시간 30분</option>
            <option>2시간</option>
            <option>2시간 이상</option>
          </select>
        </Field>

        <Field label="활동 내용" required>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={4}
            placeholder="오늘 멘토링에서 다룬 내용을 구체적으로 작성해 주세요."
            className={textareaCls}
          />
        </Field>

        <Field label="배운 점 / 느낀 점" required>
          <textarea
            name="learned"
            value={form.learned}
            onChange={handleChange}
            required
            rows={3}
            placeholder="오늘 멘토링을 통해 배우거나 느낀 점을 작성해 주세요."
            className={textareaCls}
          />
        </Field>

        <Field label="다음 계획">
          <textarea
            name="nextPlan"
            value={form.nextPlan}
            onChange={handleChange}
            rows={2}
            placeholder="다음 멘토링까지의 목표나 계획을 작성해 주세요."
            className={textareaCls}
          />
        </Field>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
          활동일지 제출하기
        </button>
      </form>

      {submissions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-700 mb-3">제출 내역 ({submissions.length}건)</h3>
          <div className="space-y-3">
            {submissions.slice().reverse().map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </div>
        </div>
      )}

      <PhotoUploadSection type="mentoring" onPhotoSubmit={onPhotoSubmit} photos={photos} />
    </div>
  );
}

function SubmissionCard({ submission: s }: { submission: MentoringSubmission }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-4 flex justify-between items-start hover:bg-gray-100 transition-colors"
      >
        <div>
          <span className="font-medium text-gray-800">{s.internName}</span>
          <span className="text-gray-400 mx-2">·</span>
          <span className="text-sm text-gray-500">{s.date}</span>
          {s.duration && <span className="text-xs text-gray-400 ml-2">({s.duration})</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">멘토: {s.mentorName}</span>
          <a
            href={`/api/pdf/mentoring/${s.id}`}
            download
            onClick={e => e.stopPropagation()}
            className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 bg-white rounded-lg px-2 py-1"
          >
            PDF
          </a>
          <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          <DetailRow label="소속 부서" value={s.department} />
          <DetailRow label="활동 내용" value={s.content} />
          <DetailRow label="배운 점 / 느낀 점" value={s.learned} />
          {s.nextPlan && <DetailRow label="다음 계획" value={s.nextPlan} />}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="pt-2">
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const textareaCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none";

function PhotoUploadSection({ type, onPhotoSubmit, photos }: {
  type: "mentoring" | "senior";
  onPhotoSubmit: (formData: FormData) => Promise<void>;
  photos: PhotoSubmission[];
}) {
  const myPhotos = photos.filter(p => p.type === type);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fl: FileList | null) => {
    if (!fl) return;
    setFiles(prev => [...prev, ...Array.from(fl).filter(f => f.type.startsWith("image/"))]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("type", type);
        fd.append("internName", "");
        fd.append("department", "");
        fd.append("date", new Date().toISOString().slice(0, 10));
        fd.append("caption", caption);
        fd.append("file", file);
        await onPhotoSubmit(fd);
      }
      setFiles([]);
      setCaption("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-gray-700 mb-3">활동 사진</h3>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
        >
          {files.length === 0 ? (
            <div>
              <p className="text-2xl mb-1">📸</p>
              <p className="text-sm text-gray-500">사진을 끌어다 놓거나 클릭해서 선택</p>
              <p className="text-xs text-gray-400 mt-0.5">여러 장 가능 · JPG, PNG, WEBP</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(f)} className="w-full h-20 object-cover rounded-lg" />
                  <button type="button" onClick={e => { e.stopPropagation(); setFiles(prev => prev.filter((_, j) => j !== i)); }}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100">✕</button>
                </div>
              ))}
              <div className="h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 text-xl">+</div>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />

        {files.length > 0 && (
          <div className="flex gap-2">
            <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="사진 설명 (선택)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={handleUpload} disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 rounded-lg transition-colors">
              {uploading ? "업로드 중..." : `${files.length}장 업로드`}
            </button>
          </div>
        )}

        {myPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            {myPhotos.slice().reverse().map(p => (
              <div key={p.id}>
                <img src={p.fileUrl} alt={p.caption} className="w-full h-28 object-cover rounded-lg" />
                {p.caption && <p className="text-xs text-gray-400 mt-1 truncate">{p.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
