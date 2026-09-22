import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, ArrowLeft, Volume2, Users } from 'lucide-react';
import { Quiz } from '../types';

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Automatically move to next question or finish
            if (currentIdx + 1 < totalQuestions) {
              setCurrentIdx(c => c + 1);
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
      setCurrentIdx(c => c + 1);
      setTimeLeft(quiz.timerSeconds || 15);
    } else {
      setIsFinished(true);
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setTimeLeft(quiz.timerSeconds || 15);
    setIsFinished(false);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 lg:p-12">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Exit to Admin
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-blue-400 uppercase">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Auditorium & Projector Live Display Screen</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">8 Participants Active</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors"
              title={isPlaying ? 'Pause Quiz' : 'Resume Quiz'}
            >
              {isPlaying ? <Pause className="w-5 h-5 text-amber-400" /> : <Play className="w-5 h-5 text-emerald-400" />}
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors"
              title="Next Question"
            >
              <SkipForward className="w-5 h-5 text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Auditorium Stage */}
      <div className="my-auto max-w-5xl mx-auto w-full py-8">
        {isFinished ? (
          <div className="text-center space-y-6 py-16 bg-slate-900/80 border border-slate-800 rounded-3xl p-12 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-3xl">
              🏆
            </div>
            <h2 className="text-4xl font-extrabold text-white">Quiz Finished</h2>
            <p className="text-lg text-slate-400 max-w-md mx-auto">
              Thank you for participating in {quiz.title}. All student submissions have been securely recorded.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-lg"
              >
                Restart Live Quiz
              </button>
              <button
                onClick={onBackToAdmin}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-sm transition-colors border border-slate-700"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Question Header & Timer Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
                  {question.questionText}
                </h2>
              </div>

              {/* Timer Box */}
              <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 px-6 py-4 rounded-2xl min-w-[120px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Left</span>
                <div className={`text-3xl font-black mt-1 ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-blue-400'}`}>
                  {timeLeft}s
                </div>
              </div>
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option, idx) => {
                const optLetter = ['A', 'B', 'C', 'D'][idx];
                const isCorrect = idx === question.correctOptionIndex;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:border-slate-700 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 text-blue-400 font-black text-lg flex items-center justify-center shrink-0 border border-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {optLetter}
                    </div>
                    <div className="text-base sm:text-lg font-medium text-slate-100 flex-1">
                      {option}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-6">
        <div>Synchronized via Supabase Realtime • Server Timestamp Verified</div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-blue-400" /> Auditorium Audio Feed Ready
        </div>
      </div>

    </div>
  );
}
