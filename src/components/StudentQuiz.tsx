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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Header: Question Number & Authoritative Timer */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
              QUESTION {currentQuestion.questionNumber} / {totalQuestions}
            </span>
          </div>

          {/* Authoritative Timer */}
          <div
            className={`font-mono text-2xl sm:text-3xl font-bold px-3.5 py-1 rounded border tracking-wider transition-colors ${
              remainingSeconds <= 5
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            {formatTimer(remainingSeconds)}
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

        {/* Question Text */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-medium text-slate-900 leading-relaxed">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* 4 Options */}
        <div className="grid grid-cols-1 gap-3.5">
          {currentQuestion.options.map((optionText, idx) => {
            const isThisSelected = selectedOption === idx;
            const disabled = isLocked || isTimerExpired;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={disabled}
                className={`w-full text-left p-4 sm:p-5 rounded-lg border transition-all flex items-center space-x-4 cursor-pointer disabled:cursor-not-allowed ${
                  isThisSelected
                    ? 'bg-blue-50 border-blue-600 text-blue-950 font-medium ring-1 ring-blue-600'
                    : disabled
                    ? 'bg-white border-slate-200 text-slate-400 opacity-80'
                    : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50/60 text-slate-800'
                }`}
              >
                <div
                  className={`w-8 h-8 shrink-0 rounded flex items-center justify-center font-bold text-sm ${
                    isThisSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {optionLabels[idx]}
                </div>
                <span className="text-base sm:text-lg flex-1">
                  {optionText}
                </span>
                {isThisSelected && (
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    LOCKED
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status notice */}
        <div className="text-center pt-2">
          {isLocked ? (
            <p className="text-xs font-medium text-slate-500">
              Answer locked. Waiting for administrator to advance to next question...
            </p>
          ) : isTimerExpired ? (
            <p className="text-xs font-semibold text-red-600">
              Time has expired for this question. Options disabled.
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Click an option to submit and lock your answer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
