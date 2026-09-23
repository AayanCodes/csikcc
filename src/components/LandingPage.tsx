import React, { useState } from 'react';
import { Quiz } from '../types';
import logoImg from '../logo.jpeg';

interface LandingPageProps {
  quizzes: Quiz[];
  activeQuiz: Quiz | null;
  onSelectQuiz: (quizId: string) => void;
  onJoinQuiz: (quizId?: string) => void;
  onOpenAdmin: () => void;
  onOpenAuditorium: (quizId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  quizzes,
  activeQuiz,
  onJoinQuiz,
  onOpenAdmin,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top minimal header */}
      <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <img
            src={logoImg}
            alt="Logo"
            className="w-9 h-9 rounded object-cover shadow-2xs border border-slate-200"
          />
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg leading-none block">
              CSI Tech Clash
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Live College Competition Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>🛡️</span>
            <span>Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Live Synchronized Academic Quizzes</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {activeQuiz?.title || 'College Live Quiz Championship'}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {activeQuiz?.description ||
              'Authoritative synchronized academic quiz assessment for college championships and departmental competitions.'}
          </p>

          {/* Quick Join Button for Active Quiz */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onJoinQuiz(activeQuiz?.id)}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🎓</span>
              <span>Join Active Event Now</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
