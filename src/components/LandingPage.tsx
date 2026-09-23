import React, { useState } from 'react';
import { Quiz } from '../types';
import logoImg from '../logo.jpeg';
import { getStudentEventLink } from '../lib/quizService';

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
  onSelectQuiz,
  onJoinQuiz,
  onOpenAdmin,
  onOpenAuditorium,
}) => {
  const [eventCodeInput, setEventCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = eventCodeInput.trim().toLowerCase();
    if (!cleanCode) return;

    const matched = quizzes.find(
      (q) => q.id.toLowerCase() === cleanCode || q.title.toLowerCase().includes(cleanCode)
    );

    if (matched) {
      setCodeError(null);
      onSelectQuiz(matched.id);
      onJoinQuiz(matched.id);
    } else {
      setCodeError(`No event found matching code "${cleanCode}". Check the code or select from the list below.`);
    }
  };

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
            onClick={() => onOpenAuditorium(activeQuiz?.id)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
          >
            <span>📽️</span>
            <span>Auditorium Screen</span>
          </button>
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
            <button
              onClick={() => onOpenAuditorium(activeQuiz?.id)}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded transition-colors cursor-pointer"
            >
              Open Auditorium Projector
            </button>
          </div>

          {/* Quick Event Code Search */}
          <form onSubmit={handleJoinByCode} className="max-w-md mx-auto pt-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={eventCodeInput}
                onChange={(e) => {
                  setEventCodeInput(e.target.value);
                  setCodeError(null);
                }}
                placeholder="Have an Event Code? e.g. college-live-quiz-2026"
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded cursor-pointer shrink-0"
              >
                Join by Code →
              </button>
            </div>
            {codeError && (
              <p className="text-xs text-red-600 text-left">{codeError}</p>
            )}
          </form>
        </div>

        {/* Multiple Events Grid */}
        {quizzes.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>🏆</span>
                  <span>Active & Upcoming Competition Events ({quizzes.length})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Select your assigned event or use your organizer's direct event link
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 w-fit">
                {quizzes.filter((q) => q.status === 'LIVE').length} Live Now
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((q) => {
                const isActive = q.id === activeQuiz?.id;
                const isLive = q.status === 'LIVE';
                const isEnded = q.status === 'ENDED' || q.status === 'RESULTS_PUBLISHED';

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border transition-all p-5 flex flex-col justify-between space-y-4 ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isLive
                              ? 'bg-emerald-100 text-emerald-800'
                              : isEnded
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {q.status}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          ID: {q.id}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {q.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {q.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>📅 {q.scheduledDate || 'Today'}</span>
                        <span>⏰ {q.scheduledTime || 'Live'}</span>
                        <span>⏱️ {q.questionDurationSeconds || 30}s/Q</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onSelectQuiz(q.id);
                            onJoinQuiz(q.id);
                          }}
                          className={`flex-1 py-2 px-3 text-xs font-bold rounded text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                            isLive
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <span>{isLive ? '🔴 Join Live Quiz' : '🎓 Enter Lobby'}</span>
                        </button>
                        <button
                          onClick={() => onOpenAuditorium(q.id)}
                          title="Open Auditorium Big-Screen Display"
                          className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded border border-slate-200 transition-colors cursor-pointer"
                        >
                          📽️
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Direct link:</span>
                        <button
                          onClick={async () => {
                            const link = getStudentEventLink(q.id);
                            await navigator.clipboard.writeText(link);
                            alert(`Direct Student Link copied:\n${link}`);
                          }}
                          className="font-mono text-blue-600 hover:underline cursor-pointer"
                        >
                          📋 Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 max-w-6xl mx-auto w-full">
        <div>
          CSI Tech Clash • Real-Time Synchronized Competition Assessment Engine
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onOpenAuditorium(activeQuiz?.id)}
            className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Auditorium Projector
          </button>
          <button
            onClick={onOpenAdmin}
            className="text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer flex items-center gap-1"
            title="Administrator Portal"
          >
            <span>🛡️</span>
            <span>Admin Portal</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
