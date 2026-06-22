"use client";

const NOTICES: { title: string; content: string; important?: boolean }[] = [
  // 나중에 유의사항을 여기에 추가하세요
];

export default function HomeTab({ internName }: { internName: string }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 환영 메시지 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white rounded-lg px-3 py-1.5">
            <img src="/logo.png" alt="미래에셋증권" className="h-6 object-contain" />
          </div>
          <div>
            <p className="text-white text-base font-bold">2026 하반기 체험형 인턴</p>
            <p className="text-blue-100 text-xs">멘토링 프로그램</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-1">안녕하세요, {internName}님 👋</h2>
        <p className="text-blue-100 text-sm">7월 6일 ~ 7월 31일 인턴 기간 동안 함께해요.</p>
      </div>

      {/* 인턴 기간 진행 바 */}
      <InternProgress />

      {/* 유의사항 */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-700 mb-3">공지 및 유의사항</h3>
        {NOTICES.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {NOTICES.map((notice, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  notice.important
                    ? "bg-red-50 border-red-100"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  {notice.important && (
                    <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full mt-0.5 shrink-0">
                      중요
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{notice.title}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{notice.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 활동일지 바로가기 */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-700 mb-3">활동일지 바로가기</h3>
        <div className="grid grid-cols-3 gap-3">
          <ShortcutCard icon="📝" label="멘토링 활동일지" color="blue" />
          <ShortcutCard icon="🔍" label="선배와의 탐구생활" color="purple" />
          <ShortcutCard icon="📖" label="우리팀 사용 설명서" color="green" />
        </div>
      </div>
    </div>
  );
}

function InternProgress() {
  const start = new Date("2026-07-06").getTime();
  const end = new Date("2026-07-31").getTime();
  const now = new Date().getTime();
  const total = end - start;
  const elapsed = Math.max(0, Math.min(now - start, total));
  const percent = Math.round((elapsed / total) * 100);
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">인턴 기간 진행률</span>
        <span className="text-sm text-gray-400">
          {percent >= 100 ? "완료" : `D-${daysLeft}`}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>7월 6일</span>
        <span className="font-medium text-blue-600">{percent}%</span>
        <span>7월 31일</span>
      </div>
    </div>
  );
}

function ShortcutCard({ icon, label, color }: { icon: string; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    green: "bg-green-50 border-green-100 text-green-700",
  };
  return (
    <div className={`rounded-xl border p-4 text-center ${colorMap[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs font-medium leading-tight">{label}</p>
    </div>
  );
}
