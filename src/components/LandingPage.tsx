import React from 'react';
import { Quiz } from '../types';

interface LandingPageProps {
  quiz: Quiz | null;
  onJoinQuiz: () => void;
  onOpenAdmin: () => void;
  onOpenAuditorium: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  quiz,
  onJoinQuiz,
  onOpenAdmin,
  onOpenAuditorium,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top minimal header */}
      <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            CQ
          </div>
          <span className="font-semibold text-slate-800 tracking-tight text-lg">
            College Live Quiz
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAuditorium}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded border border-slate-200 hover:border-slate-300 transition-colors"
          >
            Auditorium Projector
          </button>
        </div>
      </header>

      {/* Main hero section */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
              {quiz?.title || 'College Live Quiz'}
            </h1>
            <p className="text-lg text-slate-600 font-normal leading-relaxed">
              {quiz?.description ||
                'Authoritative synchronized academic quiz assessment for live college events.'}
            </p>
          </div>

          {quiz && (
            <div className="inline-flex items-center space-x-4 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span>Date: <strong className="text-slate-800">{quiz.scheduledDate || 'Today'}</strong></span>
              <span>•</span>
              <span>Time: <strong className="text-slate-800">{quiz.scheduledTime || 'Live'}</strong></span>
              <span>•</span>
              <span>Questions: <strong className="text-slate-800">{quiz.totalQuestions}</strong></span>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onJoinQuiz}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
            >
              Join Live Quiz
            </button>
          </div>
        </div>
      </main>

      {/* Subtle, discreet footer */}
      <footer className="px-6 py-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 max-w-6xl mx-auto w-full">
        <div>
          Official College Examination & Assessment System
        </div>
        <div>
          {/* Discreet ADMIN link at one corner of the landing page */}
          <button
            onClick={onOpenAdmin}
            className="text-slate-400 hover:text-slate-700 transition-colors font-mono uppercase tracking-widest text-[11px] p-1 cursor-pointer"
            title="Administrator Portal"
          >
            Admin
          </button>
        </div>
      </footer>
    </div>
  );
};
