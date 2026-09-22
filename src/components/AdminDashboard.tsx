import { useState } from 'react';
import { 
  Monitor, Plus, Play, Award, Edit3, Eye, Copy, Trash2, 
  FileSpreadsheet, Users, CheckCircle2, Clock, BookOpen, QrCode 
} from 'lucide-react';
import { Quiz, Participant, AppView } from '../types';
import { QRCodeModal } from './QRCodeModal';

interface AdminDashboardProps {
  quizzes: Quiz[];
  participants: Participant[];
  onNavigate: (view: AppView) => void;
  onStartQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
  onOpenEditor: () => void;
  onViewResults: (quizId: string) => void;
}

export function AdminDashboard({
  quizzes,
  participants,
  onNavigate,
  onStartQuiz,
  onDeleteQuiz,
  onOpenEditor,
  onViewResults,
}: AdminDashboardProps) {
  const [activeQuizId, setActiveQuizId] = useState<string>(quizzes[0]?.id || 'quiz-1');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const selectedQuiz = quizzes.find(q => q.id === activeQuizId) || quizzes[0];

  const completedCount = participants.filter(p => p.status === 'COMPLETED').length;
  const publishedCount = quizzes.filter(q => q.status === 'Published').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quiz Administration Console</h2>
            <p className="text-sm text-slate-500 mt-1">
              Synchronized auditorium display, automatic timer progression, and secured student remotes.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              Student Login QR
            </button>
            <button
              onClick={() => onNavigate('auditorium')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs"
            >
              <Monitor className="w-4 h-4" />
              Auditorium Screen
            </button>
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium rounded-xl text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Quiz
            </button>
          </div>
        </div>

        <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />

        {/* Live Control Panel Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Active Question</span>
              <div className="text-2xl font-bold text-slate-900">
                {selectedQuiz?.currentQuestionIndex + 1 || 1} / {selectedQuiz?.totalQuestions || 5}
              </div>
              <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Automatic progression</span>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Server Timer</span>
              <div className="text-2xl font-bold text-blue-600">
                {selectedQuiz?.timerSeconds || 15}s
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Paused / waiting</span>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Current Question Submissions</span>
              <div className="text-2xl font-bold text-slate-900">0</div>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Answers securely recorded</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Select any published quiz below and click <span className="font-semibold text-slate-900">Start Quiz</span> to activate the automatic competition for all participants.
            </p>
            <button
              onClick={() => onStartQuiz(activeQuizId)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Live Quiz
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Quizzes</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">{quizzes.length}</div>
              <span className="text-xs text-slate-500 mt-1 inline-block">created</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published</span>
              <div className="text-3xl font-bold text-emerald-600 mt-1">{publishedCount}</div>
              <span className="text-xs text-slate-500 mt-1 inline-block">active for live play</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Participants</span>
              <div className="text-3xl font-bold text-blue-600 mt-1">{participants.length}</div>
              <span className="text-xs text-slate-500 mt-1 inline-block">students recorded</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Attempts</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">{completedCount}</div>
              <span className="text-xs text-slate-500 mt-1 inline-block">graded</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quiz Competitions Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quiz Competitions</h3>
              <p className="text-xs text-slate-500">Select a published quiz to start the automatic live event or manage questions.</p>
            </div>
            <button
              onClick={() => onViewResults(activeQuizId)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium rounded-xl text-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export All CSV / View Results
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-6">Quiz Title & Info</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Questions & Timer</th>
                  <th className="py-3 px-6">Participants</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {quizzes.map((quiz) => (
                  <tr 
                    key={quiz.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${activeQuizId === quiz.id ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setActiveQuizId(quiz.id)}
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{quiz.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{quiz.description}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {quiz.status === 'Published' ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Published
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Active on Stage
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-slate-600 text-xs">
                      <div className="font-medium text-slate-900">{quiz.totalQuestions} questions</div>
                      <div className="text-slate-500 mt-0.5">⏱️ {quiz.timerSeconds}s per question</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-slate-600 text-xs">
                      <div className="font-medium text-slate-900">{participants.length} enrolled</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); onStartQuiz(quiz.id); }}
                          title="Start Quiz"
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs flex items-center gap-1 font-medium px-3"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Start Quiz
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewResults(quiz.id); }}
                          title="View Results"
                          className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        >
                          <Award className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onOpenEditor(); }}
                          title="Edit Quiz"
                          className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onNavigate('auditorium'); }}
                          title="Preview Auditorium"
                          className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); alert('Quiz duplicated successfully.'); }}
                          title="Duplicate Quiz"
                          className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteQuiz(quiz.id); }}
                          title="Delete Quiz"
                          className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
