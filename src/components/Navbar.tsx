import { GraduationCap, Monitor, Smartphone, Database, LogOut, ShieldCheck, BarChart3, Users, Award } from 'lucide-react';
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
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(isAdminLoggedIn ? 'admin-dashboard' : 'student-registration')}>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-950 tracking-tight text-base sm:text-lg">College Live Quiz</span>
              {isAdminLoggedIn && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Real-Time Academic Assessment Platform</p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('auditorium')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'auditorium'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-blue-600" />
            <span className="hidden md:inline">Auditorium Display</span>
            <span className="md:hidden">Auditorium</span>
          </button>

          <button
            onClick={() => onNavigate('student-registration')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors border ${
              currentView.startsWith('student')
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden md:inline">Student Portal</span>
            <span className="md:hidden">Student</span>
          </button>

          <button
            onClick={() => onNavigate('firebase-schema')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors border ${
              currentView === 'firebase-schema'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Firestore Schema</span>
            <span className="md:hidden">Schema</span>
          </button>

          {isAdminLoggedIn ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('admin-login')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
