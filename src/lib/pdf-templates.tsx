import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";
import { MentoringSubmission, SeniorSubmission } from "@/types";

Font.register({
  family: "NanumGothic",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/NanumGothic-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/NanumGothic-Bold.ttf"), fontWeight: 700 },
  ],
});

const c = {
  blue: "#2563EB",
  purple: "#7C3AED",
  lightBlue: "#EFF6FF",
  lightPurple: "#F5F3FF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray300: "#D1D5DB",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  white: "#FFFFFF",
};

const base = StyleSheet.create({
  page: { fontFamily: "NanumGothic", padding: "40 48", backgroundColor: c.white, fontSize: 10, color: c.gray700 },
  header: { marginBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 9, fontWeight: 700, color: c.white },
  title: { fontSize: 18, fontWeight: 700, color: c.gray900, marginBottom: 2 },
  subtitle: { fontSize: 10, color: c.gray500 },
  divider: { borderBottom: `1 solid ${c.gray300}`, marginBottom: 20 },
  infoGrid: { flexDirection: "row", gap: 8, marginBottom: 20 },
  infoCard: { flex: 1, backgroundColor: c.gray50, borderRadius: 6, padding: "10 12" },
  infoLabel: { fontSize: 8, color: c.gray500, marginBottom: 3 },
  infoValue: { fontSize: 10, fontWeight: 700, color: c.gray900 },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sectionDot: { width: 3, height: 14, borderRadius: 2, marginRight: 7 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: c.gray900 },
  sectionBody: { borderRadius: 6, padding: "12 14", lineHeight: 1.7, fontSize: 10, color: c.gray700 },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", borderTop: `1 solid ${c.gray100}`, paddingTop: 8 },
  footerText: { fontSize: 8, color: c.gray300 },
});

function Section({ label, value, bg, dot }: { label: string; value: string; bg: string; dot: string }) {
  if (!value) return null;
  return (
    <View style={base.section}>
      <View style={base.sectionHeader}>
        <View style={[base.sectionDot, { backgroundColor: dot }]} />
        <Text style={base.sectionLabel}>{label}</Text>
      </View>
      <View style={[base.sectionBody, { backgroundColor: bg }]}>
        <Text>{value}</Text>
      </View>
    </View>
  );
}

export function MentoringPDF({ s }: { s: MentoringSubmission }) {
  return (
    <Document title={`멘토링 활동일지_${s.internName}_${s.date}`}>
      <Page size="A4" style={base.page}>
        <View style={base.header}>
          <View style={base.headerTop}>
            <View>
              <Text style={base.title}>멘토링 활동일지</Text>
              <Text style={base.subtitle}>2026 여름 인턴 멘토링 프로그램</Text>
            </View>
            <View style={[base.badge, { backgroundColor: c.blue }]}>
              <Text>{s.date}</Text>
            </View>
          </View>
          <View style={base.divider} />
        </View>

        <View style={base.infoGrid}>
          <View style={base.infoCard}>
            <Text style={base.infoLabel}>인턴 이름</Text>
            <Text style={base.infoValue}>{s.internName}</Text>
          </View>
          <View style={base.infoCard}>
            <Text style={base.infoLabel}>멘토 이름</Text>
            <Text style={base.infoValue}>{s.mentorName}</Text>
          </View>
          <View style={base.infoCard}>
            <Text style={base.infoLabel}>소속 부서</Text>
            <Text style={base.infoValue}>{s.department}</Text>
          </View>
          {s.duration && (
            <View style={base.infoCard}>
              <Text style={base.infoLabel}>활동 시간</Text>
              <Text style={base.infoValue}>{s.duration}</Text>
            </View>
          )}
        </View>

        <Section label="활동 내용" value={s.content} bg={c.lightBlue} dot={c.blue} />
        <Section label="배운 점 / 느낀 점" value={s.learned} bg={c.gray50} dot={c.blue} />
        {s.nextPlan && <Section label="다음 계획" value={s.nextPlan} bg={c.gray50} dot={c.gray300} />}

        <View style={base.footer}>
          <Text style={base.footerText}>2026 여름 인턴 멘토링 활동일지</Text>
          <Text style={base.footerText}>{s.internName} · {s.employeeId}</Text>
        </View>
      </Page>
    </Document>
  );
}

export function SeniorPDF({ s }: { s: SeniorSubmission }) {
  return (
    <Document title={`선배탐구_${s.internName}_${s.date}`}>
      <Page size="A4" style={base.page}>
        <View style={base.header}>
          <View style={base.headerTop}>
            <View>
              <Text style={base.title}>선배와의 탐구생활</Text>
              <Text style={base.subtitle}>2026 여름 인턴 멘토링 프로그램</Text>
            </View>
            <View style={[base.badge, { backgroundColor: c.purple }]}>
              <Text>{s.date}</Text>
            </View>
          </View>
          <View style={base.divider} />
        </View>

        <View style={base.infoGrid}>
          <View style={base.infoCard}>
            <Text style={base.infoLabel}>인턴 이름</Text>
            <Text style={base.infoValue}>{s.internName}</Text>
          </View>
          <View style={base.infoCard}>
            <Text style={base.infoLabel}>선배 이름</Text>
            <Text style={base.infoValue}>{s.seniorName}</Text>
          </View>
          <View style={base.infoCard}>
            <Text style={base.infoLabel}>소속 부서</Text>
            <Text style={base.infoValue}>{s.department}</Text>
          </View>
        </View>

        <View style={[base.section, { marginBottom: 16 }]}>
          <View style={base.sectionHeader}>
            <View style={[base.sectionDot, { backgroundColor: c.purple }]} />
            <Text style={base.sectionLabel}>탐구 주제</Text>
          </View>
          <View style={[base.sectionBody, { backgroundColor: c.lightPurple, borderLeft: `3 solid ${c.purple}` }]}>
            <Text style={{ fontWeight: 700, fontSize: 12, color: c.purple }}>{s.topic}</Text>
          </View>
        </View>

        <Section label="탐구 내용" value={s.content} bg={c.lightPurple} dot={c.purple} />
        <Section label="인사이트 / 느낀 점" value={s.insights} bg={c.gray50} dot={c.purple} />

        <View style={base.footer}>
          <Text style={base.footerText}>2026 여름 인턴 선배와의 탐구생활</Text>
          <Text style={base.footerText}>{s.internName} · {s.employeeId}</Text>
        </View>
      </Page>
    </Document>
  );
}
