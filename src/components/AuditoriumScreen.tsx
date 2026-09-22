import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, ArrowLeft, Users } from 'lucide-react';
import { Quiz } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuditoriumScreenProps {
  quiz: Quiz;
  onBackToAdmin: () => void;
}

export function AuditoriumScreen({ quiz, onBackToAdmin }: AuditoriumScreenProps) {
  const [currentIdx, setCurrentIdx] = useState(quiz.currentQuestionIndex || 0);
  const [timeLeft, setTimeLeft] = useState(quiz.timerSeconds || 15);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const question = quiz.questions[currentIdx] || quiz.questions[0];
  const totalQuestions = quiz.totalQuestions || quiz.questions.length;

  const broadcastQuestionChange = (idx: number) => {
    if (isSupabaseConfigured && supabase) {
      supabase.channel('quiz_live').send({
        type: 'broadcast',
        event: 'question-change',
        payload: { questionIndex: idx },
      });
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (currentIdx + 1 < totalQuestions) {
              const nextIdx = currentIdx + 1;
              setCurrentIdx(nextIdx);
              broadcastQuestionChange(nextIdx);
              return quiz.timerSeconds || 15;
            } else {
              setIsFinished(true);
              setIsPlaying(false);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isFinished, currentIdx, totalQuestions, quiz.timerSeconds]);

  const handleNext = () => {
    if (currentIdx + 1 < totalQuestions) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeLeft(quiz.timerSeconds || 15);
      broadcastQuestionChange(nextIdx);
    } else {
      setIsFinished(true);
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 lg:p-12">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Exit to Admin
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-blue-400 uppercase">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Auditorium & Projector Live Display Screen (No Answers Shown)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Live College Session Active</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Quiz' : 'Resume Quiz'}
            >
              {isPlaying ? <Pause className="w-5 h-5 text-amber-400" /> : <Play className="w-5 h-5 text-emerald-400" />}
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Next Question"
            >
              <SkipForward className="w-5 h-5 text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Auditorium Stage */}
      <div className="max-w-5xl mx-auto w-full my-auto py-8">
        {isFinished ? (
          <div className="text-center space-y-6 bg-slate-900 border border-slate-800 p-12 rounded-3xl shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              🏆
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Quiz Completed Successfully!</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">
              All questions have been presented. Check the Admin Portal Leaderboard for final scores and analytics.
            </p>
            <button
              onClick={onBackToAdmin}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              Return to Admin Dashboard
            </button>
          </div>
        ) : question ? (
          <div className="space-y-8">
            
            {/* Question Header & Timer */}
            <div className="flex items-center justify-between">
              <span className="px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full">
                Question {currentIdx + 1} of {totalQuestions}
              </span>

              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Time Remaining:</span>
                <span className={`text-lg font-mono font-bold ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Question Card - NOTE: NO CORRECT ANSWERS SHOWN IN AUDITORIUM */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-relaxed mb-8">
                {question.questionText}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {question.options.map((option, idx) => {
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border bg-slate-950/60 border-slate-800 text-slate-300 text-base font-medium flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl">
            <h3 className="text-xl font-bold text-slate-300">No Questions Found</h3>
            <p className="text-sm text-slate-500 mt-2">Add questions in the Admin Portal to start the live quiz.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6">
        <span>College Live Event Broadcasting System (Auditorium Display)</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Supabase Realtime Sync Active
        </span>
      </div>

    </div>
  );
}
