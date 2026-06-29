const BASE = "http://localhost:3000";

const INTERNS = [
  { name: "김민준", employeeId: "EMP2026001" },
  { name: "이서연", employeeId: "EMP2026002" },
  { name: "박지호", employeeId: "EMP2026003" },
  { name: "최유진", employeeId: "EMP2026004" },
  { name: "정다은", employeeId: "EMP2026005" },
  { name: "강민서", employeeId: "EMP2026006" },
  { name: "윤지우", employeeId: "EMP2026007" },
  { name: "임현우", employeeId: "EMP2026008" },
  { name: "한소희", employeeId: "EMP2026009" },
  { name: "오승준", employeeId: "EMP2026010" },
  { name: "신예린", employeeId: "EMP2026011" },
  { name: "권태양", employeeId: "EMP2026012" },
  { name: "류민지", employeeId: "EMP2026013" },
  { name: "배성현", employeeId: "EMP2026014" },
  { name: "장지수", employeeId: "EMP2026015" },
];

const DEPARTMENTS = [
  "리테일사업부", "WM사업부", "디지털혁신본부", "트레이딩본부",
  "자산운용부", "리서치센터", "준법감시부", "IB사업부",
];

const MENTORS = ["김영호 부장", "이정민 과장", "박수진 차장", "최동현 대리", "정혜린 과장"];
const SENIORS = ["이준혁 대리", "박서영 과장", "김태현 차장", "최지민 대리", "한민준 부장"];

const DATES = {
  1: ["2026-07-07", "2026-07-08", "2026-07-09"],
  2: ["2026-07-14", "2026-07-15", "2026-07-16"],
  3: ["2026-07-21", "2026-07-22", "2026-07-23"],
};

const MENTORING_CONTENTS = [
  {
    content: "금융상품 포트폴리오 구성 방법에 대해 멘토링을 받았습니다. 고객 성향별로 주식, 채권, 펀드의 비율을 조정하는 실무적인 접근법을 배웠습니다. 실제 고객 케이스 사례를 통해 리스크 관리의 중요성을 체감했습니다.",
    learned: "이론으로만 알던 포트폴리오 이론이 실제로는 훨씬 복잡한 고객 심리와 시장 상황을 고려해야 한다는 점을 깨달았습니다. 멘토님이 강조한 '고객의 언어로 말하기'가 특히 인상 깊었습니다.",
    nextPlan: "고객 상담 시뮬레이션을 직접 해보며 설명 능력을 키울 예정입니다.",
  },
  {
    content: "IB 딜 프로세스와 기업 가치 평가 방법론에 대한 멘토링을 진행했습니다. DCF 모델 작성 실습과 함께 실제 기업 분석 보고서를 리뷰했습니다. 멘토님의 경력에서 나온 생생한 사례들이 큰 도움이 됐습니다.",
    learned: "재무 모델링은 단순히 숫자를 넣는 작업이 아니라 비즈니스 이해를 수치로 표현하는 작업이라는 것을 알게 됐습니다. 가정(assumption)의 합리성이 얼마나 중요한지 실감했습니다.",
    nextPlan: "커버리지 기업 한 곳을 선택해 간단한 DCF 모델을 직접 작성해 볼 계획입니다.",
  },
  {
    content: "디지털 자산 플랫폼 개발 현황과 핀테크 트렌드에 대해 이야기를 나눴습니다. 현재 진행 중인 모바일 뱅킹 고도화 프로젝트의 기획 단계부터 개발, QA까지의 전체 프로세스를 배웠습니다.",
    learned: "금융 IT는 보안과 안정성이 최우선이라는 현실을 체감했습니다. 새로운 기술 도입 시 컴플라이언스 검토가 항상 병행된다는 점이 일반 IT와의 가장 큰 차이점이었습니다.",
    nextPlan: "핀테크 관련 논문 및 보고서를 찾아 읽어보겠습니다.",
  },
  {
    content: "트레이딩 데스크에서의 실무를 관찰하고 멘토링을 받았습니다. 시장 개장 전 모닝 브리핑 준비 과정과 주문 집행 방식, 리스크 한도 관리 방법을 배웠습니다.",
    learned: "순간적인 판단력과 냉정함이 트레이더에게 가장 중요한 역량임을 깨달았습니다. 수익보다 손실 관리가 훨씬 중요하다는 멘토님의 말씀이 기억에 남습니다.",
    nextPlan: "매일 시장 마감 후 주요 종목 움직임을 직접 분석하는 연습을 하겠습니다.",
  },
  {
    content: "리서치 보고서 작성 방법과 애널리스트 업무에 대한 멘토링을 진행했습니다. 산업 분석, 기업 분석 보고서의 구조와 투자 의견 도출 과정을 배웠습니다.",
    learned: "좋은 보고서는 독자가 알고 싶은 것을 명확하게 전달해야 한다는 점을 배웠습니다. 데이터보다 인사이트가 더 중요하다는 멘토님의 철학이 인상적이었습니다.",
    nextPlan: "관심 섹터의 기업 한 곳을 선정해 분석 노트를 작성해보겠습니다.",
  },
];

const SENIOR_TOPICS = [
  "IB 딜 소싱부터 클로징까지의 여정",
  "트레이더로서 15년: 시장과 함께 성장하기",
  "디지털 금융 혁신 최전선에서",
  "애널리스트의 하루와 커리어 설계",
  "WM 컨설턴트가 바라보는 고객 관계",
  "준법감시인이 말하는 금융 컴플라이언스",
  "리테일 영업 현장의 희로애락",
  "자산운용 PM의 투자 철학",
];

