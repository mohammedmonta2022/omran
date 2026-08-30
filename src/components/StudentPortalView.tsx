import React from 'react';
import {
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Volume2,
  CalendarCheck,
  Star,
  Compass,
  BookmarkCheck,
  Flame,
  ShieldCheck,
  User,
  Heart,
} from 'lucide-react';
import { Student, AttendanceRecord, StudentEvaluation, AppSettings } from '../types';

interface StudentPortalViewProps {
  student: Student;
  attendance: AttendanceRecord[];
  evaluations: StudentEvaluation[];
  settings: AppSettings;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  student,
  attendance,
  evaluations,
  settings,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todayAtt = attendance.find((a) => a.date === todayStr && a.studentId === student.id);
  const todayEval = evaluations.find((e) => e.date === todayStr && e.studentId === student.id);
  const pastEvaluations = evaluations.filter((e) => e.studentId === student.id);

  const presentDays = attendance.filter(
    (a) => a.studentId === student.id && (a.status === 'present' || a.status === 'late')
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/50 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-0.5 shadow-xl shadow-emerald-950">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center font-bold text-2xl text-emerald-300">
                {student.name.slice(0, 1)}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-400 block mb-0.5">
                مقرأة {settings.halagahName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-kufi text-slate-100">
                مرحباً بك يا بني / {student.name} 🌿
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                معلمك المشرف: {settings.teacherName} • مستوى {student.level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 block">أيام الحضور والالتزام</span>
              <strong className="text-base font-black text-amber-300">{presentDays} أيام مباركة</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Prescribed Quran Task Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-700/60 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-black font-kufi text-slate-100">
              وردك القرآني المقرر لليوم (خطة الذكاء الاصطناعي)
            </h2>
          </div>

          {todayEval ? (
            <span className="px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم التسميع اليوم ({todayEval.aiFeedback?.statusAssessment || 'مكتمل'})</span>
            </span>
          ) : todayAtt ? (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                todayAtt.status === 'present'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : todayAtt.status === 'late'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              الحالة: {todayAtt.status === 'present' ? 'حاضر' : todayAtt.status === 'late' ? 'متأخر' : 'غائب'}
            </span>
          ) : null}
        </div>

        {student.aiPlan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Portions Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-800/60 space-y-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4" />
                  <span>المقرر الجديد للحفظ:</span>
                </span>
                <h3 className="text-xl font-black text-emerald-300">
                  سورة {student.aiPlan.todayAssignedSurah}
                </h3>
                <p className="text-xs text-slate-200">
                  من الآية رقم <strong className="text-amber-300">{student.aiPlan.todayAssignedFromAyah}</strong> إلى
                  الآية رقم <strong className="text-amber-300">{student.aiPlan.todayAssignedToAyah}</strong>
                </p>
                <div className="pt-2 border-t border-emerald-900/40 text-[11px] text-slate-400">
                  طريقة الحفظ: {student.aiPlan.memorizationStrategy}
                </div>
              </div>

              {/* Revision Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/60 to-slate-950 border border-teal-800/60 space-y-2">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>ورد المراجعة والتثبيت:</span>
                </span>
                <h3 className="text-xl font-black text-teal-200">
                  {student.aiPlan.todayAssignedRevision}
                </h3>
                <p className="text-xs text-slate-300">
                  التركيز التجويدي: <strong className="text-amber-300">{student.aiPlan.tajweedFocus}</strong>
                </p>
                <div className="pt-2 border-t border-teal-900/40 text-[11px] text-slate-400">
                  القارئ الموصى به: {student.aiPlan.recommendedSheikh}
                </div>
              </div>
            </div>

            {/* AI Teacher Feedback if evaluated today */}
            {todayEval?.aiFeedback && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-800/60 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>ملاحظة وتوجيه الذكاء الاصطناعي ومقرئ الحلقة لك اليوم:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {todayEval.aiFeedback.pedagogicalAdvice}
                </p>
                {todayEval.aiFeedback.mutashabihatTip && (
                  <div className="text-xs text-teal-300 p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-900">
                    💡 تنبيه الآيات: {todayEval.aiFeedback.mutashabihatTip}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950 rounded-2xl text-slate-400 text-xs">
            خطة الحفظ قيد الإعداد من قبل المعلم.
          </div>
        )}
      </div>

      {/* Recitation Badges and Past Records */}
      <div className="space-y-4">
        <h3 className="text-base font-bold font-kufi text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>سجل التسميعات السابقة والإنجازات ({pastEvaluations.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastEvaluations.map((evalItem) => (
            <div
              key={evalItem.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">التاريخ: {evalItem.date}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  {evalItem.tasmeeDetails.completedNewPortion === 'كامل' ? 'أتم الحفظ كاملاً 🌟' : evalItem.tasmeeDetails.completedNewPortion}
                </span>
              </div>

              {evalItem.tasmeeDetails.memorizedExactVersesNotes && (
                <p className="text-slate-300 text-[11px]">
                  {evalItem.tasmeeDetails.memorizedExactVersesNotes}
                </p>
              )}

              {evalItem.aiFeedback && (
                <p className="text-slate-400 text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  {evalItem.aiFeedback.analysis}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
