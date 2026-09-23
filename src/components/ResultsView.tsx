import { useState } from 'react';
import { ArrowLeft, Download, Search, Award, CheckCircle2 } from 'lucide-react';
import { Participant, Quiz } from '../types';

interface ResultsViewProps {
  quiz: Quiz;
  participants: Participant[];
  onBack: () => void;
  onPublishResults: () => void;
}

export function ResultsView({ quiz, participants, onBack, onPublishResults }: ResultsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Sort participants by score descending
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
  const filtered = sorted.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completed = participants.filter(p => p.status === 'COMPLETED');
  const avgScore = completed.length > 0 
    ? (completed.reduce((acc, p) => acc + p.totalScore, 0) / completed.length).toFixed(1)
    : '0';
  const topScore = participants.length > 0 ? Math.max(...participants.map(p => p.totalScore)) : 0;

  const handleExportCSV = () => {
    const headers = ['Rank', 'Name', 'Roll Number', 'Department', 'Correct', 'Wrong', 'Unanswered', 'Score', 'Percentage', 'Status'];
    const rows = sorted.map((p, idx) => [
      idx + 1,
      p.name,
      p.rollNumber,
      p.department,
      p.correctCount,
      p.wrongCount,
      p.unansweredCount,
      `${p.totalScore}/${quiz.totalQuestions}`,
      `${((p.totalScore / (quiz.totalQuestions || 1)) * 100).toFixed(1)}%`,
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quiz_leaderboard_${quiz.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leaderboard & Final Results</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quiz: {quiz.title} • Status: {quiz.status}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onPublishResults}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Publish Results for Students
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{participants.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">{avgScore}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Highest Score</span>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{topScore}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student or roll number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-6">Participant Name</th>
                <th className="py-3.5 px-6">Roll Number</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6 text-center">Correct</th>
                <th className="py-3.5 px-6 text-center">Wrong</th>
                <th className="py-3.5 px-6">Score</th>
                <th className="py-3.5 px-6">Percentage</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((p, idx) => {
                const percentage = ((p.totalScore / (quiz.totalQuestions || 1)) * 100).toFixed(1) + '%';
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-700">
                      {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">{p.name}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">{p.rollNumber}</td>
                    <td className="py-4 px-6 text-slate-700">{p.department}</td>
                    <td className="py-4 px-6 text-center font-bold text-emerald-600">{p.correctCount}</td>
                    <td className="py-4 px-6 text-center font-bold text-rose-600">{p.wrongCount}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{p.totalScore} / {quiz.totalQuestions}</td>
                    <td className="py-4 px-6 font-mono text-slate-700">{percentage}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
