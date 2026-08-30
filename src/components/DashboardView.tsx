import React from 'react';
import {
  Users,
  CalendarCheck,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Bot,
  UserCheck,
  Bookmark,
} from 'lucide-react';
import { Student, AttendanceRecord, StudentEvaluation, AppSettings } from '../types';
import { TabType } from './Navbar';

interface DashboardViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  evaluations: StudentEvaluation[];
  settings: AppSettings;
  onNavigateTab: (tab: TabType) => void;
  onSelectStudentForEval: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  attendance,
  evaluations,
  settings,
  onNavigateTab,
  onSelectStudentForEval,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Today's attendance calculation
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
  const excusedCount = todayAttendance.filter((a) => a.status === 'excused').length;

  // Today's completed evaluations
  const todayEvaluations = evaluations.filter((e) => e.date === todayStr);
  const completedTasmeeCount = todayEvaluations.length;

  // Pending students who are present today but not yet evaluated
  const presentStudentIds = todayAttendance
    .filter((a) => a.status === 'present' || a.status === 'late')
    .map((a) => a.studentId);

  const evaluatedStudentIds = todayEvaluations.map((e) => e.studentId);
  const pendingForEval = students.filter(
    (s) => presentStudentIds.includes(s.id) && !evaluatedStudentIds.includes(s.id)
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Islamic Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/40 p-6 sm:p-8 shadow-2xl shadow-emerald-950/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>مرحباً بك في {settings.halagahName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-kufi bg-gradient-to-l from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
              لوحة التحكم والإحصائيات القرآنية اليومية
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-amiri text-base leading-relaxed">
              « خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ » — أهلاً بك يا {settings.teacherName}، خطط اليوم معدّة
              بالذكاء الاصطناعي وجاهزة للتسميع والتقييم.
            </p>
          </div>

          {/* Quick Date and Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('evaluation')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 flex items-center gap-2.5 transition-all cursor-pointer group"
            >
              <Award className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>بدء جلسات التسميع</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>كشف الحضور اليومي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">إجمالي طلاب الحلقة</p>
            <h3 className="text-3xl font-black text-slate-100 mt-1">{students.length}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>جميعهم لديهم خطط ذكية</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Present Today */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">الحضور اليوم</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-emerald-400">{presentCount}</h3>
              <span className="text-xs text-slate-400">/ {students.length} طالب</span>
            </div>
            <p className="text-[11px] text-emerald-300 mt-1">
              {students.length > 0 ? `${Math.round((presentCount / students.length) * 100)}% نسبة الحضور` : 'لا يوجد طلاب'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Absent & Excused */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">الغياب والاعتذار</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-rose-400">{absentCount}</h3>
              <span className="text-xs text-slate-400">+ {excusedCount} معتذر</span>
            </div>
            <p className="text-[11px] text-rose-300/80 mt-1">يتم حجبهم تلقائياً من التقييم</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-950/50 border border-rose-800/50 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Recitations */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">تسميعات اليوم المنجزة</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-amber-400">{completedTasmeeCount}</h3>
              <span className="text-xs text-slate-400">/ {presentCount} حاضر</span>
            </div>
            <p className="text-[11px] text-amber-300 mt-1">
              {pendingForEval.length > 0 ? `${pendingForEval.length} طلاب بانتظار التسميع` : 'تم إكمال جميع التسميعات ✨'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/50 border border-amber-800/50 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Recitations & Halagah Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Recitation Schedule / Pending Students */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold font-kufi text-slate-100">جدول تسميع وخطط طلاب اليوم</h2>
            </div>
            <button
              onClick={() => onNavigateTab('evaluation')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>فتح شاشة التقييم الكاملة</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {students.map((student) => {
              const att = todayAttendance.find((a) => a.studentId === student.id);
              const isPresent = att?.status === 'present' || att?.status === 'late';
              const isAbsent = att?.status === 'absent';
              const isExcused = att?.status === 'excused';
              const evaluation = todayEvaluations.find((e) => e.studentId === student.id);

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    evaluation
                      ? 'bg-emerald-950/30 border-emerald-800/40'
                      : isAbsent || isExcused
                      ? 'bg-slate-900/40 border-slate-800/40 opacity-60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-emerald-600/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          evaluation
                            ? 'bg-emerald-700 text-white'
                            : isPresent
                            ? 'bg-teal-900 text-teal-200 border border-teal-600'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {student.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100">{student.name}</h4>
                          {att && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                att.status === 'present'
                                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                                  : att.status === 'late'
                                  ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                                  : att.status === 'excused'
                                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                                  : 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                              }`}
                            >
                              {att.status === 'present'
                                ? 'حاضر'
                                : att.status === 'late'
                                ? 'متأخر'
                                : att.status === 'excused'
                                ? 'معتذر'
                                : 'غائب'}
                            </span>
                          )}
                        </div>

                        {/* Assigned portion summary */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>
                              مقرر الحفظ: سورة {student.aiPlan?.todayAssignedSurah || 'المقررة'} (آية{' '}
                              {student.aiPlan?.todayAssignedFromAyah || 1} - {student.aiPlan?.todayAssignedToAyah || 15})
                            </span>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">ورد المراجعة: {student.aiPlan?.todayAssignedRevision}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {evaluation ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>تم التقييم بنجاح ({evaluation.aiFeedback?.statusAssessment || 'مكتمل'})</span>
                        </div>
                      ) : isPresent ? (
                        <button
                          onClick={() => {
                            onSelectStudentForEval(student.id);
                            onNavigateTab('evaluation');
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-300" />
                          <span>تقييم وتسميع الآن</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">غير متاح للتسميع (غائب)</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quick AI & Halagah Tools */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-kufi text-slate-100">أدوات عمران الذكية السريعة</h2>
          </div>

          <div className="space-y-3">
            {/* WhatsApp Hub card */}
            <div
              onClick={() => onNavigateTab('parents')}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/60 border border-emerald-800/40 hover:border-emerald-500/80 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    رسائل أولياء الأمور عبر الواتساب
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    توليد رسائل يومية مؤتمتة لكل طالب حسب حضوره وتسميعه مع زر إرسال مباشر بروابط المتابعة.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Quran Assistant card */}
            <div
              onClick={() => onNavigateTab('ai-chat')}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-800/40 hover:border-amber-500/80 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    مساعد عمران القرآني الذكي
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    شات تفاعلي لتعديل الخطط، الاستفسار عن متشابهات الآيات، وطرق تحفيز الطلاب المتعثرين.
                  </p>
                </div>
              </div>
            </div>

            {/* Weekly & Monthly Reports card */}
            <div
              onClick={() => onNavigateTab('reports')}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950/60 border border-teal-800/40 hover:border-teal-500/80 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                    التقارير التحليلية والروابط الخاصة
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    تقارير أسبوعية وشهرية تفصيلية لكل طالب مع صفحة مخصصة ومحدثة لولي الأمر.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
