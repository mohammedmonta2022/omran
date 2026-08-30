import React, { useState, useEffect } from 'react';
import { IslamicBackground } from './components/IslamicBackground';
import { Navbar, TabType } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { EvaluationView } from './components/EvaluationView';
import { ParentsView } from './components/ParentsView';
import { ReportsView } from './components/ReportsView';
import { AIChatView } from './components/AIChatView';
import { StudentPortalView } from './components/StudentPortalView';
import { ExportImportModal } from './components/ExportImportModal';
import {
  Student,
  AttendanceRecord,
  EvaluationCriterion,
  StudentEvaluation,
  AppSettings,
  ChatMessage,
  PlatformDataBackup,
  User,
} from './types';
import {
  loadPlatformData,
  savePlatformData,
  getAuthUser,
  setAuthUser,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  DEFAULT_CRITERIA,
  INITIAL_EVALUATIONS,
  DEFAULT_SETTINGS,
  INITIAL_CHAT,
} from './utils/storage';
import { getSurahById } from './data/quranData';

export function App() {
  // Global Platform State loaded from persistent storage
  const [platformData, setPlatformData] = useState<PlatformDataBackup>(() => loadPlatformData());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getAuthUser());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [preSelectedStudentIdForEval, setPreSelectedStudentIdForEval] = useState<string | null>(null);

  // URL Query handling (e.g. ?portal=student&id=std-1)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const portal = urlParams.get('portal');
    const studentId = urlParams.get('id');

    if (portal === 'student' && studentId) {
      const student = platformData.students.find((s) => s.id === studentId);
      if (student) {
        // Auto sign in or view as student
        setCurrentUser({
          id: `user-${student.id}`,
          name: student.name,
          role: 'student',
          phone: student.phone,
          studentId: student.id,
        });
        setCurrentTab('student-portal');
      }
    }
  }, []);

  // Save to persistent storage on any update
  useEffect(() => {
    savePlatformData(platformData);
  }, [platformData]);

  // Auth synchronization
  useEffect(() => {
    setAuthUser(currentUser);
    if (currentUser?.role === 'student') {
      setCurrentTab('student-portal');
    }
  }, [currentUser]);

  // 1. Add Student & Generate Initial AI Plan
  const handleAddStudent = async (newStudentData: Omit<Student, 'id' | 'createdAt'>) => {
    const studentId = `std-${Date.now()}`;
    const startingSurah = getSurahById(newStudentData.startingSurahId);

    let initialAIPlan = undefined;
    try {
      const res = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: {
            ...newStudentData,
            startingSurahName: startingSurah?.name || 'البقرة',
          },
        }),
      });
      const data = await res.json();
      if (data.plan) {
        initialAIPlan = data.plan;
      }
    } catch (e) {
      console.error('Error generating AI plan on student creation:', e);
    }

    const createdStudent: Student = {
      ...newStudentData,
      id: studentId,
      createdAt: new Date().toISOString().split('T')[0],
      aiPlan: initialAIPlan || {
        currentGoal: `إتقان سورة ${startingSurah?.name || 'البقرة'} من الآية ${newStudentData.startingAyah}`,
        todayAssignedSurah: startingSurah?.name || 'البقرة',
        todayAssignedSurahId: newStudentData.startingSurahId,
        todayAssignedFromAyah: newStudentData.startingAyah,
        todayAssignedToAyah: newStudentData.startingAyah + 5,
        todayAssignedRevision: 'مراجعة المقطع السابق بتأنٍ وتجويد',
        recommendedSheikh: 'الشيخ محمود خليل الحصري (المصحف المعلم)',
        difficultyRating: newStudentData.level === 'ضعيف' ? 'سهل' : 'متوسط',
        memorizationStrategy: 'التكرار ٧ مرات بالنظر للمصحف ثم ٧ مرات غيباً',
        tajweedFocus: 'مخارج الحروف والمدود الطبيعية والغُنن',
        lastCalculatedDate: new Date().toISOString().split('T')[0],
      },
    };

    // Also auto-add today's attendance for new student
    const todayStr = new Date().toISOString().split('T')[0];
    const newAttendanceRecord: AttendanceRecord = {
      id: `att-${todayStr}-${studentId}`,
      date: todayStr,
      studentId: studentId,
      status: 'present',
      updatedAt: new Date().toISOString(),
    };

    setPlatformData((prev) => ({
      ...prev,
      students: [createdStudent, ...prev.students],
      attendance: [newAttendanceRecord, ...prev.attendance],
    }));
  };

  // Register Student from Auth Modal
  const handleRegisterStudentFromAuth = (data: { name: string; password: string; phone: string }): Student => {
    const studentId = `std-${Date.now()}`;
    const newStudent: Student = {
      id: studentId,
      name: data.name,
      password: data.password,
      phone: data.phone,
      parentName: 'ولي الأمر',
      parentPhones: [{ label: 'رقم الهاتف', phone: data.phone }],
      age: 12,
      startingSurahId: 2,
      startingAyah: 1,
      currentSurahId: 2,
      currentAyah: 1,
      dailyNewCapacity: 'وجه كامل (١٥ آية)',
      dailyRevisionCapacity: 'نصف جزء',
      level: 'متوسط',
      createdAt: new Date().toISOString().split('T')[0],
      aiPlan: {
        currentGoal: 'إتقان سورة البقرة وتثبيت الحفظ اليومي',
        todayAssignedSurah: 'البقرة',
        todayAssignedSurahId: 2,
        todayAssignedFromAyah: 1,
        todayAssignedToAyah: 7,
        todayAssignedRevision: 'مراجعة قصار السور السابقة',
        recommendedSheikh: 'الشيخ محمود خليل الحصري (المصحف المعلم)',
        difficultyRating: 'متوسط',
        memorizationStrategy: 'الاستماع أولاً للقارئ ثم التكرار ٥ مرات',
        tajweedFocus: 'مخارج الحروف والغُنن',
        lastCalculatedDate: new Date().toISOString().split('T')[0],
      },
    };

    setPlatformData((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
    }));

    return newStudent;
  };

  // 2. Update Student
  const handleUpdateStudent = (updatedStudent: Student) => {
    setPlatformData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)),
    }));
  };

  // 3. Delete Student
  const handleDeleteStudent = (studentId: string) => {
    setPlatformData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
      attendance: prev.attendance.filter((a) => a.studentId !== studentId),
      evaluations: prev.evaluations.filter((e) => e.studentId !== studentId),
    }));
  };

  // 4. Save Attendance
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    setPlatformData((prev) => ({
      ...prev,
      attendance: records,
    }));
  };

  // 5. Update Evaluation Criteria
  const handleUpdateCriteria = (newCriteria: EvaluationCriterion[]) => {
    setPlatformData((prev) => ({
      ...prev,
      criteria: newCriteria,
    }));
  };

  // 6. Save Evaluation & Update Student Plan
  const handleSaveEvaluation = (
    evaluation: StudentEvaluation,
    updatedStudentPlan?: Student['aiPlan']
  ) => {
    setPlatformData((prev) => {
      // Replace existing evaluation for same date and student or add new
      const filteredEvals = prev.evaluations.filter(
        (e) => !(e.date === evaluation.date && e.studentId === evaluation.studentId)
      );

      // Update student plan if provided
      const updatedStudents = prev.students.map((s) => {
        if (s.id === evaluation.studentId) {
          return {
            ...s,
            currentSurahId: updatedStudentPlan?.todayAssignedSurahId || s.currentSurahId,
            currentAyah: updatedStudentPlan?.todayAssignedFromAyah || s.currentAyah,
            aiPlan: updatedStudentPlan || s.aiPlan,
          };
        }
        return s;
      });

      return {
        ...prev,
        evaluations: [evaluation, ...filteredEvals],
        students: updatedStudents,
      };
    });
  };

  // 7. Update App Settings
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setPlatformData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  // 8. AI Chat Message Handler
  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setPlatformData((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMsg],
    }));

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAtt = platformData.attendance.filter((a) => a.date === todayStr);

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          chatHistory: platformData.chatMessages,
          halagahContext: {
            halagahName: platformData.settings.halagahName,
            totalStudents: platformData.students.length,
            studentsList: platformData.students.map((s) => ({
              name: s.name,
              level: s.level,
              currentSurah: s.aiPlan?.todayAssignedSurah,
            })),
            todayStats: {
              present: todayAtt.filter((a) => a.status === 'present' || a.status === 'late').length,
              absent: todayAtt.filter((a) => a.status === 'absent').length,
            },
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'تم استلام رسالتك يا شيخنا الفاضل.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };

      setPlatformData((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages, assistantMsg],
      }));
    } catch (e) {
      console.error('Error sending chat message:', e);
    }
  };

  const handleResetChat = () => {
    setPlatformData((prev) => ({
      ...prev,
      chatMessages: INITIAL_CHAT,
    }));
  };

  // 9. Export & Import Backup
  const handleExportBackup = (): PlatformDataBackup => {
    return {
      ...platformData,
      exportedAt: new Date().toISOString(),
    };
  };

  const handleImportBackup = (imported: PlatformDataBackup) => {
    setPlatformData(imported);
  };

  const handleResetToSample = () => {
    setPlatformData({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: DEFAULT_SETTINGS,
      students: INITIAL_STUDENTS,
      attendance: INITIAL_ATTENDANCE,
      criteria: DEFAULT_CRITERIA,
      evaluations: INITIAL_EVALUATIONS,
      chatMessages: INITIAL_CHAT,
    });
  };

  // Active student for Student Portal view
  const activeStudentForPortal =
    platformData.students.find((s) => s.id === currentUser?.studentId) ||
    platformData.students[0];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative" dir="rtl">
      {/* Dynamic Animated Islamic Geometric Canvas Background */}
      <IslamicBackground />

      {/* Top Islamic Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          setIsAuthOpen(true);
        }}
        onOpenExportImport={() => setIsExportImportOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {currentTab === 'dashboard' && (
          <DashboardView
            students={platformData.students}
            attendance={platformData.attendance}
            evaluations={platformData.evaluations}
            settings={platformData.settings}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onSelectStudentForEval={(studentId) => {
              setPreSelectedStudentIdForEval(studentId);
              setCurrentTab('evaluation');
            }}
          />
        )}

        {currentTab === 'students' && (
          <StudentsView
            students={platformData.students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            settings={platformData.settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceView
            students={platformData.students}
            attendance={platformData.attendance}
            onSaveAttendance={handleSaveAttendance}
          />
        )}

        {currentTab === 'evaluation' && (
          <EvaluationView
            students={platformData.students}
            attendance={platformData.attendance}
            criteria={platformData.criteria}
            onUpdateCriteria={handleUpdateCriteria}
            evaluations={platformData.evaluations}
            onSaveEvaluation={handleSaveEvaluation}
            settings={platformData.settings}
            preSelectedStudentId={preSelectedStudentIdForEval}
          />
        )}

        {currentTab === 'parents' && (
          <ParentsView
            students={platformData.students}
            attendance={platformData.attendance}
            evaluations={platformData.evaluations}
            settings={platformData.settings}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            students={platformData.students}
            attendance={platformData.attendance}
            evaluations={platformData.evaluations}
            settings={platformData.settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {currentTab === 'ai-chat' && (
          <AIChatView
            chatMessages={platformData.chatMessages}
            onSendMessage={handleSendMessage}
            onResetChat={handleResetChat}
            students={platformData.students}
            settings={platformData.settings}
          />
        )}

        {currentTab === 'student-portal' && activeStudentForPortal && (
          <StudentPortalView
            student={activeStudentForPortal}
            attendance={platformData.attendance}
            evaluations={platformData.evaluations}
            settings={platformData.settings}
          />
        )}
      </main>

      {/* Islamic Footer */}
      <footer className="relative z-10 py-6 border-t border-slate-900 bg-slate-950/70 text-center text-xs text-slate-500">
        <p className="font-amiri text-sm text-slate-400">
          « إِنَّ هَـٰذَا ٱلۡقُرۡءَانَ يَهۡدِی لِلَّتِی هِیَ أَقۡوَمُ » — منصة عمران لإدارة حلقات القرآن الكريم والذكاء الاصطناعي
        </p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
        students={platformData.students}
        onRegisterStudent={handleRegisterStudentFromAuth}
        settings={platformData.settings}
      />

      {/* Export / Import Database Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        onExport={handleExportBackup}
        onImport={handleImportBackup}
        onResetToSample={handleResetToSample}
      />
    </div>
  );
}

export default App;
