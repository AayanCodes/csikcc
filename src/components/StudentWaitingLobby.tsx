import { useEffect, useState } from 'react';
import { Clock, ShieldCheck, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { Participant, Quiz } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

  // Target start time from quiz or default to 5 minutes from now
  const targetTime = quiz.scheduledStartTime ? new Date(quiz.scheduledStartTime).getTime() : Date.now() + 5 * 60 * 1000;

  // Check quiz status automatically. If quiz becomes Active or Published, enter quiz automatically!
  useEffect(() => {
    if (quiz.status === 'Active' || quiz.status === 'Published') {
      const timer = setTimeout(() => {
        onEnterQuiz();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quiz.status, onEnterQuiz]);

  // Subscribe to Supabase Realtime channel `quiz_live` to transition instantly when admin starts
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const currentSupabase = supabase;
    const channel = currentSupabase.channel('quiz_live');

    channel
      .on('broadcast', { event: 'quiz-update' }, (payload) => {
        if (payload.payload && (payload.payload as any).quizzes) {
          const updatedQuizzes = (payload.payload as any).quizzes;
          const currentQ = updatedQuizzes.find((q: Quiz) => q.id === quiz.id);
          if (currentQ && (currentQ.status === 'Active' || currentQ.status === 'Published')) {
            onEnterQuiz();
          }
        }
      })
      .subscribe();

    return () => {
      currentSupabase.removeChannel(channel);
    };
  }, [quiz.id, onEnterQuiz]);

  // Live Countdown Timer based on actual timestamp difference
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        if (hours > 0) {
          setCountdown(`${hours}h ${mins}m ${secs}s remaining`);
        } else {
          setCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} remaining`);
        }
      } else {
        setCountdown('Event Time Reached - Awaiting Host Start Signal');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-900 via-slate-800 to-blue-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-white">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Waiting Lobby & Quiz Synchronizer
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {quiz.title}
          </h1>
          <p className="text-slate-400 text-sm">
            {quiz.description}
          </p>
        </div>

        {/* Participant & Waiting Card */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Participant Credentials */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Logged-in Participant</p>
              <h3 className="text-base font-bold text-white mt-0.5">{participant?.name || 'Student'}</h3>
              <p className="text-xs text-blue-400 font-mono mt-0.5">Roll: {participant?.rollNumber || 'N/A'} • {participant?.department || 'General'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Schedule & Timing Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-950/40 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 rounded-lg text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-blue-300 font-medium">Scheduled Start Time</p>
                  <p className="text-sm font-bold text-white">
                    {quiz.scheduledStartTime ? new Date(quiz.scheduledStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'As Scheduled by Organizer'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
                  {countdown}
                </span>
              </div>
            </div>

            {/* Live Status Indicator */}
            <div className="text-center py-6 px-4 bg-slate-900/40 border border-slate-700/40 rounded-xl space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-amber-400 animate-ping absolute" />
                <div className="w-3 h-3 rounded-full bg-amber-400 relative" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Waiting for organizer to commence the challenge...</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Please keep this screen open. When the admin starts the quiz, your screen will switch automatically without refreshing.
              </p>
            </div>
          </div>

          {/* Manual Entry / Change details */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={onBackToRegistration}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Change Details
            </button>
            <button
              onClick={onEnterQuiz}
              className="flex-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> Enter Quiz Now
            </button>
          </div>

        </div>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secured Live Quiz Synchronizer • College Proctoring System
        </div>
      </div>
    </div>
  );
}
