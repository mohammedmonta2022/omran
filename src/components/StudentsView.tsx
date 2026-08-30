import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Phone,
  Sparkles,
  BookOpen,
  Award,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Brain,
  Layers,
  Key,
} from 'lucide-react';
import { Student, AppSettings, ParentContact, StudentLevel } from '../types';
import { QURAN_SURAHS, getSurahById } from '../data/quranData';

interface StudentsViewProps {
  students: Student[];
  onAddStudent: (newStudent: Omit<Student, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  settings,
  onUpdateSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);

  // Form State for Add / Edit Student
  const [name, setName] = useState('');
  const [password, setPassword] = useState('123');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhones, setParentPhones] = useState<ParentContact[]>([
    { label: 'ولي الأمر (واتساب)', phone: '' },
  ]);
  const [age, setAge] = useState(12);
  const [startingSurahId, setStartingSurahId] = useState(2);
  const [startingAyah, setStartingAyah] = useState(1);
  const [dailyNewCapacity, setDailyNewCapacity] = useState('وجه كامل (١٥ آية)');
  const [dailyRevisionCapacity, setDailyRevisionCapacity] = useState('نصف جزء (١٠ أوجه)');
  const [level, setLevel] = useState<StudentLevel>('متوسط');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setPassword('123');
    setPhone('');
    setParentName('');
    setParentPhones([{ label: 'ولي الأمر (واتساب)', phone: '' }]);
    setAge(12);
    setStartingSurahId(2);
    setStartingAyah(1);
    setDailyNewCapacity('وجه كامل (١٥ آية)');
    setDailyRevisionCapacity('نصف جزء (١٠ أوجه)');
    setLevel('متوسط');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setPassword(student.password || '123');
    setPhone(student.phone);
    setParentName(student.parentName);
    setParentPhones(
      student.parentPhones?.length
        ? student.parentPhones
        : [{ label: 'ولي الأمر (واتساب)', phone: student.phone }]
    );
    setAge(student.age);
    setStartingSurahId(student.startingSurahId);
    setStartingAyah(student.startingAyah);
    setDailyNewCapacity(student.dailyNewCapacity);
    setDailyRevisionCapacity(student.dailyRevisionCapacity);
    setLevel(student.level);
    setNotes(student.notes || '');
    setIsAddModalOpen(true);
  };

  const handleAddParentPhone = () => {
    setParentPhones([...parentPhones, { label: 'رقم إضافي (الأم/الأخ)', phone: '' }]);
  };

  const handleRemoveParentPhone = (index: number) => {
    setParentPhones(parentPhones.filter((_, i) => i !== index));
  };

  const handleParentPhoneChange = (index: number, field: 'label' | 'phone', value: string) => {
    const updated = [...parentPhones];
    updated[index] = { ...updated[index], [field]: value };
    setParentPhones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingStudent) {
        // Update existing
        onUpdateStudent({
          ...editingStudent,
          name: name.trim(),
          password,
          phone: phone.trim(),
          parentName: parentName.trim(),
          parentPhones: parentPhones.filter((p) => p.phone.trim()),
          age: Number(age),
          startingSurahId: Number(startingSurahId),
          startingAyah: Number(startingAyah),
          dailyNewCapacity,
          dailyRevisionCapacity,
          level,
          notes,
        });
      } else {
        // Add new
        await onAddStudent({
          name: name.trim(),
          password,
          phone: phone.trim(),
          parentName: parentName.trim(),
          parentPhones: parentPhones.filter((p) => p.phone.trim()),
          age: Number(age),
          startingSurahId: Number(startingSurahId),
          startingAyah: Number(startingAyah),
          currentSurahId: Number(startingSurahId),
          currentAyah: Number(startingAyah),
          dailyNewCapacity,
          dailyRevisionCapacity,
          level,
          notes,
        });
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const selectedSurahInfo = getSurahById(startingSurahId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black font-kufi text-slate-100">سجل الطلاب وإدارة الحسابات</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold text-xs">
              {students.length} طالب مسجل
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل الطلاب الجدد، تحديد نقاط الحفظ، وتوليد الخطط اليومية بالذكاء الاصطناعي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Self-Registration Switch */}
          <button
            onClick={() =>
              onUpdateSettings({ allowStudentRegistration: !settings.allowStudentRegistration })
            }
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              settings.allowStudentRegistration
                ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/80'
                : 'bg-rose-950/70 border-rose-800 text-rose-300 hover:bg-rose-900/80'
            }`}
            title="التحكم في إمكانية تسجيل الطلاب لأنفسهم من صفحة الدخول"
          >
            {settings.allowStudentRegistration ? (
              <>
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>التسجيل الذاتي: مفتوح</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-rose-400" />
                <span>التسجيل الذاتي: مغلق (بيد المعلم فقط)</span>
              </>
            )}
          </button>

          {/* Add Student Button */}
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>إضافة طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Level Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="بحث باسم الطالب، رقم الهاتف، أو اسم ولي الأمر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">المستوى:</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">جميع المستويات</option>
            <option value="قوي">قوي (سريع الحفظ)</option>
            <option value="متوسط">متوسط (منتظم)</option>
            <option value="ضعيف">ضعيف (يحتاج تخفيف)</option>
          </select>
        </div>
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((student) => {
          const startingSurah = getSurahById(student.startingSurahId);
          const currentSurah = getSurahById(student.currentSurahId);

          return (
            <div
              key={student.id}
              className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-700/60 p-5 shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Student Name & Level badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 p-0.5 shadow-md">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-emerald-400 text-base">
                        {student.name.slice(0, 1)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-xs text-slate-400">{student.age} سنة • {student.phone}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                      student.level === 'قوي'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : student.level === 'متوسط'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                        : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                    }`}
                  >
                    مستوى {student.level}
                  </span>
                </div>

                {/* Memorization Starting Point & Capacity */}
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">موضع الحفظ الحالي:</span>
                    <span className="font-bold text-emerald-400">
                      سورة {currentSurah?.name || 'البقرة'} (آية {student.currentAyah})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">مقدار الحفظ اليومي:</span>
                    <span className="font-medium text-slate-200">{student.dailyNewCapacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">مقدار المراجعة:</span>
                    <span className="font-medium text-slate-200">{student.dailyRevisionCapacity}</span>
                  </div>
                </div>

                {/* AI Plan Preview */}
                {student.aiPlan ? (
                  <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-800/40 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>خطة الذكاء الاصطناعي لليوم:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      حفظ سورة {student.aiPlan.todayAssignedSurah} (من آية {student.aiPlan.todayAssignedFromAyah} إلى{' '}
                      {student.aiPlan.todayAssignedToAyah})
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      القارئ الموصى به: {student.aiPlan.recommendedSheikh}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-slate-600" />
                    <span>بانتظار توليد الخطة الذكية الأولى</span>
                  </div>
                )}

                {/* Parent Info & Contacts */}
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>ولي الأمر: <strong className="text-slate-300">{student.parentName || 'غير مسجل'}</strong></span>
                    {student.password && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        <span>كلمة المرور: {student.password}</span>
                      </span>
                    )}
                  </div>
                  {student.parentPhones?.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-emerald-400/80 text-[11px]">
                      <Phone className="w-3 h-3" />
                      <span>{p.label}: {p.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedStudentForDetails(student)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  عرض الخطة كاملة
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(student)}
                    title="تعديل بيانات الطالب"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف حساب الطالب "${student.name}"؟`)) {
                        onDeleteStudent(student.id);
                      }
                    }}
                    title="حذف حساب الطالب"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">لا يوجد طلاب مطابقون للبحث</h3>
          <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو أضف طالباً جديداً للحلقة</p>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-kufi text-slate-100">
                    {editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد وتوليد الخطة الذكية'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    املأ تفاصيل الحفظ ليقوم الذكاء الاصطناعي بتهيئة خطة يومية محكمة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pl-1 pr-1">
              {/* Row 1: Student Name & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطالب *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عمر بن عبد الرحمن"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">كلمة مرور الطالب للدخول *</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم هاتف الطالب *</label>
                  <input
                    type="text"
                    required
                    placeholder="0551112233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عمر الطالب (سنوات)</label>
                  <input
                    type="number"
                    min={4}
                    max={80}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Parent Info & Multiple Parent Contact Numbers */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-emerald-400">بيانات ولي الأمر وأرقام التواصل</h3>
                  <button
                    type="button"
                    onClick={handleAddParentPhone}
                    className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة رقم هاتف آخر (أم/أخ)</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">اسم ولي الأمر</label>
                  <input
                    type="text"
                    placeholder="مثال: عبد الرحمن المنصور"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {parentPhones.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="الصفة (الأب/الأم/الأخ)"
                      value={p.label}
                      onChange={(e) => handleParentPhoneChange(idx, 'label', e.target.value)}
                      className="w-1/3 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="رقم الواتساب (05xxxxxxxx)"
                      value={p.phone}
                      onChange={(e) => handleParentPhoneChange(idx, 'phone', e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    />
                    {parentPhones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParentPhone(idx)}
                        className="p-2 text-rose-400 hover:text-rose-300 rounded-lg bg-rose-950/40"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Quran Starting Location (All 114 Surahs + Exact Ayah) */}
              <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-800/40 space-y-3">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>نقطة الحفظ الحالية (من أين نبدأ الحفظ؟)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      اختر السورة (١ - ١١٤)
                    </label>
                    <select
                      value={startingSurahId}
                      onChange={(e) => {
                        const newId = Number(e.target.value);
                        setStartingSurahId(newId);
                        setStartingAyah(1);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      {QURAN_SURAHS.map((surah) => (
                        <option key={surah.id} value={surah.id}>
                          {surah.id}. سورة {surah.name} ({surah.totalVerses} آية - الجزء {surah.juz})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      رقم الآية المحددة (١ إلى {selectedSurahInfo?.totalVerses || 7})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedSurahInfo?.totalVerses || 286}
                      value={startingAyah}
                      onChange={(e) => setStartingAyah(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Capacities & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">سعة الحفظ الجديد يومياً</label>
                  <select
                    value={dailyNewCapacity}
                    onChange={(e) => setDailyNewCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="٥ آيات">٥ آيات</option>
                    <option value="نصف وجه (٧-٨ آيات)">نصف وجه (٧-٨ آيات)</option>
                    <option value="وجه كامل (١٥ آية)">وجه كامل (١٥ آية)</option>
                    <option value="وجهان (صفحتان)">وجهان (صفحتان)</option>
                    <option value="سورة قصيرة كاملة">سورة قصيرة كاملة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">سعة المراجعة اليومية</label>
                  <select
                    value={dailyRevisionCapacity}
                    onChange={(e) => setDailyRevisionCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="صفحة واحدة">صفحة واحدة</option>
                    <option value="نصف جزء (١٠ أوجه)">نصف جزء (١٠ أوجه)</option>
                    <option value="جزء كامل (٢٠ وجهاً)">جزء كامل (٢٠ وجهاً)</option>
                    <option value="جزءان">جزءان</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">مستوى الطالب في الحفظ</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as StudentLevel)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="قوي">قوي (حفظ متقن وسريع)</option>
                    <option value="متوسط">متوسط (طبيعي)</option>
                    <option value="ضعيف">ضعيف (يحتاج تثبيت وتخفيف)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ملاحظات توجيهية للمعلم</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات حول طريقة نطق الطالب، مخارج الحروف، التزامه..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isSubmitting
                      ? 'جارٍ الحفظ وتوليد الخطة الذكية...'
                      : editingStudent
                      ? 'حفظ التعديلات'
                      : 'تسجيل الطالب وتوليد الخطة الذكية'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Full AI Plan Details Modal */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right my-8">
            <button
              onClick={() => setSelectedStudentForDetails(null)}
              className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white font-bold text-lg">
                {selectedStudentForDetails.name.slice(0, 1)}
              </div>
              <div>
                <h3 className="text-lg font-bold font-kufi text-slate-100">
                  خطة الطالب / {selectedStudentForDetails.name}
                </h3>
                <p className="text-xs text-slate-400">
                  المستوى: {selectedStudentForDetails.level} • العمر: {selectedStudentForDetails.age} سنة
                </p>
              </div>
            </div>

            {selectedStudentForDetails.aiPlan ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-950/40 border border-emerald-700/50 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>الهدف المرحلي الحالي:</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300">
                      مستوى الصعوبة: {selectedStudentForDetails.aiPlan.difficultyRating}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-100">{selectedStudentForDetails.aiPlan.currentGoal}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">المقرر الجديد اليوم:</span>
                    <strong className="text-emerald-400 text-sm">
                      سورة {selectedStudentForDetails.aiPlan.todayAssignedSurah} (الآيات{' '}
                      {selectedStudentForDetails.aiPlan.todayAssignedFromAyah} -{' '}
                      {selectedStudentForDetails.aiPlan.todayAssignedToAyah})
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">ورد المراجعة والتثبيت:</span>
                    <strong className="text-amber-300 text-sm">
                      {selectedStudentForDetails.aiPlan.todayAssignedRevision}
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <span className="text-slate-400 font-bold block">القارئ الموصى بالاستماع له:</span>
                  <p className="text-slate-200">{selectedStudentForDetails.aiPlan.recommendedSheikh}</p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <span className="text-slate-400 font-bold block">استراتيجية وطريقة الحفظ المقترحة:</span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedStudentForDetails.aiPlan.memorizationStrategy}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <span className="text-slate-400 font-bold block">التركيز التجويدي:</span>
                  <p className="text-teal-300">{selectedStudentForDetails.aiPlan.tajweedFocus}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-950 rounded-2xl text-center text-slate-400 text-xs">
                لم يتم توليد خطة لهذا الطالب بعد.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
