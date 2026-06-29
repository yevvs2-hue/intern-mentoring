"use client";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: "home", label: "홈", icon: "🏠" },
  { id: "mentoring", label: "멘토링 활동일지", icon: "📝" },
  { id: "senior", label: "선배와의 탐구생활", icon: "🔍" },
  { id: "manual", label: "발표 자료", icon: "📖" },
];

interface TabNavProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function TabNav({ activeTab, onChange }: TabNavProps) {
  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <nav className="flex overflow-x-auto justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
