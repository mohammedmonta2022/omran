import React, { useState } from 'react';
import {
  UserCheck,
  Lock,
  Phone,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  Crown,
  BookOpen,
  X,
  AlertCircle,
} from 'lucide-react';
import { User, Student, AppSettings } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  students: Student[];
  onRegisterStudent: (newStudentData: { name: string; password: string; phone: string }) => Student;
  settings: AppSettings;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  students,
  onRegisterStudent,
  settings,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!settings.allowStudentRegistration) {
        setError('عذراً، التسجيل الذاتي مغلق حالياً من قبل معلم الحلقة. يرجى التواصل مع المعلم لإنشاء حسابك.');
        return;
      }
      if (!name.trim() || !password || !phone) {
        setError('يرجى ملء جميع الحقول المطلوبة.');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمة المرور وتأكيدها غير متطابقين.');
        return;
      }
      if (password.length < 3) {
        setError('كلمة المرور يجب أن تكون ٣ أحرف أو أرقام على الأقل.');
        return;
      }

      // Create new student
      const createdStudent = onRegisterStudent({ name: name.trim(), password, phone: phone.trim() });
      const user: User = {
        id: `user-${createdStudent.id}`,
        name: createdStudent.name,
        role: 'student',
        phone: createdStudent.phone,
        studentId: createdStudent.id,
      };
      onLoginSuccess(user);
      onClose();
      return;
    }

    // Login mode
    if (role === 'teacher') {
      const teacherUser: User = {
        id: 'teacher-1',
        name: settings.teacherName || 'الشيخ عبد الله المقرئ',
        role: 'teacher',
        phone: settings.teacherPhone || '+966501234567',
        email: 'sheikh@omran.edu',
      };
      onLoginSuccess(teacherUser);
      onClose();
    } else {
      // Student login
      const found = students.find(
        (s) => (s.name.trim() === name.trim() || s.phone.trim() === phone.trim())
      );
      if (found) {
        if (found.password && password && found.password !== password) {
          setError('كلمة المرور غير صحيحة.');
          return;
        }
        const studentUser: User = {
          id: `user-${found.id}`,
          name: found.name,
          role: 'student',
          phone: found.phone,
          studentId: found.id,
        };
        onLoginSuccess(studentUser);
        onClose();
      } else {
        setError('لم يتم العثور على طالب بهذا الاسم أو رقم الهاتف.');
      }
    }
  };

  const handleGoogleLogin = () => {
    // Standard Google login flow representation
    if (role === 'teacher') {
      const googleTeacher: User = {
        id: 'teacher-google',
        name: 'الشيخ عبد الله بن عبد العزيز',
        role: 'teacher',
        email: 'sheikh.abdullah@gmail.com',
        phone: '+966501234567',
      };
      onLoginSuccess(googleTeacher);
    } else {
      const firstStudent = students[0];
      const googleStudent: User = {
        id: firstStudent ? `user-${firstStudent.id}` : 'student-google',
        name: firstStudent ? firstStudent.name : 'عمر عبد الرحمن',
        role: 'student',
        email: 'omar.quran@gmail.com',
        phone: firstStudent ? firstStudent.phone : '+966551112233',
        studentId: firstStudent ? firstStudent.id : undefined,
      };
      onLoginSuccess(googleStudent);
    }
    onClose();
  };

  const handleQuickDemo = (asRole: 'teacher' | 'student', studentIndex = 0) => {
    if (asRole === 'teacher') {
      onLoginSuccess({
        id: 'teacher-1',
        name: settings.teacherName,
        role: 'teacher',
        phone: settings.teacherPhone,
        email: 'sheikh@omran.edu',
      });
    } else {
      const std = students[studentIndex] || students[0];
      if (std) {
        onLoginSuccess({
          id: `user-${std.id}`,
          name: std.name,
          role: 'student',
          phone: std.phone,
          studentId: std.id,
        });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950 text-right my-8 overflow-hidden">
        {/* Islamic decorative header pattern */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-750 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-0.5 shadow-xl shadow-emerald-950/70 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black font-kufi bg-gradient-to-l from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            مَنْصَة عِـمْـرَان القُرْآنِيَّة
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' ? 'سجّل دخولك للوصول إلى حلقتك القرآنية وخطتك الذكية' : 'إنشاء حساب طالب جديد في الحلقة'}
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRole('student');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            إنشاء حساب طالب جديد
          </button>
        </div>

        {/* Notice if registration is closed */}
        {mode === 'register' && !settings.allowStudentRegistration && (
          <div className="mb-5 p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center gap-3 text-amber-300 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <p>تنبيه: المعلم قام بإغلاق إنشاء الحسابات الذاتي. فقط المعلم يستطيع تسجيل الطلاب الجدد.</p>
          </div>
        )}

        {/* Role toggle in Login mode */}
        {mode === 'login' && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
                role === 'teacher'
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>معلم الحلقة (المشرف)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
                role === 'student'
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>طالب في الحلقة</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/70 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">اسم الطالب الثلاثي</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: عمر بن عبد الرحمن المنصور"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {mode === 'register' || role === 'student' ? 'رقم الهاتف / الجوال' : 'البريد أو رقم هاتف المعلم'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={mode === 'register' || role === 'student' ? '05xxxxxxxx' : 'sheikh@omran.edu'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{mode === 'register' ? 'تأكيد وإنشاء الحساب' : 'دخول المنصة'}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-slate-900 text-xs text-slate-500">أو تسجيل الدخول السريع</span>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>تسجيل الدخول من خلال Google</span>
        </button>

        {/* Quick Demo Mode Chips */}
        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 text-center mb-2.5">دخول تجريبي فوري:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('teacher')}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>دخول كمعلم الحلقة</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('student', 0)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>دخول كطالب (عمر عبد الرحمن)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
