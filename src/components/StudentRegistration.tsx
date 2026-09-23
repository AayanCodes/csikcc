import React, { useState } from 'react';
import { Quiz, Participant } from '../types';
import { registerStudent } from '../lib/quizService';

interface StudentRegistrationProps {
  quiz: Quiz | null;
  onRegistered: (participant: Participant) => void;
  onBackToHome: () => void;
}

export const StudentRegistration: React.FC<StudentRegistrationProps> = ({
  quiz,
  onRegistered,
  onBackToHome,
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
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!trimmedRoll) {
      setErrorMsg('Please enter your roll number.');
      return;
    }
    if (!trimmedDept) {
      setErrorMsg('Please enter your department.');
      return;
    }

    if (!quiz) {
      setErrorMsg('Unable to connect to the quiz database.');
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
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <button
            onClick={onBackToHome}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 inline-block cursor-pointer"
          >
            ← Back to Home
          </button>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Registration
          </h2>
          <p className="text-sm text-slate-600">
            {quiz?.title || 'College Live Quiz'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="rollNumber"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Roll Number
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
              Department
            </label>
            <input
              id="department"
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science & Engineering"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Registering...' : 'Enter Quiz Lobby'}
          </button>
        </form>
      </div>
    </div>
  );
};
