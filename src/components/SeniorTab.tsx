"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { SeniorSubmission, PhotoSubmission } from "@/types";
import { downloadPdf } from "@/lib/download-pdf";
import { useDraft } from "@/hooks/useDraft";
import { todayLocalDate } from "@/lib/date";
import { MENTORING_ROUNDS, getRoundIndex } from "@/lib/rounds";
import { compressImages } from "@/lib/compress-image";

function firstOpenRound(submittedRoundIndices: Set<number>): number | null {
  for (let i = 0; i < MENTORING_ROUNDS.length; i++) {
    if (!submittedRoundIndices.has(i)) return i;
  }
  return null;
}

interface SeniorTabProps {
  internName: string;
  onSubmit: (data: Omit<SeniorSubmission, "id" | "submittedAt" | "employeeId">, photos: File[]) => Promise<void>;
  onPhotoSubmit: (formData: FormData) => Promise<void>;
  submissions: SeniorSubmission[];
  photos: PhotoSubmission[];
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function SeniorTab({ internName, onSubmit, onPhotoSubmit, submissions, photos, onDelete, onRefresh }: SeniorTabProps) {
  const { value: form, save: saveForm, clear: clearDraft, savedAt: draftSavedAt } = useDraft("draft_senior", {
    seniorName: "",
    seniorDepartment: "",
    department: "",
    topic: "",
    content: "",
    insights: "",
  });
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoDragging, setPhotoDragging] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const submittedRoundIndices = useMemo(
    () => new Set(submissions.map((s) => getRoundIndex(s.date)).filter((i) => i !== -1)),
    [submissions]
  );
  const [selectedRoundIdx, setSelectedRoundIdx] = useState<number | null>(() => firstOpenRound(submittedRoundIndices));
  useEffect(() => {
    // re-sync only when the user's current pick becomes submitted elsewhere; manual picks are otherwise preserved
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedRoundIdx((prev) => (prev !== null && !submittedRoundIndices.has(prev) ? prev : firstOpenRound(submittedRoundIndices)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);
  const canSubmit = selectedRoundIdx !== null && !submittedRoundIndices.has(selectedRoundIdx);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    saveForm({ ...form, [e.target.name]: e.target.value });
  };

  const addPhotos = async (fl: FileList | null) => {
    if (!fl) return;
    const images = Array.from(fl).filter(f => f.type.startsWith("image/"));
    const compressed = await compressImages(images);
    setSelectedPhotos(prev => [...prev, ...compressed]);
    setPhotoError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPhotos.length === 0) {
      setPhotoError(true);
      return;
    }
    if (!canSubmit || selectedRoundIdx === null) {
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ ...form, internName, date: MENTORING_ROUNDS[selectedRoundIdx].start }, selectedPhotos);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      clearDraft();
      setSelectedPhotos([]);
      setPhotoError(false);
    } catch {
      setError("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">선배 탐구생활 제출</h2>
        <p className="text-sm text-gray-500 mt-1">선배와의 만남을 통해 탐구한 내용을 기록해 주세요. 총 3회(1차~3차) 제출하며, 차수당 1건만 제출할 수 있습니다. 제출할 차수를 선택해 주세요.</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {MENTORING_ROUNDS.map((r, i) => {
          const done = submittedRoundIndices.has(i);
          const selected = selectedRoundIdx === i;
          return (
            <div key={r.label} className="flex items-center flex-1">
              <button
                type="button"
                disabled={done}
                onClick={() => setSelectedRoundIdx(i)}
                className={`flex-1 rounded-xl border px-3 py-2 text-center transition-colors ${
                  done
                    ? "bg-purple-600 border-purple-600 text-white cursor-default"
                    : selected
                    ? "bg-purple-50 border-purple-400 text-purple-700"
                    : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-semibold">{done ? "✓ " : ""}{r.label}</p>
                <p className={`text-[10px] mt-0.5 ${done ? "text-purple-100" : selected ? "text-purple-500" : "text-gray-400"}`}>
                  {r.start.slice(5).replace("-", "/")} ~ {r.end.slice(5).replace("-", "/")}
                </p>
              </button>
              {i < MENTORING_ROUNDS.length - 1 && <div className="w-2 shrink-0" />}
            </div>
          );
        })}
      </div>

      {submitted && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✅ 탐구생활 일지가 성공적으로 제출되었습니다!
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        {selectedRoundIdx === null && (
          <p className="text-xs text-red-500">
            모든 차수를 제출 완료했습니다. 더 이상 제출할 수 없습니다.
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="인턴 이름">
            <input value={internName} readOnly className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-default" />
          </Field>
          <Field label="소속 부서" required>
            <input name="department" value={form.department} onChange={handleChange} required placeholder="예: 마케팅팀" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="선배 이름" required>
            <input name="seniorName" value={form.seniorName} onChange={handleChange} required placeholder="이선배" className={inputCls} />
          </Field>
          <Field label="선배 소속 부서" required>
            <input name="seniorDepartment" value={form.seniorDepartment} onChange={handleChange} required placeholder="예: IB사업부" className={inputCls} />
          </Field>
        </div>

        <Field label="탐구 주제" required>
          <input
            name="topic"
            value={form.topic}
            onChange={handleChange}
            required
            placeholder="예: 기획자의 하루 / 팀 내 커뮤니케이션 방식"
            className={inputCls}
          />
        </Field>

        <Field label="탐구 내용" required>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={4}
            placeholder="선배와 나눈 대화, 들은 내용, 함께 한 활동 등을 구체적으로 작성해 주세요."
            className={textareaCls}
          />
        </Field>

        <Field label="인사이트 / 느낀 점" required>
          <textarea
            name="insights"
            value={form.insights}
            onChange={handleChange}
            required
            rows={3}
            placeholder="이번 탐구를 통해 얻은 인사이트나 느낀 점을 작성해 주세요."
            className={textareaCls}
          />
        </Field>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            활동 사진 <span className="text-red-500">*</span>
            <span className="text-xs font-normal text-gray-400 ml-1">(1장 이상 필수)</span>
          </label>
          <div
            onClick={() => photoInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setPhotoDragging(true); }}
            onDragLeave={() => setPhotoDragging(false)}
            onDrop={e => { e.preventDefault(); setPhotoDragging(false); addPhotos(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
              photoError ? "border-red-400 bg-red-50" :
              photoDragging ? "border-purple-400 bg-purple-50" :
              selectedPhotos.length > 0 ? "border-purple-300 bg-purple-50" :
              "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {selectedPhotos.length === 0 ? (
              <div>
                <p className="text-2xl mb-1">📸</p>
                <p className="text-sm text-gray-500">사진을 끌어다 놓거나 클릭해서 선택</p>
                <p className="text-xs text-gray-400 mt-0.5">여러 장 가능 · JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {selectedPhotos.map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(f)} className="w-full h-20 object-cover rounded-lg" alt="" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setSelectedPhotos(prev => prev.filter((_, j) => j !== i)); }}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >✕</button>
                  </div>
                ))}
                <div className="h-20 border-2 border-dashed border-purple-200 rounded-lg flex items-center justify-center text-purple-300 text-xl">+</div>
              </div>
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addPhotos(e.target.files)} />
          {photoError && (
            <p className="text-xs text-red-500 mt-1">활동 사진을 1장 이상 첨부해 주세요.</p>
          )}
          {selectedPhotos.length > 0 && (
            <p className="text-xs text-purple-600 mt-1">{selectedPhotos.length}장 선택됨</p>
          )}
        </div>

        <div className="space-y-2">
          {draftSavedAt && (
            <p className="text-xs text-gray-400 text-center">
              임시저장됨 · {draftSavedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <button type="submit" disabled={submitting || !canSubmit} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-xl transition-colors">
            {submitting ? "제출 중..." : !canSubmit ? "제출할 차수를 선택해 주세요" : `${MENTORING_ROUNDS[selectedRoundIdx!].label} 탐구생활 제출하기`}
          </button>
        </div>
      </form>

      {submissions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-700 mb-3">제출 내역 ({submissions.length}건)</h3>
          <div className="space-y-3">
            {submissions.slice().reverse().map((s) => (
              <SubmissionCard key={s.id} submission={s} photos={photos} onDelete={onDelete} onRefresh={onRefresh} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function SubmissionCard({
  submission: s,
  photos,
  onDelete,
  onRefresh,
}: {
  submission: SeniorSubmission;
  photos: PhotoSubmission[];
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const logPhotos = photos.filter((p) =>
    p.type === "senior" &&
    (p.submissionId ? p.submissionId === s.id : p.employeeId === s.employeeId && p.date === s.date)
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState({
    date: s.date,
    seniorName: s.seniorName,
    seniorDepartment: s.seniorDepartment,
    department: s.department,
    topic: s.topic,
    content: s.content,
    insights: s.insights,
  });

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = async () => {
    if (!confirm("이 제출 건을 삭제하시겠습니까?")) return;
    setError("");
    setDeleting(true);
    try {
      await onDelete(s.id);
    } catch {
      setError("삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/submissions/senior", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, employeeId: s.employeeId, ...editForm }),
      });
      if (!res.ok) throw new Error("수정에 실패했습니다.");
      setEditing(false);
      await onRefresh();
    } catch {
      setError("수정 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => { if (!editing) setOpen(!open); }}
        className="w-full text-left px-4 py-4 flex justify-between items-start hover:bg-gray-100 transition-colors"
      >
        <div>
          <span className="font-medium text-gray-800">{s.internName}</span>
          <span className="text-gray-400 mx-2">·</span>
          <span className="text-sm text-purple-600 font-medium">{s.topic}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{s.date}</span>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); downloadPdf(`/api/pdf/senior/${s.id}`, `선배탐구생활_${s.internName}_${s.date}.pdf`); }}
            className="text-xs text-purple-600 hover:text-purple-700 border border-purple-200 bg-white rounded-lg px-2 py-1"
          >
            PDF
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setEditing(true); setOpen(true); }}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 bg-white rounded-lg px-2 py-1"
          >
            수정
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); handleDelete(); }}
            disabled={deleting}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 bg-white rounded-lg px-2 py-1 disabled:opacity-40"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
          <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {error && (
        <p className="px-4 pb-3 text-xs text-red-500">{error}</p>
      )}
      {open && !editing && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          <DetailRow label="선배 이름" value={s.seniorName} />
          <DetailRow label="선배 소속 부서" value={s.seniorDepartment} />
          <DetailRow label="소속 부서" value={s.department} />
          <DetailRow label="탐구 내용" value={s.content} />
          <DetailRow label="인사이트 / 느낀 점" value={s.insights} />
          {logPhotos.length > 0 && (
            <div className="pt-2">
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
      )}
      {open && editing && (
        <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <EditField label="활동 날짜">
              <input type="date" name="date" value={editForm.date} onChange={handleEditChange} className={inputCls} />
            </EditField>
            <EditField label="소속 부서">
              <input name="department" value={editForm.department} onChange={handleEditChange} className={inputCls} />
            </EditField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EditField label="선배 이름">
              <input name="seniorName" value={editForm.seniorName} onChange={handleEditChange} className={inputCls} />
            </EditField>
            <EditField label="선배 소속 부서">
              <input name="seniorDepartment" value={editForm.seniorDepartment} onChange={handleEditChange} className={inputCls} />
            </EditField>
          </div>
          <EditField label="탐구 주제">
            <input name="topic" value={editForm.topic} onChange={handleEditChange} className={inputCls} />
          </EditField>
          <EditField label="탐구 내용">
            <textarea name="content" value={editForm.content} onChange={handleEditChange} rows={4} className={textareaCls} />
          </EditField>
          <EditField label="인사이트 / 느낀 점">
            <textarea name="insights" value={editForm.insights} onChange={handleEditChange} rows={3} className={textareaCls} />
          </EditField>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? "저장 중..." : "수정 완료"}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setEditForm({ date: s.date, seniorName: s.seniorName, seniorDepartment: s.seniorDepartment, department: s.department, topic: s.topic, content: s.content, insights: s.insights }); }}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
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

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
const textareaCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none";

function PhotoUploadSection({ type, onPhotoSubmit, photos }: {
  type: "mentoring" | "senior";
  onPhotoSubmit: (formData: FormData) => Promise<void>;
  photos: PhotoSubmission[];
}) {
  const myPhotos = photos.filter(p => p.type === type);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (fl: FileList | null) => {
    if (!fl) return;
    const images = Array.from(fl).filter(f => f.type.startsWith("image/"));
    const compressed = await compressImages(images);
    setFiles(prev => [...prev, ...compressed]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("type", type);
        fd.append("internName", "");
        fd.append("department", "");
        fd.append("date", todayLocalDate());
        fd.append("caption", caption);
        fd.append("file", file);
        await onPhotoSubmit(fd);
      }
      setFiles([]);
      setCaption("");
    } catch {
      setUploadError("사진 업로드 중 오류가 발생했습니다.");
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
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${dragging ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
        >
          {files.length === 0 ? (
            <div>
              <p className="text-2xl mb-1">📷</p>
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
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <button onClick={handleUpload} disabled={uploading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium px-4 rounded-lg transition-colors">
              {uploading ? "업로드 중..." : `${files.length}장 업로드`}
            </button>
          </div>
        )}
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

        {myPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            {myPhotos.slice().reverse().map(p => (
              <div key={p.id}>
                <img src={`/api/photos/${p.id}`} alt={p.caption} className="w-full h-28 object-cover rounded-lg" />
                {p.caption && <p className="text-xs text-gray-400 mt-1 truncate">{p.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
