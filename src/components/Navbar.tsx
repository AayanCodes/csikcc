import { GraduationCap, Monitor, Smartphone, Database, LogOut, ShieldCheck } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export function Navbar({ currentView, onNavigate, isAdminLoggedIn, onLogout }: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-slate-900 tracking-tight text-base sm:text-lg">College Event Quiz</h1>
              {isAdminLoggedIn && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Admin Portal
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Automatic Live Quiz Execution Console</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('auditorium')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'auditorium'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden md:inline">Auditorium Screen</span>
            <span className="md:hidden">Auditorium</span>
          </button>

          <button
            onClick={() => onNavigate('student-registration')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border ${
              currentView === 'student-registration' || currentView === 'student-interface'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden md:inline">Student Interface</span>
            <span className="md:hidden">Student</span>
          </button>

          <button
            onClick={() => onNavigate('sql-schema')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border ${
              currentView === 'sql-schema'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">SQL Schema</span>
            <span className="md:hidden">SQL</span>
          </button>

          {isAdminLoggedIn ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('admin-login')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              Admin Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
