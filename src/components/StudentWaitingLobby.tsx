import { useEffect, useState } from 'react';
import { Clock, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Participant, Quiz } from '../types';

interface StudentWaitingLobbyProps {
  quiz: Quiz;
  participant: Participant | null;
  onEnterQuiz: () => void;
  onBackToRegistration: () => void;
}

export function StudentWaitingLobby({
  quiz,
  participant,
  onEnterQuiz,
  onBackToRegistration,
}: StudentWaitingLobbyProps) {
  const [countdown, setCountdown] = useState<string>('Calculating...');

  const targetTime = quiz.scheduledStartTime ? new Date(quiz.scheduledStartTime).getTime() : Date.now() + 10 * 60 * 1000;

  // Automatically transition when quiz status becomes LIVE
  useEffect(() => {
    if (quiz.status === 'LIVE' || quiz.status === 'COMPLETED' || quiz.status === 'RESULTS_PUBLISHED') {
      onEnterQuiz();
    }
  }, [quiz.status, onEnterQuiz]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        if (hours > 0) {
          setCountdown(`${hours}h ${mins}m ${secs}s`);
        } else {
          setCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
      } else {
        setCountdown('00:00 (Awaiting Host Launch)');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Waiting Lobby
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {quiz.title}
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {quiz.description}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Participant Info */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Registered Student</p>
              <h3 className="text-base font-bold text-white mt-0.5">{participant?.name || 'Participant'}</h3>
              <p className="text-xs text-blue-400 font-mono mt-0.5">Roll: {participant?.rollNumber || 'N/A'} • {participant?.department || 'General'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Schedule & Countdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Scheduled Start</p>
                  <p className="text-sm font-bold text-white">
                    {quiz.scheduledStartTime ? new Date(quiz.scheduledStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Ready'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold font-mono">
                  {countdown}
                </span>
              </div>
            </div>

            <div className="text-center py-6 px-4 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-3">
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Waiting for Quiz to Start...</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                This screen will automatically transition to Question 1 as soon as the admin launches the quiz.
              </p>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={onBackToRegistration}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Change Details
            </button>
            <button
              onClick={onEnterQuiz}
              className="flex-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
            >
              Enter Quiz Screen
            </button>
          </div>

        </div>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> College Examination Synchronized Lobby
        </div>
      </div>
    </div>
  );
}
