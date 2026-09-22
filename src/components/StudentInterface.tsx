import { useState, useEffect } from 'react';
import { Quiz, Participant } from '../types';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isFinished && !isSubmitted) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimeUp(true);
            // Move to next question automatically after 2 seconds
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
    if (isSubmitted || isTimeUp || isFinished) return;
    setSelectedOption(idx);
    setIsSubmitted(true);

    const isCorrect = idx === question.correctOptionIndex;
    onRecordAnswer(question.questionNumber, idx, isCorrect);

    // Automatically advance after 1.5s
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
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors"
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
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-xs flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className="text-center">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            {participant.name} ({participant.rollNumber})
          </div>
          <div className="text-[11px] text-slate-400">{participant.department}</div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className={`text-sm font-bold ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Main Student Remote Body */}
      <div className="max-w-xl mx-auto w-full my-auto py-8 space-y-6">
        {isFinished ? (
          <div className="bg-slate-800/90 border border-slate-700 p-8 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-white">Quiz Finished</h2>
            <p className="text-slate-300 text-sm">
              Thank you for participating. Your response has been securely recorded.
            </p>
            <button
              onClick={onBackToRegistration}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs transition-colors"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Title & Question number */}
            <div className="text-center space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight uppercase">
                {quiz.title}
              </h1>
              <p className="text-xs font-semibold text-blue-400">
                Question {currentIdx + 1} / {totalQuestions}
              </p>
            </div>

            {/* VERY IMPORTANT: NO QUESTION TEXT IS SENT OR DISPLAYED HERE */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400">
                🔒 Protected Auditorium Stream: Follow the projector screen for the question prompt. Select your answer below.
              </span>
            </div>

            {/* Status alerts */}
            {isTimeUp && (
              <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-center font-bold text-sm animate-bounce">
                Time's up! Moving to next question...
              </div>
            )}

            {isSubmitted && !isTimeUp && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-center font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Answer submitted successfully. Loading next...
              </div>
            )}

            {/* Answer Options [ A ] [ B ] [ C ] [ D ] */}
            <div className="grid grid-cols-1 gap-3.5">
              {question.options.map((option, idx) => {
                const optLetter = ['A', 'B', 'C', 'D'][idx];
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    disabled={isSubmitted || isTimeUp}
                    onClick={() => handleSelectOption(idx)}
                    className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg ring-2 ring-blue-400/50'
                        : 'bg-slate-800/90 border-slate-700 text-slate-100 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl font-black text-lg flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-white text-blue-600 border-white' : 'bg-slate-900 text-blue-400 border-slate-700'
                    }`}>
                      {optLetter}
                    </div>
                    <div className="text-base font-medium flex-1">
                      {option}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
        Secure Student Remote • Anti-Cheat Verification Enabled
      </div>

    </div>
  );
}
