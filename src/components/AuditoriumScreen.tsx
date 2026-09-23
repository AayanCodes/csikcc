import React, { useState, useEffect } from 'react';
import { Quiz, Question, QuizState, QuizResult } from '../types';

interface AuditoriumScreenProps {
  quiz: Quiz | null;
  quizState: QuizState | null;
  currentQuestion: Question | null;
  totalQuestions: number;
  results: QuizResult[];
  onExitAuditorium?: () => void;
}

export const AuditoriumScreen: React.FC<AuditoriumScreenProps> = ({
  quiz,
  quizState,
  currentQuestion,
  totalQuestions,
  results,
  onExitAuditorium,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Authoritative countdown timer for live question
  useEffect(() => {
    const updateTimer = () => {
      if (!quizState?.questionEndTime || quizState.questionEndTime <= 0) {
        setRemainingSeconds(0);
        return;
      }
      const now = Date.now();
      const diffMs = quizState.questionEndTime - now;
      const sec = Math.max(0, Math.ceil(diffMs / 1000));
      setRemainingSeconds(sec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 250);
    return () => clearInterval(interval);
  }, [quizState?.questionEndTime]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const status = quizState?.status || quiz?.status || 'WAITING';
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col justify-between p-8 md:p-14 selection:bg-blue-600 selection:text-white relative">
      {/* Discreet Exit button at top corner (hover only, for operator convenience) */}
      {onExitAuditorium && (
        <button
          onClick={onExitAuditorium}
          className="absolute top-4 right-4 text-xs font-mono text-slate-300 hover:text-slate-800 transition-colors z-50 cursor-pointer"
          title="Exit Auditorium Display"
        >
          [ESC / Exit]
        </button>
      )}

      {/* STATE 1: WAITING */}
      {status === 'WAITING' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 my-auto">
          <div className="space-y-4 max-w-4xl">
            <span className="text-xl md:text-2xl font-semibold tracking-widest text-blue-600 uppercase">
              COLLEGE LIVE QUIZ EVENT
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {quiz?.title || 'College Annual Live Quiz Championship'}
            </h1>
            <p className="text-2xl text-slate-500 font-normal pt-2 max-w-2xl mx-auto">
              {quiz?.description || 'Auditorium projector display. Please register and await start.'}
            </p>
          </div>

          <div className="inline-flex items-center space-x-4 px-8 py-4 bg-slate-100 border border-slate-200 rounded-lg">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-2xl font-bold tracking-wider text-slate-800 uppercase">
              WAITING FOR SESSION TO BEGIN
            </span>
          </div>

          {quiz?.scheduledTime && (
            <div className="text-slate-500 font-mono text-xl">
              Scheduled Start Time: <strong className="text-slate-900 font-bold">{quiz.scheduledTime}</strong>
            </div>
          )}
        </div>
      )}

      {/* STATE 2: LIVE QUESTION DISPLAY */}
      {status === 'LIVE' && currentQuestion && (
        <div className="flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full">
          {/* Top Bar: Event Name & Question Number */}
          <div className="flex items-center justify-between pb-8 border-b-2 border-slate-200">
            <div>
              <div className="text-lg md:text-xl font-bold tracking-widest text-blue-600 uppercase mb-1">
                {quiz?.title || 'COLLEGE LIVE QUIZ'}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                QUESTION {currentQuestion.questionNumber} / {totalQuestions}
              </h2>
            </div>

            {/* Huge Timer */}
            <div
              className={`font-mono text-5xl md:text-7xl font-extrabold tracking-tight px-6 py-2 rounded-lg border-2 ${
                remainingSeconds <= 5
                  ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                  : 'bg-slate-50 text-slate-900 border-slate-300'
              }`}
            >
              {formatTimer(remainingSeconds)}
            </div>
          </div>

          {/* Question Text: Massive typography for 1920x1080 visibility */}
          <div className="py-10 md:py-16">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-slate-900 leading-tight">
              {currentQuestion.questionText}
            </h1>
          </div>

          {/* 4 Options Grid: High Contrast, Very Large */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-6 p-6 md:p-8 bg-slate-50 border-2 border-slate-300 rounded-xl"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-blue-600 text-white rounded-lg flex items-center justify-center font-extrabold text-2xl md:text-3xl">
                  {optionLabels[idx]}
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-medium text-slate-900 leading-snug">
                  {option}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATE 3: ENDED (Awaiting result publication) */}
      {status === 'ENDED' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto">
          <div className="space-y-4">
            <span className="text-xl md:text-2xl font-bold tracking-widest text-blue-600 uppercase">
              {quiz?.title || 'COLLEGE LIVE QUIZ'}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
              QUIZ CONCLUDED
            </h1>
            <p className="text-2xl md:text-3xl text-slate-600 font-normal">
              Calculating official results from submitted responses...
            </p>
          </div>

          <div className="inline-flex items-center space-x-3 text-slate-500 text-xl font-mono">
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
            <span>Final results will be displayed shortly.</span>
          </div>
        </div>
      )}

      {/* STATE 4: RESULTS PUBLISHED (Leaderboard Display) */}
      {status === 'RESULTS_PUBLISHED' && (
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full space-y-8">
          <div className="text-center space-y-2 pb-6 border-b-2 border-slate-200">
            <span className="text-lg md:text-xl font-bold tracking-widest text-blue-600 uppercase">
              {quiz?.title || 'COLLEGE LIVE QUIZ'}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900">
              OFFICIAL FINAL LEADERBOARD
            </h1>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-2xl">
              No results recorded yet.
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-300 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-lg md:text-xl uppercase tracking-wider border-b border-slate-300">
                    <th className="py-4 px-6 w-24 text-center">Rank</th>
                    <th className="py-4 px-6">Participant Name</th>
                    <th className="py-4 px-6">Roll Number</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6 text-right">Score</th>
                    <th className="py-4 px-6 text-right">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xl md:text-2xl">
                  {results.slice(0, 10).map((r, idx) => (
                    <tr
                      key={r.id}
                      className={
                        idx === 0
                          ? 'bg-amber-50/70 font-semibold'
                          : idx === 1
                          ? 'bg-slate-100/70 font-semibold'
                          : idx === 2
                          ? 'bg-orange-50/50 font-semibold'
                          : 'bg-white'
                      }
                    >
                      <td className="py-4 px-6 text-center font-mono font-bold">
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${r.rank}`}
                      </td>
                      <td className="py-4 px-6 text-slate-900 font-bold">{r.name}</td>
                      <td className="py-4 px-6 text-slate-600 font-mono">{r.rollNumber}</td>
                      <td className="py-4 px-6 text-slate-600">{r.department}</td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-blue-600">
                        {r.score} / {r.totalQuestions}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                        {r.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bottom subtle event footer */}
      <footer className="pt-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-400">
        <span>COLLEGE AUDITORIUM LIVE DISPLAY SYSTEM</span>
        <span>SYNCHRONIZED VIA FIRESTORE</span>
      </footer>
    </div>
  );
};
