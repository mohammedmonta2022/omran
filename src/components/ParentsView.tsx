import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Edit3,
  ExternalLink,
  Users,
  Search,
  Check,
  Clock,
  HelpCircle,
  XCircle,
  Bot,
} from 'lucide-react';
import { Student, AttendanceRecord, StudentEvaluation, AppSettings } from '../types';

interface ParentsViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  evaluations: StudentEvaluation[];
  settings: AppSettings;
}

export const ParentsView: React.FC<ParentsViewProps> = ({
  students,
  attendance,
  evaluations,
  settings,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [messagesMap, setMessagesMap] = useState<Record<string, string>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [selectedStudentForEditMsg, setSelectedStudentForEditMsg] = useState<Student | null>(null);
  const [editedText, setEditedText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate parent link for a student
  const getParentPortalUrl = (studentId: string) => {
    return `${window.location.origin}/?portal=student&id=${studentId}`;
  };

  // Helper to construct fallback or pre-fill message
  const getDefaultMessageForStudent = (student: Student) => {
    const att = attendance.find((a) => a.date === todayStr && a.studentId === student.id);
    const evalData = evaluations.find((e) => e.date === todayStr && e.studentId === student.id);

    let statusText = 'حاضر ومشارك في الحلقة المباركة 🌿';
    if (att?.status === 'absent') statusText = 'غائب اليوم عن الحلقة ⚠️';
    if (att?.status === 'late') statusText = 'حاضر (وصل متأخراً) ⏰';
    if (att?.status === 'excused') statusText = 'معتذر عن الحضور لظرف عائلي 🕊️';

    const portalUrl = getParentPortalUrl(student.id);

    let evalSummary = '';
    if (evalData) {
      evalSummary = `\n✨ إنجاز التسميع اليوم: ${
        evalData.tasmeeDetails.completedNewPortion === 'كامل'
          ? 'أتم سرد المقرَّر كاملاً بإتقان ممتاز 🌟'
          : evalData.tasmeeDetails.completedNewPortion === 'نصف'
          ? 'أتم سرد نصف المقرَّر'
          : 'حفظ جزئي يحتاج تثبيت'
      }`;
    }

    const planSummary = student.aiPlan
      ? `\n🎯 الواجب والمطلوب لحفظ الغد:\n- الحفظ الجديد: سورة ${student.aiPlan.todayAssignedSurah} (الآيات ${student.aiPlan.todayAssignedFromAyah} - ${student.aiPlan.todayAssignedToAyah})\n- ورد المراجعة: ${student.aiPlan.todayAssignedRevision}\n- القارئ الموصى بالاستماع له: ${student.aiPlan.recommendedSheikh}`
      : '';

    return `السلام عليكم ورحمة الله وبركاته،
ولي أمر الابن الفاضل / ${student.name} 🌿
تحية طيبة ومباركة من مقرأة "${settings.halagahName}" 📖

📍 حالة الحضور اليوم: ${statusText}${evalSummary}${planSummary}

🔗 للاطلاع على سجل وتقرير إنجاز الابن القرآني المباشر:
${portalUrl}

شاكرين ومقدّرين حسن تعاونكم وحرصكم المستمر،
معلم الحلقة: ${settings.teacherName}`;
  };

  // Initialize messages if not set
  React.useEffect(() => {
    const initialMap: Record<string, string> = { ...messagesMap };
    students.forEach((s) => {
      if (!initialMap[s.id]) {
        initialMap[s.id] = getDefaultMessageForStudent(s);
      }
    });
    setMessagesMap(initialMap);
  }, [students, attendance, evaluations]);

  // Generate All Messages with Gemini AI
  const handleGenerateAllWithAI = async () => {
    setIsGeneratingAll(true);
    const updatedMap: Record<string, string> = { ...messagesMap };

    try {
      for (const student of students) {
        const att = attendance.find((a) => a.date === todayStr && a.studentId === student.id);
        const evalData = evaluations.find((e) => e.date === todayStr && e.studentId === student.id);

        try {
          const res = await fetch('/api/gemini/parent-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student,
              attendanceStatus: att?.status || 'present',
              evaluation: evalData,
              tomorrowPlan: evalData?.aiFeedback?.nextDayPlan || (student.aiPlan ? {
                surahName: student.aiPlan.todayAssignedSurah,
                fromAyah: student.aiPlan.todayAssignedFromAyah,
                toAyah: student.aiPlan.todayAssignedToAyah,
                revisionPortion: student.aiPlan.todayAssignedRevision,
              } : null),
              teacherName: settings.teacherName,
              halagahName: settings.halagahName,
              parentPortalUrl: getParentPortalUrl(student.id),
            }),
          });
          const data = await res.json();
          if (data.message) {
            updatedMap[student.id] = data.message;
          }
        } catch (e) {
          console.error('Error generating for student:', student.name, e);
        }
      }
      setMessagesMap(updatedMap);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudentForEditMsg(student);
    setEditedText(messagesMap[student.id] || getDefaultMessageForStudent(student));
  };

  const handleSaveEditedMsg = () => {
    if (selectedStudentForEditMsg) {
      setMessagesMap({ ...messagesMap, [selectedStudentForEditMsg.id]: editedText });
      setSelectedStudentForEditMsg(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendWhatsApp = (phone: string, text: string) => {
    // Clean phone number (keep digits)
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Bulk AI Generator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black font-kufi text-slate-100">
              مركز رسائل أولياء الأمور عبر الواتساب
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold text-xs">
              {students.length} ولي أمر
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إرسال التقارير اليومية، وتفاصيل التسميع، وواجبات الغد بنقرة واحدة عبر الواتساب
          </p>
        </div>

        <button
          onClick={handleGenerateAllWithAI}
          disabled={isGeneratingAll}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950 flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <Bot className="w-4 h-4 text-amber-300 animate-spin-slow" />
          <span>
            {isGeneratingAll
              ? 'جارٍ صياغة جميع الرسائل بالذكاء الاصطناعي...'
              : 'توليد وتخصيص جميع رسائل اليوم بالذكاء الاصطناعي 🤖'}
          </span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
        <input
          type="text"
          placeholder="بحث باسم الطالب أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Students Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredStudents.map((student) => {
          const att = attendance.find((a) => a.date === todayStr && a.studentId === student.id);
          const evaluation = evaluations.find((e) => e.date === todayStr && e.studentId === student.id);
          const messageText = messagesMap[student.id] || getDefaultMessageForStudent(student);

          // Get preferred target phone
          const targetPhone = student.parentPhones?.[0]?.phone || student.phone;

          return (
            <div
              key={student.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-700/60 transition-all"
            >
              {/* Header: Student name, Status & Parent Phone */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {student.name.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{student.name}</h3>
                      <p className="text-xs text-slate-400">ولي الأمر: {student.parentName || 'الأب'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {/* Attendance Badge */}
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        att?.status === 'present'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : att?.status === 'late'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                          : att?.status === 'excused'
                          ? 'bg-blue-950 text-blue-300 border border-blue-700/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                      }`}
                    >
                      {att?.status === 'present'
                        ? 'حاضر اليوم'
                        : att?.status === 'late'
                        ? 'متأخر'
                        : att?.status === 'excused'
                        ? 'معتذر'
                        : 'غائب اليوم'}
                    </span>

                    {evaluation ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>تم تقييم التسميع</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">
                        لم يُسجل التسميع بعد
                      </span>
                    )}
                  </div>
                </div>

                {/* Parent Phone options */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">رقم الإرسال:</span>
                  {student.parentPhones?.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-950 rounded-lg border border-slate-800 text-emerald-300 text-[11px] font-mono"
                    >
                      {p.label}: {p.phone}
                    </span>
                  ))}
                </div>

                {/* Message Text Preview Box */}
                <div className="relative p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/90 text-xs text-slate-300 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {messageText}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(student)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>تعديل الصياغة</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(messageText, student.id)}
                    title="نسخ نص الرسالة"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {copiedId === student.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(targetPhone, messageText)}
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/80 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>إرسال عبر الواتساب</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Message Modal */}
      {selectedStudentForEditMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right my-8">
            <h2 className="text-base font-bold font-kufi text-slate-100 mb-2">
              تعديل رسالة ولي أمر الطالب / {selectedStudentForEditMsg.name}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              يمكنك تخصيص الرسالة وإضافة أي توجيه أو تنبيه قبل الإرسال
            </p>

            <textarea
              rows={12}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500 font-sans"
            />

            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStudentForEditMsg(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveEditedMsg}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                حفظ الرسالة المعدلة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
