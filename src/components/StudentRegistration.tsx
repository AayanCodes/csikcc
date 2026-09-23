import React, { useState } from 'react';
import { Quiz, Participant } from '../types';
import { registerStudent } from '../lib/quizService';

interface StudentRegistrationProps {
  quiz: Quiz | null;
  quizzes?: Quiz[];
  onSelectQuiz?: (quizId: string) => void;
  onRegistered: (participant: Participant) => void;
  onBackToHome: () => void;
  isAdmin?: boolean;
  onReturnToAdmin?: () => void;
}

export const StudentRegistration: React.FC<StudentRegistrationProps> = ({
  quiz,
  quizzes = [],
  onSelectQuiz,
  onRegistered,
  onBackToHome,
  isAdmin,
  onReturnToAdmin,
}) => {
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedRoll = rollNumber.trim().toUpperCase();
    const trimmedDept = department.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your full name or team name.');
      return;
    }
    if (!trimmedRoll) {
      setErrorMsg('Please enter your roll number or student ID.');
      return;
    }
    if (!trimmedDept) {
      setErrorMsg('Please enter your department or branch/section.');
      return;
    }

    if (!quiz) {
      setErrorMsg('No active event selected or unable to connect to the quiz database.');
      return;
    }

    setIsSubmitting(true);
    try {
      const participant = await registerStudent(
        quiz.id,
        trimmedName,
        trimmedRoll,
        trimmedDept
      );
      onRegistered(participant);
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMsg('Unable to connect to the quiz database. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-6">
        {isAdmin && onReturnToAdmin && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <span>🛡️</span>
              <span>Admin Preview Mode</span>
            </div>
            <button
              onClick={onReturnToAdmin}
              className="text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
            >
              Back to Dashboard →
            </button>
          </div>
        )}

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 mb-2">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-block cursor-pointer"
            >
              ← Back to Home
            </button>
            {onReturnToAdmin && (
              <button
                onClick={onReturnToAdmin}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors inline-block cursor-pointer"
              >
                🛡️ Back to Admin
              </button>
            )}
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Registration
          </h2>

          {/* Event Badge & Switcher */}
          <div className="pt-1">
            <div className="inline-block bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 max-w-full">
              <span className="font-semibold text-slate-900">{quiz?.title || 'Selected Event'}</span>
              {quiz?.scheduledDate && (
                <span className="text-slate-500 ml-1.5">({quiz.scheduledDate} {quiz.scheduledTime})</span>
              )}
            </div>

            {quizzes.length > 1 && onSelectQuiz && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs">
                <span className="text-slate-500">Wrong event?</span>
                <select
                  value={quiz?.id || ''}
                  onChange={(e) => onSelectQuiz(e.target.value)}
                  className="px-2 py-0.5 border border-slate-300 rounded text-xs bg-white text-blue-700 font-medium cursor-pointer"
                >
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Team / Student Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Johnson or Cyber Knights"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="rollNumber"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Roll Number / Student ID
            </label>
            <input
              id="rollNumber"
              type="text"
              required
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. CS2026-084"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="department"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Department / Branch & Section
            </label>
            <input
              id="department"
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science - Sec A"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Registering...' : 'Enter Quiz Waiting Lobby →'}
          </button>
        </form>
      </div>
    </div>
  );
};
