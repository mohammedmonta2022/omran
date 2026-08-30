import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Share2,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Compass,
  Volume2,
  Users,
  Settings,
} from 'lucide-react';
import { Student, AttendanceRecord, StudentEvaluation, AppSettings } from '../types';

interface ReportsViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  evaluations: StudentEvaluation[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  attendance,
  evaluations,
  settings,
  onUpdateSettings,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [isGeneratingAIReport, setIsGeneratingAIReport] = useState(false);
  const [aiReportData, setAiReportData] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isWorkdaysModalOpen, setIsWorkdaysModalOpen] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Student specific data
  const studentAttendance = attendance.filter((a) => a.studentId === selectedStudentId);
  const studentEvaluations = evaluations.filter((e) => e.studentId === selectedStudentId);

  const presentCount = studentAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const totalDaysRecorded = Math.max(studentAttendance.length, 1);
  const attendancePercentage = Math.round((presentCount / totalDaysRecorded) * 100);

  const getPortalUrl = () => {
    return `${window.location.origin}/?portal=student&id=${selectedStudentId}`;
  };

  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(getPortalUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleGenerateReportAI = async () => {
    if (!selectedStudent) return;
    setIsGeneratingAIReport(true);

    try {
      const res = await fetch('/api/gemini/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: selectedStudent,
          period,
          attendanceRecords: studentAttendance,
          evaluationsList: studentEvaluations,
          halagahSettings: settings,
          parentPortalUrl: getPortalUrl(),
        }),
      });

      const data = await res.json();
      if (data.report) {
        setAiReportData(data.report);
      }
    } catch (e) {
      console.error('Error generating AI report:', e);
    } finally {
      setIsGeneratingAIReport(false);
    }
  };

  const handleSendReportWhatsApp = () => {
    if (!selectedStudent) return;
    const phone = selectedStudent.parentPhones?.[0]?.phone || selectedStudent.phone;
    const clean = phone.replace(/[^0-9]/g, '');

    const shareText = aiReportData?.whatsappShareText || `📊 التقرير ${period === 'weekly' ? 'الأسبوعي' : 'الشهري'} الشامل للطالب: ${selectedStudent.name}\nحلقة: ${settings.halagahName}\n\n✨ ندعوكم للاطلاع على التقرير القرآني التفاعلي المفصل وشهادة الإنجاز عبر الرابط:\n🔗 ${getPortalUrl()}`;

    const url = `https://wa.me/${clean}?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const DAYS_LIST = [
    { id: 'Sunday', label: 'الأحد' },
    { id: 'Monday', label: 'الإثنين' },
    { id: 'Tuesday', label: 'الثلاثاء' },
    { id: 'Wednesday', label: 'الأربعاء' },
    { id: 'Thursday', label: 'الخميس' },
    { id: 'Friday', label: 'الجمعة' },
    { id: 'Saturday', label: 'السبت' },
  ];

  const handleToggleDay = (dayId: string) => {
    const current = settings.weeklyWorkDays || [];
    const updated = current.includes(dayId)
      ? current.filter((d) => d !== dayId)
      : [...current, dayId];
    onUpdateSettings({ weeklyWorkDays: updated });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Report Configuration */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black font-kufi text-slate-100">
              التقارير التحليلية والروابط الخاصة
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold text-xs">
              {period === 'weekly' ? 'تقرير أسبوعي' : 'تقرير شهري'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إعداد تقارير أداء شاملة مع رابط مخصص تفاعلي يُرسل لأولياء الأمور
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Workdays Config Button */}
          <button
            onClick={() => setIsWorkdaysModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>أيام الدوام ({settings.weeklyWorkDays?.length || 5} أيام)</span>
          </button>

          {/* Period Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setPeriod('weekly');
                setAiReportData(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === 'weekly' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              أسبوعي
            </button>
            <button
              onClick={() => {
                setPeriod('monthly');
                setAiReportData(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === 'monthly' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              شهري
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="طباعة التقرير أو حفظ كـ PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Student Picker Bar */}
      <div className="flex items-center gap-3 overflow-x-auto p-2 bg-slate-900/60 rounded-2xl border border-slate-800 no-scrollbar">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap px-2">الطالب:</span>
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => {
              setSelectedStudentId(student.id);
              setAiReportData(null);
            }}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStudentId === student.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {student.name}
          </button>
        ))}
      </div>

      {/* Main Report Card */}
      {selectedStudent && (
        <div className="space-y-6">
          {/* Shareable Link Banner */}
          <div className="p-4 bg-slate-900/90 border border-emerald-800/50 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 flex items-center justify-center text-emerald-300">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">الرابط الخاص المباشر لولي أمر الطالب</h4>
                <p className="text-[11px] text-slate-400 font-mono break-all">{getPortalUrl()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyPortalLink}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
              </button>

              <button
                onClick={handleSendReportWhatsApp}
                className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>إرسال التقرير بالواتساب</span>
              </button>
            </div>
          </div>

          {/* Report Paper Container */}
          <div className="relative p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8 overflow-hidden">
            {/* Islamic decorative top banner */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-500" />

            {/* Title Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  {settings.halagahName}
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-kufi text-slate-100">
                  تقرير الإنجاز القرآني {period === 'weekly' ? 'الأسبوعي' : 'الشهري'}
                </h2>
                <p className="text-xs text-slate-400">
                  المشرف التربوي والمقرئ: {settings.teacherName}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 block">اسم الطالب المكرم</span>
                <strong className="text-sm font-bold text-emerald-400">{selectedStudent.name}</strong>
                <p className="text-[11px] text-slate-400">{selectedStudent.age} سنة • مستوى {selectedStudent.level}</p>
              </div>
            </div>

            {/* Performance KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">نسبة الحضور</span>
                <strong className="text-2xl font-black text-emerald-400">{attendancePercentage}%</strong>
                <p className="text-[10px] text-slate-500">{presentCount} أيام حضور</p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">جلسات التسميع المنجزة</span>
                <strong className="text-2xl font-black text-teal-400">{studentEvaluations.length}</strong>
                <p className="text-[10px] text-slate-500">جلسة مسجلة</p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">موضع الحفظ الحالي</span>
                <strong className="text-sm font-black text-amber-300 block mt-1">
                  سورة {selectedStudent.aiPlan?.todayAssignedSurah || 'المقررة'}
                </strong>
                <p className="text-[10px] text-slate-500">آية {selectedStudent.aiPlan?.todayAssignedToAyah || 1}</p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">سعة الورد اليومي</span>
                <strong className="text-xs font-bold text-slate-200 block mt-1">
                  {selectedStudent.dailyNewCapacity}
                </strong>
                <p className="text-[10px] text-slate-500">{selectedStudent.dailyRevisionCapacity}</p>
              </div>
            </div>

            {/* AI Deep Analysis Section */}
            <div className="p-6 bg-slate-950/90 rounded-3xl border border-emerald-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold font-kufi text-slate-100">
                    التحليل التربوي الشامل بالذكاء الاصطناعي (Gemini AI)
                  </h3>
                </div>

                <button
                  onClick={handleGenerateReportAI}
                  disabled={isGeneratingAIReport}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isGeneratingAIReport ? 'جارٍ توليد التقرير...' : 'تحديث التقرير بالذكاء الاصطناعي'}</span>
                </button>
              </div>

              {aiReportData ? (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-200 leading-relaxed bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                    {aiReportData.summaryText}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-800/40 space-y-2">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>أبرز الإنجازات ونقاط التميز:</span>
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {aiReportData.keyAccomplishments?.map((acc: string, idx: number) => (
                          <li key={idx}>{acc}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-800/40 space-y-2">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" />
                        <span>التوصيات ومواضع التطوير:</span>
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {aiReportData.areasForImprovement?.map((imp: string, idx: number) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                    <strong className="text-teal-300 block mb-1">وصية المقرئ المعلم:</strong>
                    <p className="text-slate-300">{aiReportData.sheikhAdvice}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    اضغط على زر "تحديث التقرير بالذكاء الاصطناعي" لتحليل أداء الطالب وصياغة التقرير الشامل
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workdays Settings Modal */}
      {isWorkdaysModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-800/40 rounded-3xl p-6 shadow-2xl text-right">
            <h3 className="text-base font-bold font-kufi text-slate-100 mb-2">
              تحديد أيام الدوام الأسبوعية للحلقة
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              حدد الأيام المعتمدة لحساب نسب الحضور والغياب بدقة
            </p>

            <div className="space-y-2">
              {DAYS_LIST.map((day) => {
                const isSelected = settings.weeklyWorkDays?.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleDay(day.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{day.label}</span>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-slate-600">عطلة</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsWorkdaysModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                حفظ وإغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
