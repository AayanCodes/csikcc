import { useState, useEffect } from 'react';
import { Quiz, Participant } from '../types';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft, Award, BookOpen } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface StudentInterfaceProps {
  quiz: Quiz;
  participant: Participant | null;
  onBackToRegistration: () => void;
  onRecordAnswer: (questionNumber: number, optionIndex: number, isCorrect: boolean) => void;
}

export function StudentInterface({ quiz, participant, onBackToRegistration, onRecordAnswer }: StudentInterfaceProps) {
  const [currentIdx, setCurrentIdx] = useState(quiz.currentQuestionIndex || 0);
  const [timeLeft, setTimeLeft] = useState(quiz.timerSeconds || 30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const question = quiz.questions[currentIdx] || quiz.questions[0];
  const totalQuestions = quiz.totalQuestions || quiz.questions.length;

  // Sync current question index with quiz state
  useEffect(() => {
    if (typeof quiz.currentQuestionIndex === 'number' && quiz.currentQuestionIndex !== currentIdx) {
      setCurrentIdx(quiz.currentQuestionIndex);
      setTimeLeft(quiz.questions[quiz.currentQuestionIndex]?.durationSeconds || quiz.timerSeconds || 30);
      setSelectedOption(null);
      setIsSubmitted(false);
      setIsTimeUp(false);
    }
  }, [quiz.currentQuestionIndex]);

  // Question timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quiz.status === 'LIVE' && !isSubmitted && !isTimeUp && question) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quiz.status, currentIdx, isSubmitted, isTimeUp, question]);

  const handleSelectOption = async (idx: number) => {
    if (isSubmitted || isTimeUp || !question || !participant || submitting) return;
    setSelectedOption(idx);
    setIsSubmitted(true);
    setSubmitting(true);
    setError('');

    const isCorrect = idx === question.correctOptionIndex;

    try {
      // Save answer to Firestore `answers` collection
      await addDoc(collection(db, 'answers'), {
        participantId: participant.id,
        quizId: quiz.id,
        questionNumber: question.questionNumber,
        selectedOptionIndex: idx,
        isCorrect,
        submittedAt: new Date().toISOString()
      });

      onRecordAnswer(question.questionNumber, idx, isCorrect);
    } catch (err) {
      console.error('Error saving answer to Firestore:', err);
      setError('Failed to record answer on server. Stored locally.');
      onRecordAnswer(question.questionNumber, idx, isCorrect);
    } finally {
      setSubmitting(false);
    }
  };

  if (!participant) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">No Participant Session</h3>
          <p className="text-sm text-slate-600">Please register with your student credentials before joining the quiz.</p>
          <button
            onClick={onBackToRegistration}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  // IF QUIZ RESULTS PUBLISHED
  if (quiz.status === 'RESULTS_PUBLISHED') {
    const percentage = ((participant.totalScore / (totalQuestions || 1)) * 100).toFixed(1) + '%';
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Quiz Results Published</h2>
            <p className="text-xs text-slate-500 mt-1">Official assessment report for {participant.name}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Student Name:</span>
              <span className="font-bold text-slate-950">{participant.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Roll Number:</span>
              <span className="font-mono font-bold text-slate-950">{participant.rollNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Department:</span>
              <span className="font-bold text-slate-950">{participant.department}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Total Questions:</span>
              <span className="font-bold text-slate-950">{totalQuestions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Correct Answers:</span>
              <span className="font-bold text-emerald-600">{participant.correctCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Incorrect Answers:</span>
              <span className="font-bold text-rose-600">{participant.wrongCount}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold">
              <span className="text-slate-800">Final Score:</span>
              <span className="text-blue-600">{participant.totalScore} / {totalQuestions} ({percentage})</span>
            </div>
          </div>

          <button
            onClick={onBackToRegistration}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // IF QUIZ COMPLETED (WAITING FOR RESULTS PUBLISH)
  if (quiz.status === 'COMPLETED') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center max-w-md space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🏁
          </div>
          <h3 className="text-2xl font-extrabold text-white">Quiz Completed Successfully!</h3>
          <p className="text-sm text-slate-300">
            Your responses have been recorded successfully. Please wait for the instructor to publish final results.
          </p>
          <button
            onClick={onBackToRegistration}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Top Header */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="text-left">
          <h2 className="text-sm font-bold text-white">{participant.name}</h2>
          <p className="text-xs text-slate-400 font-mono">{participant.rollNumber} • {participant.department}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400 border border-slate-700">
          <Clock className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Main Student Question Content */}
      <div className="max-w-xl mx-auto w-full my-auto py-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {question ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <span className="text-slate-400">
                {isSubmitted ? 'Answer Submitted ✔️' : isTimeUp ? 'Time Expired!' : 'Select Option [A, B, C, D]'}
              </span>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {question.questionText}
              </h3>
            </div>

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
                    disabled={isSubmitted || isTimeUp || submitting}
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
                      <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-300">Waiting for next question...</h3>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-xl mx-auto w-full pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Connected to College Quiz</span>
        <span className="text-emerald-400 font-medium">Real-Time Sync Active</span>
      </div>

    </div>
  );
}
