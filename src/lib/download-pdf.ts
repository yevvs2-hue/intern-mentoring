export async function downloadPdf(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("PDF 생성 실패");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}