const SENIOR_CONTENTS = [
  {
    content: "선배님이 IB 업무를 시작한 계기부터 지금까지의 커리어 여정을 들었습니다. 처음 딜에 참여했을 때의 설렘과 긴장감, 그리고 실패를 통해 성장한 경험들을 솔직하게 공유해 주셨습니다. 딜 소싱 네트워크를 어떻게 구축하는지, 실사(due diligence) 과정에서 가장 중요하게 보는 포인트가 무엇인지 구체적으로 배웠습니다.",
    insights: "커리어는 단기 성과보다 장기적인 전문성 축적이 중요하다는 것을 느꼈습니다. 네트워크는 억지로 만드는 것이 아니라 진정성 있는 관계에서 자연스럽게 형성된다는 선배님의 말씀이 마음에 남습니다.",
  },
  {
    content: "시장 변동성이 극심했던 시기에 어떻게 포지션을 관리했는지, 개인 투자 철학은 무엇인지에 대해 이야기를 나눴습니다. 2020년 코로나 폭락장과 2022년 금리 급등기의 생생한 경험담을 들을 수 있었습니다.",
    insights: "경험이 쌓일수록 시장에 대한 겸손함이 더 커진다고 하셨습니다. '내가 틀릴 수 있다'는 전제 하에 리스크 관리를 하는 것이 장수하는 트레이더의 비결이라는 인사이트를 얻었습니다.",
  },
  {
    content: "핀테크 스타트업과의 협업 경험과 사내 디지털 전환 프로젝트 리딩 경험을 공유해 주셨습니다. 기획부터 개발팀 협업, 출시 후 운영까지 전 과정에서 발생했던 실제 문제들과 해결 방법을 배웠습니다.",
    insights: "기술은 수단이지 목적이 아니라는 선배님의 철학이 인상 깊었습니다. 사용자 관점에서 생각하지 않는 기능은 아무리 멋져도 외면받는다는 실제 사례를 통해 고객 중심적 사고의 중요성을 깨달았습니다.",
  },
  {
    content: "리포트를 쓰는 것보다 마켓에 나가 기업 관계자를 직접 만나는 것이 얼마나 중요한지 이야기해 주셨습니다. 커버리지 기업의 IR 담당자, CEO와 신뢰 관계를 쌓는 방법과 그 과정에서 얻는 비공개 인사이트의 가치를 배웠습니다.",
    insights: "숫자 뒤에 있는 사람과 스토리를 보는 눈이 좋은 애널리스트를 만든다고 하셨습니다. 재무제표는 과거이고, 투자는 미래를 사는 것이라는 관점이 새로웠습니다.",
  },
];

const DURATIONS = ["1시간", "1시간 30분", "2시간", "30분"];

// 멘토링 제출 횟수 분포: 3회(7명), 2회(4명), 1회(2명), 0회(2명)
const MENTORING_PLAN = [3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 0, 0];
// 선배탐구 제출 횟수 분포: 3회(6명), 2회(4명), 1회(3명), 0회(2명)
const SENIOR_PLAN = [3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 0, 0];

// 모든 데이터를 메모리에서 먼저 조립
const mentoring = [];
const senior = [];

for (let i = 0; i < INTERNS.length; i++) {
  const intern = INTERNS[i];
  const dept = DEPARTMENTS[i % DEPARTMENTS.length];

  for (let w = 0; w < MENTORING_PLAN[i]; w++) {
    const t = MENTORING_CONTENTS[w % MENTORING_CONTENTS.length];
    mentoring.push({
      employeeId: intern.employeeId,
      internName: intern.name,
      mentorName: MENTORS[i % MENTORS.length],
      department: dept,
      duration: DURATIONS[w % DURATIONS.length],
      date: DATES[w + 1][i % 3],
      content: t.content,
      learned: t.learned,
      nextPlan: t.nextPlan,
    });
  }

  for (let w = 0; w < SENIOR_PLAN[i]; w++) {
    const t = SENIOR_CONTENTS[w % SENIOR_CONTENTS.length];
    senior.push({
      employeeId: intern.employeeId,
      internName: intern.name,
      seniorName: SENIORS[i % SENIORS.length],
      department: dept,
      date: DATES[w + 1][(i + 1) % 3],
      topic: SENIOR_TOPICS[(i + w) % SENIOR_TOPICS.length],
      content: t.content,
      insights: t.insights,
    });
  }
}

// 발표 자료: 인턴 중 10명 제출 (나머지 5명 미제출)
const MANUAL_TITLES = [
  "2026 하반기 인턴 경험 발표 - 리테일사업부",
  "금융 IB 인턴십 활동 보고서",
  "디지털 혁신 프로젝트 탐구 결과",
  "트레이딩 업무 체험 및 인사이트",
  "WM 자산관리 멘토링 최종 발표",
  "리서치 애널리스트 업무 탐구 보고서",
  "준법감시 업무 체험 발표자료",
  "자산운용 인턴십 활동 정리",
  "IB 딜 프로세스 이해 및 발표",
  "금융권 커리어 탐색 최종 보고",
];

const manual = INTERNS.slice(0, 10).map((intern, i) => ({
  employeeId: intern.employeeId,
  internName: intern.name,
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  description: MANUAL_TITLES[i],
  fileName: `발표자료_${intern.name}.pdf`,
  fileUrl: "",
  fileSize: Math.floor(Math.random() * 5 * 1024 * 1024) + 1024 * 1024,
}));

console.log(`조립 완료: 멘토링 ${mentoring.length}건, 선배탐구 ${senior.length}건, 발표자료 ${manual.length}건`);
console.log("단일 요청으로 저장 중...");

const res = await fetch(`${BASE}/api/admin/seed`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ interns: INTERNS, mentoring, senior, manual }),
});

const json = await res.json();
console.log("완료:", json);
