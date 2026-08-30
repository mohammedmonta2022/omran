export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  studentId?: string;
}

export type StudentLevel = 'ضعيف' | 'متوسط' | 'قوي';

export interface ParentContact {
  label: string;
  phone: string;
}

export interface AIStudentPlan {
  currentGoal: string;
  todayAssignedSurah: string;
  todayAssignedSurahId: number;
  todayAssignedFromAyah: number;
  todayAssignedToAyah: number;
  todayAssignedRevision: string;
  recommendedSheikh: string;
  difficultyRating: 'سهل' | 'متوسط' | 'شديد التحدي';
  memorizationStrategy: string;
  tajweedFocus: string;
  lastCalculatedDate: string;
  planHistoryNote?: string;
}

export interface Student {
  id: string;
  name: string;
  password?: string;
  phone: string;
  parentName: string;
  parentPhones: ParentContact[];
  age: number;
  startingSurahId: number;
  startingAyah: number;
  currentSurahId: number;
  currentAyah: number;
  dailyNewCapacity: string;
  dailyRevisionCapacity: string;
  level: StudentLevel;
  notes?: string;
  createdAt: string;
  aiPlan?: AIStudentPlan;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  updatedAt: string;
}

export type CriterionType = 'stars' | 'numeric' | 'options' | 'text';

export interface EvaluationCriterion {
  id: string;
  title: string;
  type: CriterionType;
  maxScore?: number; // e.g. 5, 7, 9, 10, 100
  options?: string[]; // e.g. ['ممتاز', 'جيد جدا', 'مقبول', 'ضعيف']
  isDefault?: boolean;
}

export interface TasmeeDetails {
  completedNewPortion: 'كامل' | 'نصف' | 'جزئي' | 'لم يسمع';
  memorizedExactVersesNotes: string;
  completedRevisionPortion: 'كامل' | 'نصف' | 'لم يراجع';
  revisionNotes: string;
  teacherNote: string;
}

export interface AIEvaluationFeedback {
  statusAssessment: 'متقدم وسريع الإتقان' | 'على المسار المطلوب' | 'متأخر ويحتاج تثبيت وتخفيف';
  analysis: string;
  nextDayPlan: {
    surahName: string;
    surahId: number;
    fromAyah: number;
    toAyah: number;
    revisionPortion: string;
  };
  pedagogicalAdvice: string;
  recommendedSheikh: string;
  mutashabihatTip?: string;
}

export interface StudentEvaluation {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  attendanceStatus: AttendanceStatus;
  scores: Record<string, number | string>;
  tasmeeDetails: TasmeeDetails;
  aiFeedback?: AIEvaluationFeedback;
  createdAt: string;
}

export interface AppSettings {
  allowStudentRegistration: boolean;
  weeklyWorkDays: string[];
  halagahName: string;
  teacherName: string;
  teacherPhone: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  contextSnippet?: string;
}

export interface PlatformDataBackup {
  version: string;
  exportedAt: string;
  settings: AppSettings;
  students: Student[];
  attendance: AttendanceRecord[];
  criteria: EvaluationCriterion[];
  evaluations: StudentEvaluation[];
  chatMessages: ChatMessage[];
}
