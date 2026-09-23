import React from 'react';
import { QuizResult } from '../types';

interface StudentResultProps {
  result: QuizResult | null;
  quizTitle: string;
  onBackToHome?: () => void;
}

export const StudentResult: React.FC<StudentResultProps> = ({
  result,
  quizTitle,
  onBackToHome,
}) => {
  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-slate-900">Quiz Completed</h2>
          <p className="text-sm text-slate-600">
            Your responses have been recorded. Waiting for the administrator to calculate and publish official results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-sm p-8 space-y-8">
        <div className="text-center space-y-2 border-b border-slate-100 pb-6">
          <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
            Official Examination Result
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {quizTitle}
          </h1>
        </div>

        {/* Student Identification */}
        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Name:</span>
            <span className="font-semibold text-slate-900">{result.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Roll Number:</span>
            <span className="font-mono font-semibold text-slate-900">{result.rollNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Department:</span>
            <span className="font-medium text-slate-900">{result.department}</span>
          </div>
        </div>

        {/* Score Breakdown Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Score
            </span>
            <span className="font-mono text-3xl font-bold text-slate-900">
              {result.score} / {result.totalQuestions}
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Percentage
            </span>
            <span className="font-mono text-3xl font-bold text-blue-600">
              {result.percentage}%
            </span>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-1">
              Correct Answers
            </span>
            <span className="font-mono text-2xl font-bold text-emerald-800">
              {result.correct}
            </span>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 block mb-1">
              Incorrect Answers
            </span>
            <span className="font-mono text-2xl font-bold text-red-700">
              {result.incorrect}
            </span>
          </div>
        </div>

        <div className="pt-2 text-center">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              ← Return to Main Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
