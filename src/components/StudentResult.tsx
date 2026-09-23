import React from 'react';
import { QuizResult } from '../types';

interface StudentResultProps {
  result: QuizResult | null;
  quizTitle: string;
  onBackToHome?: () => void;
}

export const StudentResult: React.FC<StudentResultProps> = ({
  result,
  quizTitle,
  onBackToHome,
}) => {
  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-md p-8 sm:p-10 text-center space-y-5 my-auto">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl">
            ✓
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
              CSI Tech Clash 2026
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Quiz Completed</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Your responses have been successfully recorded in the database. Please wait for the event administrator to calculate and publish the official results.
          </p>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Awaiting Official Publication</span>
          </div>
          {onBackToHome && (
            <div className="pt-2">
              <button
                onClick={onBackToHome}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← Return to Main Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isTopThree = result.rank > 0 && result.rank <= 3;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl lg:max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8 my-auto transition-all">
        {/* Certificate Header */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-6">
          <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase block">
            CSI Tech Clash 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {quizTitle}
          </h1>
          {result.publishedAt && (
            <p className="text-xs text-slate-400 font-mono">
              Published on {new Date(result.publishedAt).toLocaleDateString()} at{' '}
              {new Date(result.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Prominent Rank Banner */}
        <div
          className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            result.rank === 1
              ? 'bg-amber-50/80 border-amber-300 text-amber-950'
              : result.rank === 2
              ? 'bg-slate-100/90 border-slate-300 text-slate-900'
              : result.rank === 3
              ? 'bg-orange-50/80 border-orange-300 text-orange-950'
              : 'bg-blue-50/60 border-blue-200 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-3xl font-bold shadow-xs shrink-0 ${
                result.rank === 1
                  ? 'bg-amber-400 text-amber-950'
                  : result.rank === 2
                  ? 'bg-slate-300 text-slate-800'
                  : result.rank === 3
                  ? 'bg-orange-400 text-orange-950'
                  : 'bg-blue-600 text-white font-mono text-2xl'
              }`}
            >
              {result.rank === 1
                ? '🥇'
                : result.rank === 2
                ? '🥈'
                : result.rank === 3
                ? '🥉'
                : `#${result.rank}`}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Official Standing
              </span>
              <div className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {result.rank === 1
                  ? 'First Place • Champion'
                  : result.rank === 2
                  ? 'Second Place • Runner-Up'
                  : result.rank === 3
                  ? 'Third Place • Bronze'
                  : `Rank #${result.rank} Overall`}
              </div>
              <span className="text-xs text-slate-500">
                {result.percentage >= 80
                  ? 'Outstanding performance across all questions!'
                  : result.percentage >= 50
                  ? 'Commendable score in competitive assessment.'
                  : 'Participation recorded with official marks.'}
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-3 sm:pt-0 sm:pl-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Accuracy
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-blue-600">
              {result.percentage}%
            </span>
          </div>
        </div>

        {/* Student Identification Profile */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Candidate Name
              </span>
              <p className="font-bold text-slate-900 text-base">{result.name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Roll Number
              </span>
              <p className="font-mono font-bold text-slate-900 text-base">{result.rollNumber}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Department
              </span>
              <p className="font-semibold text-slate-800 text-base">{result.department}</p>
            </div>
          </div>
        </div>

        {/* Score Breakdown Cards - Generous 4-Column Grid */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Detailed Performance Metrics
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Final Score
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900">
                {result.score} <span className="text-sm font-normal text-slate-400">/ {result.totalQuestions}</span>
              </span>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-center flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 block mb-1">
                Percentage
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-blue-600">
                {result.percentage}%
              </span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-1">
                Correct
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-emerald-800">
                {result.correct}
              </span>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 block mb-1">
                Incorrect
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-rose-700">
                {result.incorrect}
              </span>
            </div>
          </div>

          {/* Progress bar visual indicator */}
          <div className="pt-2">
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, result.percentage))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🖨️</span>
            <span>Print Scorecard</span>
          </button>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-4 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer text-center"
            >
              ← Return to Main Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
