import React from 'react';
import {
  BookOpen,
  Users,
  CalendarCheck,
  Award,
  MessageCircle,
  BarChart3,
  Bot,
  Database,
  LogOut,
  Sparkles,
  UserCheck,
  Crown,
} from 'lucide-react';
import { User } from '../types';

export type TabType =
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'evaluation'
  | 'parents'
  | 'reports'
  | 'ai-chat'
  | 'student-portal';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenExportImport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenExportImport,
}) => {
  const isTeacher = currentUser?.role === 'teacher';

  const teacherTabs = [
    { id: 'dashboard', label: 'الرئيسية', icon: BarChart3 },
    { id: 'students', label: 'الطلاب وتسجيلهم', icon: Users },
    { id: 'attendance', label: 'الحضور والغياب', icon: CalendarCheck },
    { id: 'evaluation', label: 'التقييم والتسميع', icon: Award },
    { id: 'parents', label: 'أولياء الأمور', icon: MessageCircle },
    { id: 'reports', label: 'التقارير', icon: BookOpen },
    { id: 'ai-chat', label: 'مساعد عمران AI', icon: Bot, isSpecial: true },
  ];

  const studentTabs = [
    { id: 'student-portal', label: 'وردي وإنجازي اليومي', icon: BookOpen },
    { id: 'reports', label: 'تقريري القرآني', icon: Award },
    { id: 'ai-chat', label: 'المساعد القرآني', icon: Bot, isSpecial: true },
  ];

  const activeTabs = isTeacher ? teacherTabs : studentTabs;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-emerald-900/30 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand Title */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onSelectTab(isTeacher ? 'dashboard' : 'student-portal')}
              className="flex items-center gap-3.5 cursor-pointer group"
              id="brand-logo-button"
            >
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors" />
                  <BookOpen className="w-6 h-6 text-emerald-400 transform group-hover:rotate-6 transition-transform" />
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute top-1.5 right-1.5 animate-pulse" />
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-kufi text-2xl font-bold tracking-wide bg-gradient-to-l from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                    عِـمْـرَان
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300">
                    القرآن & AI
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">منصة الحلقات القرآنية والتسميع الذكي</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
            {activeTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onSelectTab(tab.id as TabType)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md shadow-emerald-950/60 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  } ${tab.isSpecial ? 'border border-amber-500/40 text-amber-300 hover:bg-amber-500/10' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.isSpecial ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <span>{tab.label}</span>
                  {tab.isSpecial && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: User Profile, Backup, Login/Logout */}
          <div className="flex items-center gap-2.5">
            {/* Backup & Restore Data */}
            <button
              id="export-import-button"
              onClick={onOpenExportImport}
              title="تصدير واستيراد قاعدة البيانات"
              className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-emerald-300 border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline font-medium">البيانات</span>
            </button>

            {/* User Profile Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-950/80 border border-emerald-800/40 rounded-2xl px-3 py-1.5 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.role === 'teacher' ? (
                    <Crown className="w-4 h-4 text-amber-300" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-200" />
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    {currentUser.role === 'teacher' ? 'معلم الحلقة' : 'حساب طالب'}
                  </div>
                </div>
                <button
                  id="user-logout-button"
                  onClick={onLogout}
                  title="تسجيل الخروج أو تبديل الحساب"
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors mr-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="open-auth-modal-button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-950 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-slate-800/60 no-scrollbar">
          {activeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as TabType)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-slate-850 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
