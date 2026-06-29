import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const BASE = "http://localhost:3000";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "photos");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 멘토링은 파란 계열, 선배탐구는 보라 계열 플레이스홀더
const COLORS = {
  mentoring: [
    { r: 59,  g: 130, b: 246 }, // blue-500
    { r: 37,  g: 99,  b: 235 }, // blue-600
    { r: 96,  g: 165, b: 250 }, // blue-400
    { r: 147, g: 197, b: 253 }, // blue-300
  ],
  senior: [
    { r: 124, g: 58,  b: 237 }, // violet-600
    { r: 109, g: 40,  b: 217 }, // violet-700
    { r: 167, g: 139, b: 250 }, // violet-400
    { r: 196, g: 181, b: 253 }, // violet-300
  ],
};

// 텍스트 없이 단색 + 약간의 그라디언트 느낌 이미지 생성
async function createPlaceholder(type, colorIdx) {
  const { r, g, b } = COLORS[type][colorIdx % COLORS[type].length];
  const width = 800, height = 600;

  // 3x3 픽셀 버퍼로 그라디언트 효과
  const pixels = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const fade = 1 - (x / width) * 0.3 - (y / height) * 0.2;
      pixels.push(Math.round(r * fade), Math.round(g * fade), Math.round(b * fade));
    }
  }

  const buf = await sharp(Buffer.from(pixels), {
    raw: { width, height, channels: 3 },
  })
    .jpeg({ quality: 80 })
    .toBuffer();

  const fileName = `${type}_${crypto.randomUUID()}.jpg`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, buf);
  return { fileName, fileUrl: `/uploads/photos/${fileName}`, fileSize: buf.length };
}

// 시드할 인턴/사진 계획
const r = await fetch(`${BASE}/api/admin/submissions`);
const data = await r.json();

const INTERNS = data.interns;
const MENTORING = data.mentoring;
const SENIOR = data.senior;

// 멘토링 제출 내역이 있는 인턴마다 1~2장 사진 생성
const photos = [];
let colorIdx = 0;

const MENTORING_CAPTIONS = [
  "멘토와 함께하는 포트폴리오 리뷰",
  "IB 딜 프로세스 멘토링 현장",
  "핀테크 트렌드 토론 중",
  "트레이딩 데스크 견학",
  "리서치 보고서 피드백 세션",
];
const SENIOR_CAPTIONS = [
  "선배님과의 커리어 토크",
  "현업 업무 동행 체험",
  "팀 문화 탐구 인터뷰",
  "오피스 투어 및 업무 소개",
];

for (const m of MENTORING) {
  const photoCount = colorIdx % 3 === 0 ? 2 : 1;
  for (let i = 0; i < photoCount; i++) {
    const { fileName, fileUrl, fileSize } = await createPlaceholder("mentoring", colorIdx + i);
    photos.push({
      type: "mentoring",
      employeeId: m.employeeId,
      internName: m.internName,
      department: m.department,
      date: m.date,
      caption: MENTORING_CAPTIONS[colorIdx % MENTORING_CAPTIONS.length],
      fileName,
      fileUrl,
      fileSize,
    });
  }
  colorIdx++;
}

for (const s of SENIOR) {
  const photoCount = colorIdx % 3 === 0 ? 2 : 1;
  for (let i = 0; i < photoCount; i++) {
    const { fileName, fileUrl, fileSize } = await createPlaceholder("senior", colorIdx + i);
    photos.push({
      type: "senior",
      employeeId: s.employeeId,
      internName: s.internName,
      department: s.department,
      date: s.date,
      caption: SENIOR_CAPTIONS[colorIdx % SENIOR_CAPTIONS.length],
      fileName,
      fileUrl,
      fileSize,
    });
  }
  colorIdx++;
}

console.log(`이미지 ${photos.length}장 생성 완료. 저장 중...`);

// 한 번에 저장
const res = await fetch(`${BASE}/api/admin/seed-photos`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ photos }),
});
const json = await res.json();
console.log("완료:", json);
