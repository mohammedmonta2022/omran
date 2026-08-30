import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  Brain,
  Sliders,
  Plus,
  Trash2,
  X,
  RotateCcw,
  Volume2,
  Compass,
  ArrowRight,
  TrendingUp,
  BookmarkCheck,
  FileText,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Student,
  AttendanceRecord,
  EvaluationCriterion,
  StudentEvaluation,
  TasmeeDetails,
  AIEvaluationFeedback,
  AppSettings,
} from '../types';
import { QURAN_SURAHS, getSurahById } from '../data/quranData';

interface EvaluationViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  criteria: EvaluationCriterion[];
  onUpdateCriteria: (criteria: EvaluationCriterion[]) => void;
  evaluations: StudentEvaluation[];
  onSaveEvaluation: (evaluation: StudentEvaluation, updatedStudentPlan?: Student['aiPlan']) => void;
  settings: AppSettings;
  preSelectedStudentId?: string | null;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  students,
  attendance,
  criteria,
  onUpdateCriteria,
  evaluations,
  onSaveEvaluation,
  settings,
  preSelectedStudentId,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preSelectedStudentId || (students[0]?.id ?? '')
  );

  // Criteria Management Modal
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [editingCriteriaList, setEditingCriteriaList] = useState<EvaluationCriterion[]>(criteria);
  const [newCriterionTitle, setNewCriterionTitle] = useState('');
  const [newCriterionType, setNewCriterionType] = useState<EvaluationCriterion['type']>('numeric');
  const [newCriterionMaxScore, setNewCriterionMaxScore] = useState(10);
  const [newCriterionOptions, setNewCriterionOptions] = useState('ممتاز 🌟, جيد جداً 👍, جيد, يحتاج تثبيت ⚠️');

  // Evaluation Form State
  const [completedNewPortion, setCompletedNewPortion] = useState<TasmeeDetails['completedNewPortion']>('كامل');
  const [memorizedExactVersesNotes, setMemorizedExactVersesNotes] = useState('');
  const [completedRevisionPortion, setCompletedRevisionPortion] = useState<TasmeeDetails['completedRevisionPortion']>('كامل');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [scores, setScores] = useState<Record<string, number | string>>({});

  // AI Evaluation State
  const [isEvaluatingWithAI, setIsEvaluatingWithAI] = useState(false);
  const [aiFeedbackResult, setAiFeedbackResult] = useState<AIEvaluationFeedback | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'evaluate' | 'history'>('evaluate');

  // Active student object
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Check today's attendance for selected student
  const todayAttendance = attendance.find(
    (a) => a.date === todayStr && a.studentId === selectedStudentId
  );
  const isPresent = todayAttendance?.status === 'present' || todayAttendance?.status === 'late';
  const isAbsent = todayAttendance?.status === 'absent';
  const isExcused = todayAttendance?.status === 'excused';

  // Check if student was already evaluated today
  const todayEvaluation = evaluations.find(
    (e) => e.date === todayStr && e.studentId === selectedStudentId
  );

  // Populate or reset form when student changes
  React.useEffect(() => {
    if (todayEvaluation) {
      setScores(todayEvaluation.scores || {});
      setCompletedNewPortion(todayEvaluation.tasmeeDetails?.completedNewPortion || 'كامل');
      setMemorizedExactVersesNotes(todayEvaluation.tasmeeDetails?.memorizedExactVersesNotes || '');
      setCompletedRevisionPortion(todayEvaluation.tasmeeDetails?.completedRevisionPortion || 'كامل');
      setRevisionNotes(todayEvaluation.tasmeeDetails?.revisionNotes || '');
      setTeacherNote(todayEvaluation.tasmeeDetails?.teacherNote || '');
      setAiFeedbackResult(todayEvaluation.aiFeedback || null);
    } else {
      // Default initial scores
      const initialScores: Record<string, number | string> = {};
      criteria.forEach((c) => {
        if (c.type === 'numeric') initialScores[c.id] = c.maxScore || 10;
        if (c.type === 'stars') initialScores[c.id] = 5;
        if (c.type === 'options' && c.options?.length) initialScores[c.id] = c.options[0];
        if (c.type === 'text') initialScores[c.id] = '';
      });
      setScores(initialScores);
      setCompletedNewPortion('كامل');
      setMemorizedExactVersesNotes('');
      setCompletedRevisionPortion('كامل');
      setRevisionNotes('');
      setTeacherNote('');
      setAiFeedbackResult(null);
    }
  }, [selectedStudentId, todayEvaluation, criteria]);

  // Handle Score Input changes
  const handleScoreChange = (criterionId: string, value: number | string) => {
    setScores((prev) => ({ ...prev, [criterionId]: value }));
  };

  // Trigger AI Evaluation & Adaptive Plan
  const handleAIEvaluateAndSave = async () => {
    if (!selectedStudent) return;
    setIsEvaluatingWithAI(true);

    try {
      const tasmeeDetails: TasmeeDetails = {
        completedNewPortion,
        memorizedExactVersesNotes: memorizedExactVersesNotes.trim(),
        completedRevisionPortion,
        revisionNotes: revisionNotes.trim(),
        teacherNote: teacherNote.trim(),
      };

      const res = await fetch('/api/gemini/evaluate-and-adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: selectedStudent,
          previousPlan: selectedStudent.aiPlan,
          todayScores: scores,
          tasmeeDetails,
        }),
      });

      const data = await res.json();
      const feedback: AIEvaluationFeedback = data.feedback;
      setAiFeedbackResult(feedback);

      // Create new or updated evaluation
      const newEvaluation: StudentEvaluation = {
        id: todayEvaluation?.id || `eval-${todayStr}-${selectedStudent.id}`,
        date: todayStr,
        studentId: selectedStudent.id,
        attendanceStatus: todayAttendance?.status || 'present',
        scores,
        tasmeeDetails,
        aiFeedback: feedback,
        createdAt: new Date().toISOString(),
      };

      // Create updated plan for tomorrow
      const updatedPlan: Student['aiPlan'] = {
        currentGoal: selectedStudent.aiPlan?.currentGoal || 'مواصلة الحفظ المتقن',
        todayAssignedSurah: feedback.nextDayPlan.surahName,
        todayAssignedSurahId: feedback.nextDayPlan.surahId,
        todayAssignedFromAyah: feedback.nextDayPlan.fromAyah,
        todayAssignedToAyah: feedback.nextDayPlan.toAyah,
        todayAssignedRevision: feedback.nextDayPlan.revisionPortion,
        recommendedSheikh: feedback.recommendedSheikh,
        difficultyRating: feedback.statusAssessment === 'متأخر ويحتاج تثبيت وتخفيف' ? 'سهل' : 'متوسط',
        memorizationStrategy: feedback.pedagogicalAdvice,
        tajweedFocus: feedback.mutashabihatTip || 'ضبط أواخر الآيات والوقف الصحيح',
        lastCalculatedDate: todayStr,
        planHistoryNote: `تم تكييف الخطة تلقائياً: ${feedback.statusAssessment}`,
      };

      onSaveEvaluation(newEvaluation, updatedPlan);

      // Celebrate with confetti if student is doing great!
      if (feedback.statusAssessment === 'متقدم وسريع الإتقان' || completedNewPortion === 'كامل') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#F59E0B', '#34D399', '#FBBF24'],
        });
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err) {
      console.error('Error evaluating with AI:', err);
    } finally {
      setIsEvaluatingWithAI(false);
    }
  };

  // Criteria Modal Actions
  const handleAddCriterion = () => {
    if (!newCriterionTitle.trim()) return;

    const newCrit: EvaluationCriterion = {
      id: `crit-${Date.now()}`,
      title: newCriterionTitle.trim(),
      type: newCriterionType,
      maxScore: newCriterionType === 'numeric' ? newCriterionMaxScore : undefined,
      options:
        newCriterionType === 'options'
          ? newCriterionOptions.split(',').map((o) => o.trim()).filter(Boolean)
          : undefined,
    };

    const updated = [...editingCriteriaList, newCrit];
    setEditingCriteriaList(updated);
    setNewCriterionTitle('');
  };

  const handleDeleteCriterion = (id: string) => {
    setEditingCriteriaList(editingCriteriaList.filter((c) => c.id !== id));
  };

  const handleSaveCriteria = () => {
    onUpdateCriteria(editingCriteriaList);
    setIsCriteriaModalOpen(false);
  };

  // Student historical evaluations
  const studentHistory = evaluations.filter((e) => e.studentId === selectedStudentId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner: Evaluation Hub & Active Criteria Display */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black font-kufi text-slate-100">
                منظومة التقييم والتسميع اليومي الذكي
              </h1>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold text-xs">
                {criteria.length} معايير تقييم نشطة
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              تقييم الطلاب الحاضرين وتكييف خطط الحفظ اليومية تلقائياً بواسطة الذكاء الاصطناعي
            </p>
          </div>

          <button
            onClick={() => {
              setEditingCriteriaList(criteria);
              setIsCriteriaModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>إدارة وتعديل معايير التقييم</span>
          </button>
        </div>

        {/* Active Criteria Chips Preview */}
        <div className="pt-3 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 block mb-2">
            ما يُقيَّم عليه الطالب حالياً في الحلقة:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {criteria.map((crit) => (
              <span
                key={crit.id}
                className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{crit.title}</span>
                {crit.type === 'numeric' && (
                  <span className="text-[10px] text-amber-400 font-bold">(/ {crit.maxScore})</span>
                )}
                {crit.type === 'stars' && (
                  <span className="text-[10px] text-amber-400 font-bold">(⭐⭐⭐⭐⭐)</span>
                )}
                {crit.type === 'options' && (
                  <span className="text-[10px] text-teal-400 font-bold">(خيارات)</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Student Selector Sidebar + Active Evaluation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (4/12): Student Picker Cards */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 px-1">اختر الطالب للتسميع والتقييم:</h2>
          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {students.map((student) => {
              const att = attendance.find((a) => a.date === todayStr && a.studentId === student.id);
              const isStdPresent = att?.status === 'present' || att?.status === 'late';
              const isStdAbsent = att?.status === 'absent';
              const isStdExcused = att?.status === 'excused';
              const isEvaluated = evaluations.some((e) => e.date === todayStr && e.studentId === student.id);
              const isSelected = selectedStudentId === student.id;

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/70 border-emerald-500 shadow-lg shadow-emerald-950/60'
                      : isStdAbsent || isStdExcused
                      ? 'bg-slate-900/30 border-slate-800/40 opacity-50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : isStdPresent
                            ? 'bg-slate-800 text-slate-200'
                            : 'bg-slate-950 text-slate-500'
                        }`}
                      >
                        {student.name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
                          {student.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          سورة {student.aiPlan?.todayAssignedSurah || 'المقررة'} (آية{' '}
                          {student.aiPlan?.todayAssignedFromAyah || 1} - {student.aiPlan?.todayAssignedToAyah || 10})
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* Attendance badge */}
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          att?.status === 'present'
                            ? 'bg-emerald-900 text-emerald-300'
                            : att?.status === 'late'
                            ? 'bg-amber-900 text-amber-300'
                            : att?.status === 'excused'
                            ? 'bg-blue-900 text-blue-300'
                            : 'bg-rose-900 text-rose-300'
                        }`}
                      >
                        {att?.status === 'present'
                          ? 'حاضر'
                          : att?.status === 'late'
                          ? 'متأخر'
                          : att?.status === 'excused'
                          ? 'معتذر'
                          : 'غائب'}
                      </span>

                      {/* Evaluated badge */}
                      {isEvaluated && (
                        <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تم التقييم</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (8/12): Selected Student Evaluation & AI Feedback Workspace */}
        <div className="lg:col-span-8 space-y-5">
          {selectedStudent ? (
            <>
              {/* Header of Active Student */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-base shadow-md">
                    {selectedStudent.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">{selectedStudent.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                        مستوى {selectedStudent.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      العمر: {selectedStudent.age} سنة • ولي الأمر: {selectedStudent.parentName}
                    </p>
                  </div>
                </div>

                {/* Sub Tab: Evaluate Now vs History */}
                <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setActiveSubTab('evaluate')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeSubTab === 'evaluate'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    تسميع اليوم والتقييم
                  </button>
                  <button
                    onClick={() => setActiveSubTab('history')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeSubTab === 'history'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    سجل التسميعات السابقة ({studentHistory.length})
                  </button>
                </div>
              </div>

              {/* Warning if Absent or Excused */}
              {(isAbsent || isExcused) && (
                <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-3xl flex items-center gap-3 text-rose-300 text-xs sm:text-sm font-semibold">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-400" />
                  <div>
                    <p className="font-bold">
                      الطالب {isAbsent ? 'غائب اليوم' : 'معتذر عن الحضور اليوم'}
                    </p>
                    <p className="text-xs text-rose-300/80 font-normal mt-0.5">
                      لا يمكن إجراء جلسة التسميع للطالب لعدم حضوره في الحلقة اليوم. يمكنك تعديل حالته في كشف الحضور إذا حضر.
                    </p>
                  </div>
                </div>
              )}

              {/* Success Toast */}
              {showSuccessToast && (
                <div className="p-4 bg-emerald-900/90 border border-emerald-500 text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 shadow-xl animate-bounce">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>
                    تم حفظ التقييم بنجاح وتكييف خطة الغد وتجهيز رسالة الواتساب لولي الأمر!
                  </span>
                </div>
              )}

              {activeSubTab === 'evaluate' ? (
                <div className="space-y-5">
                  {/* Today's Prescribed Plan Card */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <BookmarkCheck className="w-4 h-4" />
                        <span>ما كان مقرراً على الطالب اليوم:</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        الخطة الحالية: {selectedStudent.aiPlan?.difficultyRating || 'متوسط'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-950/80 rounded-2xl border border-emerald-900/40">
                        <span className="text-slate-400 block mb-1">المقرر الجديد:</span>
                        <strong className="text-emerald-300 text-sm font-black">
                          سورة {selectedStudent.aiPlan?.todayAssignedSurah} (الآيات{' '}
                          {selectedStudent.aiPlan?.todayAssignedFromAyah} -{' '}
                          {selectedStudent.aiPlan?.todayAssignedToAyah})
                        </strong>
                      </div>
                      <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-900/40">
                        <span className="text-slate-400 block mb-1">المراجعة المقررة:</span>
                        <strong className="text-amber-300 text-sm font-black">
                          {selectedStudent.aiPlan?.todayAssignedRevision}
                        </strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>القارئ: {selectedStudent.aiPlan?.recommendedSheikh}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        <span>التركيز: {selectedStudent.aiPlan?.tajweedFocus}</span>
                      </span>
                    </div>
                  </div>

                  {/* Tasmee' Inputs Form */}
                  <div
                    className={`space-y-4 bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-3xl ${
                      isAbsent || isExcused ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <h3 className="text-sm font-bold font-kufi text-slate-100 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>تفاصيل جلسة التسميع والدرجات</span>
                    </h3>

                    {/* New Memorization Outcome */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">
                        ما تم إنجازه من الحفظ الجديد اليوم:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['كامل', 'نصف', 'جزئي', 'لم يسمع'] as const).map((portion) => (
                          <button
                            key={portion}
                            type="button"
                            onClick={() => setCompletedNewPortion(portion)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              completedNewPortion === portion
                                ? 'bg-emerald-700 border-emerald-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {portion === 'كامل'
                              ? 'أتم الحفظ كاملاً ✨'
                              : portion === 'نصف'
                              ? 'حفظ النصف'
                              : portion === 'جزئي'
                              ? 'حفظ جزئي متعثر'
                              : 'لم يحفظ'}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="تحديد الآيات التي سردها بدقة إن كان هناك اختلاف (اختياري)..."
                        value={memorizedExactVersesNotes}
                        onChange={(e) => setMemorizedExactVersesNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Revision Outcome */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">
                        ما تم إنجازه من ورد المراجعة:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['كامل', 'نصف', 'لم يراجع'] as const).map((rev) => (
                          <button
                            key={rev}
                            type="button"
                            onClick={() => setCompletedRevisionPortion(rev)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              completedRevisionPortion === rev
                                ? 'bg-teal-700 border-teal-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {rev === 'كامل' ? 'راجع كاملاً 👍' : rev === 'نصف' ? 'راجع نصف الورد' : 'لم يراجع'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Criteria Inputs */}
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <h4 className="text-xs font-bold text-amber-300">درجات معايير التقييم:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {criteria.map((crit) => {
                          const currentVal = scores[crit.id];

                          return (
                            <div key={crit.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-200">{crit.title}</span>
                                {crit.type === 'numeric' && (
                                  <span className="text-emerald-400 font-bold">
                                    {currentVal || 0} / {crit.maxScore}
                                  </span>
                                )}
                              </div>

                              {/* Numeric Input */}
                              {crit.type === 'numeric' && (
                                <input
                                  type="range"
                                  min={0}
                                  max={crit.maxScore || 10}
                                  step={0.5}
                                  value={Number(currentVal || 0)}
                                  onChange={(e) => handleScoreChange(crit.id, Number(e.target.value))}
                                  className="w-full accent-emerald-500 cursor-pointer"
                                />
                              )}

                              {/* Star Rating Input */}
                              {crit.type === 'stars' && (
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((starNum) => (
                                    <button
                                      key={starNum}
                                      type="button"
                                      onClick={() => handleScoreChange(crit.id, starNum)}
                                      className="p-1 text-slate-600 hover:text-amber-400 transition-colors cursor-pointer"
                                    >
                                      <Star
                                        className={`w-5 h-5 ${
                                          Number(currentVal || 0) >= starNum
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-600'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Options Select */}
                              {crit.type === 'options' && (
                                <select
                                  value={String(currentVal || '')}
                                  onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                >
                                  {crit.options?.map((opt, i) => (
                                    <option key={i} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {/* Text Input */}
                              {crit.type === 'text' && (
                                <input
                                  type="text"
                                  placeholder="ملاحظة نوعية..."
                                  value={String(currentVal || '')}
                                  onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Teacher Additional Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        ملاحظة المعلم الإضافية أو عذر الطالب:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="أدخل أي ملحوظة خاصة حول استيعاب الطالب اليوم..."
                        value={teacherNote}
                        onChange={(e) => setTeacherNote(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* AI Evaluate & Save Button */}
                    <button
                      type="button"
                      disabled={isEvaluatingWithAI}
                      onClick={handleAIEvaluateAndSave}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Brain className="w-5 h-5 text-amber-300 animate-pulse" />
                      <span>
                        {isEvaluatingWithAI
                          ? 'جارٍ تحليل التسميع بالذكاء الاصطناعي وتكييف خطة الغد...'
                          : 'تحليل الأداء وتكييف خطة الغد بالذكاء الاصطناعي 🤖'}
                      </span>
                    </button>
                  </div>

                  {/* AI Feedback Display Box */}
                  {aiFeedbackResult && (
                    <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-700/60 shadow-2xl space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-400" />
                          <h3 className="text-sm font-bold font-kufi text-slate-100">
                            تقرير التحليل الذكي وتكييف الخطة (AI)
                          </h3>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold border ${
                            aiFeedbackResult.statusAssessment === 'متقدم وسريع الإتقان'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                              : aiFeedbackResult.statusAssessment === 'على المسار المطلوب'
                              ? 'bg-blue-950 text-blue-300 border-blue-600'
                              : 'bg-amber-950 text-amber-300 border-amber-600'
                          }`}
                        >
                          {aiFeedbackResult.statusAssessment}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                        {aiFeedbackResult.analysis}
                      </p>

                      {/* Tomorrow's Adapted Plan */}
                      <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/60 space-y-2">
                        <span className="text-xs font-bold text-amber-300 block">
                          🎯 خطة الغد المقترحة والمحدثة للطالب:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 bg-slate-950 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">مقرر الحفظ الجديد:</span>
                            <strong className="text-emerald-300 font-bold">
                              سورة {aiFeedbackResult.nextDayPlan.surahName} (آية{' '}
                              {aiFeedbackResult.nextDayPlan.fromAyah} إلى{' '}
                              {aiFeedbackResult.nextDayPlan.toAyah})
                            </strong>
                          </div>
                          <div className="p-2.5 bg-slate-950 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">ورد المراجعة:</span>
                            <strong className="text-teal-300 font-bold">
                              {aiFeedbackResult.nextDayPlan.revisionPortion}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Pedagogical & Sheikh Advice */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block font-bold mb-1">التوجيه التربوي:</span>
                          <p className="text-slate-300">{aiFeedbackResult.pedagogicalAdvice}</p>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block font-bold mb-1">القارئ الموصى به:</span>
                          <p className="text-amber-300">{aiFeedbackResult.recommendedSheikh}</p>
                        </div>
                      </div>

                      {aiFeedbackResult.mutashabihatTip && (
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                          <span className="text-slate-400 block font-bold mb-1">تنبيه المتشابهات وضبط الآيات:</span>
                          <p className="text-teal-300">{aiFeedbackResult.mutashabihatTip}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* History Sub Tab */
                <div className="space-y-3">
                  {studentHistory.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                      لا يوجد تقييمات سابقة مسجلة لهذا الطالب بعد.
                    </div>
                  ) : (
                    studentHistory.map((hist) => (
                      <div
                        key={hist.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">تاريخ التسميع: {hist.date}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                            {hist.aiFeedback?.statusAssessment || 'تم التقييم'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl text-slate-300">
                          <span className="text-slate-400 block text-[10px]">إنجاز الحفظ:</span>
                          {hist.tasmeeDetails.completedNewPortion === 'كامل' ? 'أتم الحفظ كاملاً' : hist.tasmeeDetails.completedNewPortion}
                          {hist.tasmeeDetails.memorizedExactVersesNotes && ` (${hist.tasmeeDetails.memorizedExactVersesNotes})`}
                        </div>

                        {hist.aiFeedback && (
                          <div className="p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-900 text-slate-300 text-[11px]">
                            <strong className="text-amber-300 block mb-0.5">تحليل الذكاء الاصطناعي:</strong>
                            {hist.aiFeedback.analysis}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-sm">
              اختر طالباً من القائمة للبدء في تسميع ورده وتقييمه
            </div>
          )}
        </div>
      </div>

      {/* Criteria Management Modal */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-kufi text-slate-100">
                    تخصيص وإدارة معايير التقييم
                  </h2>
                  <p className="text-xs text-slate-400">
                    أضف معايير مخصصة (نجوم، درجات عظمى كـ 7 أو 9 أو 10، خيارات متعددة، أو نصوص)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCriteriaModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of current criteria */}
            <div className="mt-5 space-y-3 max-h-60 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-slate-300 block">المعايير الحالية:</span>
              {editingCriteriaList.map((crit, idx) => (
                <div
                  key={crit.id}
                  className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <div>
                      <strong className="text-slate-200 block">{crit.title}</strong>
                      <span className="text-[10px] text-slate-500">
                        النوع: {crit.type === 'numeric' ? `رقمي (درجة عظمى: ${crit.maxScore})` : crit.type === 'stars' ? 'نجوم (5)' : crit.type === 'options' ? 'خيارات' : 'نصي'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCriterion(crit.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Criterion Box */}
            <div className="mt-5 p-4 bg-slate-950 rounded-2xl border border-emerald-900/40 space-y-3">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>إضافة معيار تقييم جديد</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">اسم المعيار *</label>
                  <input
                    type="text"
                    placeholder="مثال: ضبط الوقف والابتداء"
                    value={newCriterionTitle}
                    onChange={(e) => setNewCriterionTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">نوع المعيار</label>
                  <select
                    value={newCriterionType}
                    onChange={(e) => setNewCriterionType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="numeric">درجة رقمية (سلايدر)</option>
                    <option value="stars">نجوم (من 5)</option>
                    <option value="options">خيارات مخصصة</option>
                    <option value="text">ملاحظة نصية</option>
                  </select>
                </div>
              </div>

              {newCriterionType === 'numeric' && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1">الدرجة العظمى (مثال: 7, 9, 10, 20, 100)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newCriterionMaxScore}
                    onChange={(e) => setNewCriterionMaxScore(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              )}

              {newCriterionType === 'options' && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1">الخيارات (مفصولة بفواصل)</label>
                  <input
                    type="text"
                    value={newCriterionOptions}
                    onChange={(e) => setNewCriterionOptions(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAddCriterion}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدراج في قائمة المعايير</span>
              </button>
            </div>

            {/* Footer */}
            <div className="pt-4 mt-5 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCriteriaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveCriteria}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950"
              >
                حفظ واعتماد المعايير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
