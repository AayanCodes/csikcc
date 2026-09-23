import React, { useState } from 'react';
import { GraduationCap, User, Hash, BookOpen, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Participant, Quiz, AppView } from '../types';

interface StudentRegistrationProps {
  quiz: Quiz;
  onRegister: (participant: Participant) => void;
  onNavigate: (view: AppView) => void;
}

export function StudentRegistration({ quiz, onRegister, onNavigate }: StudentRegistrationProps) {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNumber.trim() || !department.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    const participant: Participant = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      department: department.trim(),
      email: email.trim(),
      status: 'WAITING',
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: 0,
      totalScore: 0,
    };

    try {
      await onRegister(participant);
      onNavigate('student-waiting');
    } catch (err: any) {
      setError('Registration failed. Please check your network and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-8">
        
        {/* Top Info */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mx-auto">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            {quiz ? quiz.title : 'College Live Quiz Portal'}
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {quiz ? quiz.description : 'Enter your student credentials to join the live academic competition.'}
          </p>
          {quiz && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-xs">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> {quiz.totalQuestions} Questions
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-xs">
                ⏱️ {quiz.timerSeconds}s per question
              </span>
            </div>
          )}
        </div>

        {/* Registration Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">Student Registration</h3>
            <p className="text-xs text-slate-500 mt-0.5">Please provide your official student details.</p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                College Roll Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  placeholder="e.g. CS2026-105"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Department / Branch <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-xs transition-colors text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Enter Waiting Lobby'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> College Examination System
            </span>
            <button
              onClick={() => onNavigate('admin-login')}
              className="font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
