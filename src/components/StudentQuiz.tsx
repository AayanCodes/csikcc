import React, { useState, useEffect } from 'react';
import { Quiz, Question, QuizState, Participant, AnswerSubmission } from '../types';
import { submitStudentAnswer } from '../lib/quizService';

interface StudentQuizProps {
  quiz: Quiz;
  quizState: QuizState;
  currentQuestion: Question | null;
  totalQuestions: number;
  participant: Participant;
  existingAnswers: AnswerSubmission[];
}

export const StudentQuiz: React.FC<StudentQuizProps> = ({
  quiz,
  quizState,
  currentQuestion,
  totalQuestions,
  participant,
  existingAnswers,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Find if already submitted for this question
  const existingSubmission = currentQuestion
    ? existingAnswers.find(
        (a) =>
          a.questionNumber === currentQuestion.questionNumber &&
          a.participantId === participant.id
      )
    : undefined;

  // Sync selected option if already submitted
  useEffect(() => {
    if (existingSubmission) {
      setSelectedOption(existingSubmission.selectedOptionIndex);
    } else {
      setSelectedOption(null);
      setSubmissionError(null);
    }
  }, [currentQuestion?.questionNumber, existingSubmission]);

  // Authoritative countdown timer derived strictly from quizState.questionEndTime
  useEffect(() => {
    const updateTimer = () => {
      if (!quizState.questionEndTime || quizState.questionEndTime <= 0) {
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
  }, [quizState.questionEndTime]);

  const isTimerExpired = remainingSeconds <= 0;
  const isLocked = selectedOption !== null || Boolean(existingSubmission);

  const handleSelectOption = async (optionIndex: number) => {
    // If locked or timer expired or already submitting or no question, reject
    if (isLocked || isTimerExpired || isSubmitting || !currentQuestion) {
      return;
    }

    // Immediately lock the answer locally
    setSelectedOption(optionIndex);
    setSubmissionError(null);
    setIsSubmitting(true);

    const isCorrect = optionIndex === currentQuestion.correctOptionIndex;

    try {
      await submitStudentAnswer(
        quiz.id,
        currentQuestion.id,
        currentQuestion.questionNumber,
        participant.id,
        optionIndex,
        isCorrect
      );
    } catch (err) {
      console.error('Answer submission failed:', err);
      setSubmissionError('Your answer could not be saved. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-slate-700">Loading next question...</p>
        </div>
      </div>
    );
  }

  const totalDuration = quizState.durationSeconds || currentQuestion?.durationSeconds || 30;
  const percentRemaining = Math.max(0, Math.min(100, (remainingSeconds / totalDuration) * 100));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Header: Question Number & Authoritative Timer */}
        <div className="space-y-3 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
                QUESTION {currentQuestion.questionNumber} / {totalQuestions}
              </span>
            </div>

            {/* Authoritative Timer */}
            <div
              className={`font-mono text-2xl sm:text-3xl font-bold px-3.5 py-1 rounded border tracking-wider transition-colors flex items-center gap-2 ${
                remainingSeconds <= 5
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              <span className="text-base">⏱️</span>
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          </div>

          {/* Real-time Timer Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                remainingSeconds <= 5
                  ? 'bg-red-500 animate-pulse'
                  : remainingSeconds <= 10
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>

        {/* Error notification if submission failed */}
        {submissionError && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded flex items-center justify-between">
            <span>{submissionError}</span>
            <button
              onClick={() => setSelectedOption(null)}
              className="text-xs underline font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Anti-Cheating Question Display: Question Number Only */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wider uppercase">
            <span>🖥️</span>
            <span>Auditorium Synchronized Display</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Question {currentQuestion.questionNumber}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto">
            Please look at the main auditorium screen to view the question and choices. Select your response below:
          </p>
        </div>

        {/* Options to Choose: Option A, B, C, D */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {currentQuestion.options.map((_, idx) => {
            const isThisSelected = selectedOption === idx;
            const disabled = isLocked || isTimerExpired;
            const label = optionLabels[idx] || String(idx + 1);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={disabled}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center space-x-4 cursor-pointer disabled:cursor-not-allowed select-none ${
                  isThisSelected
                    ? 'bg-blue-600 border-blue-600 text-white font-medium shadow-md ring-2 ring-blue-400 ring-offset-2'
                    : disabled
                    ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    : 'bg-white border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800'
                }`}
              >
                <div
                  className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center font-extrabold text-xl transition-colors ${
                    isThisSelected
                      ? 'bg-white text-blue-600 shadow-xs'
                      : disabled
                      ? 'bg-slate-200 text-slate-500'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {label}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-lg sm:text-xl font-bold block ${
                      isThisSelected ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Option {label}
                  </span>
                  <span
                    className={`text-xs block ${
                      isThisSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {isThisSelected
                      ? 'Selected & Locked'
                      : disabled
                      ? 'Selection Closed'
                      : `Tap to choose Option ${label}`}
                  </span>
                </div>
                {isThisSelected && (
                  <div className="shrink-0 px-2.5 py-1 bg-white/20 border border-white/40 text-white rounded-md text-xs font-extrabold tracking-wider">
                    LOCKED ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Status notice */}
        <div className="text-center pt-2">
          {isLocked ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
              <span>✓</span>
              <span>
                Option {selectedOption !== null ? optionLabels[selectedOption] : ''} locked. Waiting for next question...
              </span>
            </div>
          ) : isTimerExpired ? (
            <p className="text-xs font-semibold text-red-600">
              Time has expired for Question {currentQuestion.questionNumber}. Options disabled.
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Tap Option A, B, C, or D to submit and lock your choice for Question {currentQuestion.questionNumber}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
