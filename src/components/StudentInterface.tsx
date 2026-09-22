import { useState, useEffect } from 'react';
import { Quiz, Participant } from '../types';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface StudentInterfaceProps {
  quiz: Quiz;
  participant: Participant | null;
  onBackToRegistration: () => void;
  onRecordAnswer: (questionNumber: number, optionIndex: number, isCorrect: boolean) => void;
}

export function StudentInterface({ quiz, participant, onBackToRegistration, onRecordAnswer }: StudentInterfaceProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timerSeconds || 15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const question = quiz.questions[currentIdx] || quiz.questions[0];
  const totalQuestions = quiz.totalQuestions || quiz.questions.length;

  // Subscribe to Supabase Realtime channel `quiz_live` for instant question sync
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const currentSupabase = supabase;
    const channel = currentSupabase.channel('quiz_live');

    channel
      .on('broadcast', { event: 'question-change' }, (payload) => {
        if (payload.payload && typeof (payload.payload as any).questionIndex === 'number') {
          const newIdx = (payload.payload as any).questionIndex;
          setCurrentIdx(newIdx);
          setTimeLeft(quiz.timerSeconds || 15);
          setSelectedOption(null);
          setIsSubmitted(false);
          setIsTimeUp(false);
        }
      })
      .subscribe();

    return () => {
      currentSupabase.removeChannel(channel);
    };
  }, [quiz.timerSeconds]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isFinished && !isSubmitted) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimeUp(true);
            setTimeout(() => {
              if (currentIdx + 1 < totalQuestions) {
                setCurrentIdx(c => c + 1);
                setTimeLeft(quiz.timerSeconds || 15);
                setSelectedOption(null);
                setIsSubmitted(false);
                setIsTimeUp(false);
              } else {
                setIsFinished(true);
              }
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentIdx, totalQuestions, quiz.timerSeconds, isFinished, isSubmitted]);

  const handleSelectOption = (idx: number) => {
    if (isSubmitted || isTimeUp || isFinished || !question) return;
    setSelectedOption(idx);
    setIsSubmitted(true);

    const isCorrect = idx === question.correctOptionIndex;
    onRecordAnswer(question.questionNumber, idx, isCorrect);

    setTimeout(() => {
      if (currentIdx + 1 < totalQuestions) {
        setCurrentIdx(c => c + 1);
        setTimeLeft(quiz.timerSeconds || 15);
        setSelectedOption(null);
        setIsSubmitted(false);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  if (!participant) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">No Active Registration</h3>
          <p className="text-sm text-slate-600">Please register with your student credentials before entering the live session.</p>
          <button
            onClick={onBackToRegistration}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
          >
            Go to Student Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Top Student Header */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onBackToRegistration}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-xs flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-white">{participant.name}</h2>
          <p className="text-xs text-slate-400 font-mono">{participant.rollNumber} • {participant.department}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Main Student Remote Content */}
      <div className="max-w-xl mx-auto w-full my-auto py-6">
        {isFinished ? (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-6 shadow-xl">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              🎉
            </div>
            <h3 className="text-2xl font-extrabold text-white">Quiz Finished! Thank you for participating.</h3>
            <p className="text-sm text-slate-300">
              Your responses have been successfully submitted to the event database.
            </p>
            <button
              onClick={onBackToRegistration}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        ) : question ? (
          <div className="space-y-6">
            
            {/* Question Progress Header */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <span className="text-slate-400">
                {isSubmitted ? 'Answer Locked ✔️' : isTimeUp ? 'Time Up!' : 'Select Option [A, B, C, D]'}
              </span>
            </div>

            {/* Question Prompt */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {question.questionText}
              </h3>
            </div>

            {/* Options Buttons */}
            <div className="grid grid-cols-1 gap-3.5">
              {question.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                let btnStyle = 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700';

                if (isSubmitted) {
                  if (isSelected) {
                    btnStyle = 'bg-blue-600 border-blue-500 text-white shadow-lg';
                  } else {
                    btnStyle = 'bg-slate-800/50 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted || isTimeUp}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left font-medium text-sm flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {isSubmitted && isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-300" />
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-300">Waiting for Admin to Start Quiz</h3>
            <p className="text-xs text-slate-400 mt-2">The live session will begin as soon as the administrator launches the quiz.</p>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="max-w-xl mx-auto w-full pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Connected to Live Event</span>
        <span className="text-emerald-400 font-medium">Real-Time Sync Ready</span>
      </div>

    </div>
  );
}
