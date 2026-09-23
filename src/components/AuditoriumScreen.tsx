import { useState, useEffect } from 'react';
import { Monitor, Users, Clock, Award, Sparkles, Maximize2 } from 'lucide-react';
import { Quiz, Participant } from '../types';

interface AuditoriumScreenProps {
  quiz: Quiz;
  participants: Participant[];
  onBackToAdmin: () => void;
}

export function AuditoriumScreen({ quiz, participants, onBackToAdmin }: AuditoriumScreenProps) {
  const [timeLeft, setTimeLeft] = useState(quiz.timerSeconds || 30);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentIdx = quiz.currentQuestionIndex || 0;
  const question = quiz.questions[currentIdx] || quiz.questions[0];
  const totalQuestions = quiz.totalQuestions || quiz.questions.length;

  // Countdown timer for live quiz
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quiz.status === 'LIVE' && question) {
      setTimeLeft(question.durationSeconds || quiz.timerSeconds || 30);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quiz.status, currentIdx, quiz.timerSeconds]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // 1. WAITING STATE
  if (quiz.status === 'DRAFT' || quiz.status === 'SCHEDULED' || quiz.status === 'RESET') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <button
            onClick={onBackToAdmin}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
          >
            Exit to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" /> Fullscreen
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-widest uppercase">
            <Sparkles className="w-4 h-4 animate-spin" /> College Live Auditorium Display
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            {quiz.title}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {quiz.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto pt-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <span className="text-xs uppercase font-semibold text-slate-400">Live Participants</span>
              <div className="text-4xl font-black text-emerald-400 mt-2 flex items-center justify-center gap-2">
                <Users className="w-8 h-8" /> {participants.length}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <span className="text-xs uppercase font-semibold text-slate-400">Scheduled Time</span>
              <div className="text-lg font-bold text-white mt-2">
                {quiz.scheduledStartTime ? new Date(quiz.scheduledStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Awaiting Host'}
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div className="inline-block px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-base font-bold animate-pulse">
              ⏳ WAITING FOR QUIZ TO START
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 border-t border-slate-900 pt-6">
          Auditorium Public Projector Mode • Real-time synchronization active
        </div>
      </div>
    );
  }

  // 2. RESULTS PUBLISHED STATE (FINAL LEADERBOARD)
  if (quiz.status === 'RESULTS_PUBLISHED') {
    const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex flex-col justify-between p-8 sm:p-12">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">FINAL LEADERBOARD • {quiz.title}</h2>
          </div>
          <button
            onClick={onBackToAdmin}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer"
          >
            Exit
          </button>
        </div>

        <div className="max-w-4xl mx-auto w-full my-auto py-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Roll Number</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-base">
                {sorted.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-amber-400">
                      {idx === 0 ? '🏆 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">{p.name}</td>
                    <td className="py-4 px-6 font-mono text-sm text-slate-400">{p.rollNumber}</td>
                    <td className="py-4 px-6 text-slate-300">{p.department}</td>
                    <td className="py-4 px-6 text-right font-extrabold text-emerald-400 text-lg">
                      {p.totalScore} / {totalQuestions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 border-t border-slate-900 pt-6">
          Auditorium Final Rankings • Official College Results
        </div>
      </div>
    );
  }

  // 3. LIVE QUIZ STATE
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToAdmin}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer"
          >
            Exit
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-blue-400 uppercase">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-400">Auditorium Live Display Screen</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">{participants.length} Active Participants</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Question Auditorium Stage */}
      <div className="max-w-5xl mx-auto w-full my-auto py-8 space-y-8">
        {question ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="px-5 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-bold uppercase tracking-widest rounded-full">
                Question {currentIdx + 1} of {totalQuestions}
              </span>

              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Time Remaining:</span>
                <span className={`text-2xl font-mono font-extrabold ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-relaxed mb-10">
                {question.questionText}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {question.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border bg-slate-950 border-slate-800 text-white text-lg font-semibold flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-sm">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
            <h3 className="text-2xl font-bold text-slate-300">Awaiting question broadcast...</h3>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-6">
        <span>College Live Auditorium Display • Read-Only Mode</span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          Firebase Realtime Sync Active
        </span>
      </div>

    </div>
  );
}
