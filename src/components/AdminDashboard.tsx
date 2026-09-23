import { useState } from 'react';
import { 
  Monitor, Plus, Play, Award, Edit3, Trash2, 
  Users, CheckCircle2, Clock, BookOpen, QrCode, BarChart3, RotateCcw, ArrowRight
} from 'lucide-react';
import { Quiz, Participant, AppView, QuizStatus } from '../types';
import { QRCodeModal } from './QRCodeModal';
import { QuizEditorModal } from './QuizEditorModal';
import { AdminParticipants } from './AdminParticipants';
import { AdminAnalytics } from './AdminAnalytics';
import { ResultsView } from './ResultsView';

interface AdminDashboardProps {
  quizzes: Quiz[];
  participants: Participant[];
  onNavigate: (view: AppView) => void;
  onUpdateQuizStatus: (quizId: string, status: QuizStatus, nextIdx?: number) => void;
  onDeleteQuiz: (quizId: string) => void;
  onSaveQuiz: (quiz: Quiz) => void;
  onResetQuiz: (quizId: string) => void;
}

export function AdminDashboard({
  quizzes,
  participants,
  onNavigate,
  onUpdateQuizStatus,
  onDeleteQuiz,
  onSaveQuiz,
  onResetQuiz,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quizzes' | 'participants' | 'analytics' | 'results'>('dashboard');
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizzes[0]?.id || '');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0] || {
    id: 'default',
    title: 'No Quiz Created',
    description: 'Please create your first college quiz.',
    status: 'DRAFT' as QuizStatus,
    currentQuestionIndex: 0,
    timerSeconds: 30,
    totalQuestions: 0,
    questions: [],
    scheduledStartTime: new Date().toISOString(),
    createdAt: new Date().toLocaleDateString(),
  };

  const waitingCount = participants.filter(p => p.status === 'WAITING' || p.status === 'LIVE').length;
  const completedCount = participants.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Admin Control Console</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage quizzes, control live questions, monitor waiting rooms, and publish results.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Student QR Code
            </button>
            <button
              onClick={() => onNavigate('auditorium')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
            >
              <Monitor className="w-4 h-4 text-blue-400" />
              Auditorium Screen
            </button>
            <button
              onClick={() => { setEditingQuiz(null); setIsEditorOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium rounded-xl text-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Quiz
            </button>
          </div>
        </div>

        <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
        <QuizEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSaveQuiz={onSaveQuiz}
          editingQuiz={editingQuiz}
        />

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard & Controls', icon: Monitor },
            { id: 'quizzes', label: `Quizzes (${quizzes.length})`, icon: BookOpen },
            { id: 'participants', label: `Participants (${participants.length})`, icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'results', label: 'Results & Leaderboard', icon: Award },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD & LIVE CONTROLS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Active Quiz Live Control Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Active Selected Quiz</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedQuiz.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    selectedQuiz.status === 'LIVE' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                    selectedQuiz.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    selectedQuiz.status === 'RESULTS_PUBLISHED' ? 'bg-purple-100 text-purple-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {selectedQuiz.status}
                  </span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Active Participants</span>
                  <div className="text-2xl font-extrabold text-blue-600 mt-1">{waitingCount}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Scheduled Time</span>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {selectedQuiz.scheduledStartTime ? new Date(selectedQuiz.scheduledStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Set'}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Current Question</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {selectedQuiz.status === 'LIVE' ? `${selectedQuiz.currentQuestionIndex + 1} / ${selectedQuiz.totalQuestions}` : 'Not Started'}
                  </div>
                </div>
              </div>

              {/* Admin Live Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <button
                  disabled={selectedQuiz.status === 'LIVE'}
                  onClick={() => onUpdateQuizStatus(selectedQuiz.id, 'LIVE', 0)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer ${
                    selectedQuiz.status === 'LIVE' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" /> Start Quiz Now
                </button>

                <button
                  disabled={selectedQuiz.status !== 'LIVE'}
                  onClick={() => {
                    const next = selectedQuiz.currentQuestionIndex + 1;
                    if (next < selectedQuiz.totalQuestions) {
                      onUpdateQuizStatus(selectedQuiz.id, 'LIVE', next);
                    } else {
                      onUpdateQuizStatus(selectedQuiz.id, 'COMPLETED', selectedQuiz.currentQuestionIndex);
                    }
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer ${
                    selectedQuiz.status !== 'LIVE' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  disabled={selectedQuiz.status !== 'LIVE'}
                  onClick={() => onUpdateQuizStatus(selectedQuiz.id, 'COMPLETED', selectedQuiz.currentQuestionIndex)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer ${
                    selectedQuiz.status !== 'LIVE' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  End Quiz
                </button>

                <button
                  disabled={selectedQuiz.status !== 'COMPLETED' && selectedQuiz.status !== 'LIVE'}
                  onClick={() => onUpdateQuizStatus(selectedQuiz.id, 'RESULTS_PUBLISHED')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer ${
                    (selectedQuiz.status !== 'COMPLETED' && selectedQuiz.status !== 'LIVE') ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Publish Results
                </button>

                <button
                  onClick={() => onResetQuiz(selectedQuiz.id)}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  title="Reset quiz state for practice or rerun"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Event
                </button>
              </div>
            </div>

            {/* Quick Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Total Quizzes</span>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">{quizzes.length}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Total Participants</span>
                  <div className="text-3xl font-extrabold text-blue-600 mt-1">{participants.length}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Completed Quiz</span>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">{completedCount}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Questions Bank</span>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">{selectedQuiz.questions.length}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: QUIZZES */}
        {activeTab === 'quizzes' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Manage Quizzes</h3>
                <p className="text-xs text-slate-500">Select active quiz or create new events.</p>
              </div>
              <button
                onClick={() => { setEditingQuiz(null); setIsEditorOpen(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Quiz
              </button>
            </div>

            {quizzes.length === 0 ? (
              <div className="text-center py-16 px-6">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No Quizzes Created</h4>
                <p className="text-sm text-slate-500 mt-1">Click "Create Quiz" above to add your first college event.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Title & Description</th>
                      <th className="py-3.5 px-6">Scheduled Time</th>
                      <th className="py-3.5 px-6">Questions</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {quizzes.map((quiz) => (
                      <tr 
                        key={quiz.id} 
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedQuizId === quiz.id ? 'bg-blue-50/40' : ''}`}
                        onClick={() => setSelectedQuizId(quiz.id)}
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{quiz.title}</div>
                          <div className="text-xs text-slate-500 truncate max-w-md mt-0.5">{quiz.description}</div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                          {quiz.scheduledStartTime ? new Date(quiz.scheduledStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Scheduled'}
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          {quiz.questions.length} Items
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            quiz.status === 'LIVE' ? 'bg-emerald-100 text-emerald-800' :
                            quiz.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {quiz.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedQuizId(quiz.id); setActiveTab('dashboard'); }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                          >
                            Control
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingQuiz(quiz); setIsEditorOpen(true); }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteQuiz(quiz.id); }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-block"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PARTICIPANTS */}
        {activeTab === 'participants' && (
          <AdminParticipants participants={participants} />
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && (
          <AdminAnalytics quiz={selectedQuiz} participants={participants} />
        )}

        {/* TAB 5: RESULTS */}
        {activeTab === 'results' && (
          <ResultsView 
            quiz={selectedQuiz} 
            participants={participants} 
            onBack={() => setActiveTab('dashboard')} 
            onPublishResults={() => onUpdateQuizStatus(selectedQuiz.id, 'RESULTS_PUBLISHED')}
          />
        )}

      </div>
    </div>
  );
}
