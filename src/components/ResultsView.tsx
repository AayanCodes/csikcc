import { useState } from 'react';
import { ArrowLeft, Download, Search, ShieldCheck, Eye } from 'lucide-react';
import { Participant, Quiz } from '../types';

interface ResultsViewProps {
  quiz: Quiz;
  participants: Participant[];
  onBack: () => void;
}

export function ResultsView({ quiz, participants, onBack }: ResultsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedParticipants = participants.filter(p => p.status === 'COMPLETED');
  const completedCount = completedParticipants.length;
  const avgScore = completedParticipants.length > 0 
    ? (completedParticipants.reduce((acc, p) => acc + p.totalScore, 0) / completedParticipants.length).toFixed(1)
    : '4.0';
  const topScore = participants.length > 0 ? Math.max(...participants.map(p => p.totalScore)) : 5;

  const handleExportCSV = () => {
    const headers = ['Name', 'Roll Number', 'Department', 'Email', 'Correct', 'Wrong', 'Unanswered', 'Total Score', 'Percentage', 'Status', 'Completion Time'];
    const rows = participants.map(p => [
      p.name,
      p.rollNumber,
      p.department,
      p.email || 'N/A',
      p.correctCount,
      p.wrongCount,
      p.unansweredCount,
      `${p.totalScore}/${quiz.totalQuestions}`,
      `${((p.totalScore / quiz.totalQuestions) * 100).toFixed(1)}%`,
      p.status,
      p.completionTime || 'In Progress'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quiz_results_${quiz.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">Participant Results & Scores</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin-Only Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Quiz: {quiz.title}</p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Results as CSV
          </button>
        </div>

        {/* 4 Summary Cards matching screenshot 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</span>
            <div className="text-4xl font-extrabold text-white mt-2">{participants.length}</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="text-4xl font-extrabold text-emerald-400 mt-2">{completedCount}</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Score</span>
            <div className="text-4xl font-extrabold text-blue-400 mt-2">{avgScore}</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Top Score</span>
            <div className="text-4xl font-extrabold text-amber-400 mt-2">{topScore}</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or roll number..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Submissions</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>
        </div>

        {/* Results Table matching Screenshot 1 */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-700">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Department / Email</th>
                  <th className="py-3 px-4 text-center">Correct</th>
                  <th className="py-3 px-4 text-center">Wrong</th>
                  <th className="py-3 px-4 text-center">Unanswered</th>
                  <th className="py-3 px-4">Total Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Completion Time</th>
                  <th className="py-3 px-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-xs text-slate-300">
                {filteredParticipants.map((p, idx) => {
                  const percentage = ((p.totalScore / quiz.totalQuestions) * 100).toFixed(1) + '%';
                  return (
                    <tr key={p.id} className="hover:bg-slate-800 transition-colors">
                      <td className="py-4 px-4 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-4 px-4 font-semibold text-white">{p.name}</td>
                      <td className="py-4 px-4 font-mono text-slate-400">{p.rollNumber}</td>
                      <td className="py-4 px-4">
                        <div className="text-white">{p.department}</div>
                        {p.email && <div className="text-[11px] text-slate-400">{p.email}</div>}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          {p.correctCount}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                          {p.wrongCount}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-slate-300 font-bold">
                          {p.unansweredCount}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {p.totalScore} / {quiz.totalQuestions}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-300">{percentage}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {p.status === 'COMPLETED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            COMPLETED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            IN_PROGRESS
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-slate-400 text-[11px] whitespace-pre-line">
                        {p.completionTime || 'In Progress'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => alert(`Participant Details:\nName: ${p.name}\nRoll: ${p.rollNumber}\nScore: ${p.totalScore}/${quiz.totalQuestions}\nDepartment: ${p.department}`)}
                          className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors inline-flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
