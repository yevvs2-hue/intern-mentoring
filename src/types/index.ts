export type SubmissionType = "mentoring" | "senior" | "manual" | "plan";

export interface MentoringSubmission {
  id: string;
  date: string;
  employeeId: string;
  internName: string;
  mentorName: string;
  department: string;
  duration: string;
  content: string;
  learned: string;
  nextPlan: string;
  submittedAt: string;
}

export interface SeniorSubmission {
  id: string;
  date: string;
  employeeId: string;
  internName: string;
  seniorName: string;
  seniorDepartment: string;
  department: string;
  topic: string;
  content: string;
  insights: string;
  submittedAt: string;
}

export interface ManualSubmission {
  id: string;
  employeeId: string;
  internName: string;
  department: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  submittedAt: string;
}

export interface SubmissionRecord {
  date: string;
  mentoring: boolean;
  senior: boolean;
  manual: boolean;
}

export interface Intern {
  name: string;
  employeeId: string;
  team?: string;
}

export interface PhotoSubmission {
  id: string;
  type: "mentoring" | "senior";
  submissionId?: string;
  employeeId: string;
  internName: string;
  department: string;
  date: string;
  caption: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  submittedAt: string;
}

export interface PlanSubmission {
  id: string;
  employeeId: string;
  internName: string;
  department: string;
  mentorName: string;
  mentoringPlan: string;
  seniorPlan: string;
  goal: string;
  submittedAt: string;
}

export interface SubmissionsStore {
  interns: Intern[];
  mentoring: MentoringSubmission[];
  senior: SeniorSubmission[];
  manual: ManualSubmission[];
  photos: PhotoSubmission[];
  plan: PlanSubmission[];
}
