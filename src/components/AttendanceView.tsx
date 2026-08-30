import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Calendar as CalendarIcon,
  Check,
  Sparkles,
  Save,
  Users,
  Search,
  History,
  TrendingUp,
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (updatedRecords: AttendanceRecord[]) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
  onSaveAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [localStatuses, setLocalStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Initialize local statuses for the selected date
  React.useEffect(() => {
    const statuses: Record<string, AttendanceStatus> = {};
    const notes: Record<string, string> = {};

    students.forEach((s) => {
      const record = attendance.find((a) => a.date === selectedDate && a.studentId === s.id);
      statuses[s.id] = record?.status || 'present';
      notes[s.id] = record?.note || '';
    });

    setLocalStatuses(statuses);
    setNotesState(notes);
  }, [selectedDate, attendance, students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNotesState((prev) => ({ ...prev, [studentId]: note }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = 'present';
    });
    setLocalStatuses(updated);
  };

  const handleSave = () => {
    const recordsToSave: AttendanceRecord[] = students.map((s) => {
      const existing = attendance.find((a) => a.date === selectedDate && a.studentId === s.id);
      return {
        id: existing?.id || `att-${selectedDate}-${s.id}`,
        date: selectedDate,
        studentId: s.id,
        status: localStatuses[s.id] || 'present',
        note: notesState[s.id] || '',
        updatedAt: new Date().toISOString(),
      };
    });

    // Merge with records from other dates
    const otherDateRecords = attendance.filter((a) => a.date !== selectedDate);
    onSaveAttendance([...otherDateRecords, ...recordsToSave]);

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count summaries for selected date
  const presentCount = Object.values(localStatuses).filter((st) => st === 'present').length;
  const lateCount = Object.values(localStatuses).filter((st) => st === 'late').length;
  const absentCount = Object.values(localStatuses).filter((st) => st === 'absent').length;
  const excusedCount = Object.values(localStatuses).filter((st) => st === 'excused').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black font-kufi text-slate-100">
              كشف الحضور والغياب اليومي
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold text-xs">
              {students.length} طالب
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل الحضور والغياب والتأخر والاعتذارات اليومية للحلقة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-700">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-200 focus:outline-none"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            تحضير الكل كحاضرين
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>حفظ الكشف</span>
          </button>
        </div>
      </div>

      {/* Stats Mini Banner for Selected Date */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-300 font-semibold block">حاضر</span>
            <strong className="text-xl font-black text-emerald-400">{presentCount}</strong>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-300 font-semibold block">متأخر</span>
            <strong className="text-xl font-black text-amber-400">{lateCount}</strong>
          </div>
          <Clock className="w-6 h-6 text-amber-500" />
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-rose-300 font-semibold block">غائب</span>
            <strong className="text-xl font-black text-rose-400">{absentCount}</strong>
          </div>
          <XCircle className="w-6 h-6 text-rose-500" />
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-blue-300 font-semibold block">معتذر</span>
            <strong className="text-xl font-black text-blue-400">{excusedCount}</strong>
          </div>
          <HelpCircle className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      {/* Success Toast */}
      {showSavedToast && (
        <div className="p-3 bg-emerald-900/90 border border-emerald-500 text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>تم حفظ كشف الحضور والغياب لتاريخ ({selectedDate}) بنجاح وتحديث كافة التقارير!</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
        <input
          type="text"
          placeholder="بحث سريع باسم الطالب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Students Attendance Table / List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800/80">
          {filteredStudents.map((student) => {
            const currentStatus = localStatuses[student.id] || 'present';

            return (
              <div
                key={student.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3.5 min-w-[220px]">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      currentStatus === 'present'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                        : currentStatus === 'late'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                        : currentStatus === 'excused'
                        ? 'bg-blue-950 text-blue-300 border border-blue-700/60'
                        : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                    }`}
                  >
                    {student.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{student.name}</h4>
                    <p className="text-xs text-slate-400">{student.phone} • {student.level}</p>
                  </div>
                </div>

                {/* 4 Status Toggle Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>حاضر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentStatus === 'late'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>متأخر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>غائب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'excused')}
                    className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentStatus === 'excused'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>معتذر</span>
                  </button>
                </div>

                {/* Notes Input (for excuse or late explanation) */}
                <div className="w-full md:w-64">
                  <input
                    type="text"
                    placeholder="ملاحظة أو سبب العذر/التأخر..."
                    value={notesState[student.id] || ''}
                    onChange={(e) => handleNoteChange(student.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
