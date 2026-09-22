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
  const [activeQuizId, setActiveQuizId] = useState<string>(quizzes[0]?.id || '');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const selectedQuiz = quizzes.find(q => q.id === activeQuizId) || quizzes[0];

  const waitingCount = participants.filter(p => p.status === 'IN_PROGRESS').length;
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
              Synchronized auditorium display, scheduled start times, and real-time student lobby monitoring.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Student Login QR
            </button>
            <button
              onClick={() => onNavigate('auditorium')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
            >
              <Monitor className="w-4 h-4" />
              Auditorium Screen
            </button>
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium rounded-xl text-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Quiz & Schedule
            </button>
          </div>
        </div>

        <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />

        {/* Live Control Panel Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Students Waiting in Lobby</span>
              <div className="text-2xl font-bold text-blue-600">
                {waitingCount} Active
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Real-time lobby count</span>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Scheduled Start Time</span>
              <div className="text-lg font-bold text-slate-900 truncate">
                {selectedQuiz?.scheduledStartTime ? new Date(selectedQuiz.scheduledStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Scheduled'}
              </div>
              <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Automatic synchronization</span>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Completed Quiz</span>
              <div className="text-2xl font-bold text-slate-900">{completedCount} Students</div>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Submissions recorded</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Admin Control: Click <span className="font-semibold text-slate-900">Start Quiz Immediately</span> to override the schedule and launch all connected student waiting lobbies simultaneously.
            </p>
            {selectedQuiz && (
              <button
                onClick={() => onStartQuiz(selectedQuiz.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Quiz Immediately (Override)
              </button>
            )}
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
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">{completedCount}</div>
              <span className="text-xs text-slate-500 mt-1 inline-block">finished challenge</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quizzes Management Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Manage Quizzes & Schedules</h3>
              <p className="text-xs text-slate-500">Select an active quiz or view leaderboards and analytics.</p>
            </div>
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Quiz
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-16 px-6">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">No Quizzes Created Yet</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Click "Create New Quiz & Schedule" above to add your first college event quiz.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Quiz Title & Description</th>
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
                      className={`hover:bg-slate-50/80 transition-colors ${activeQuizId === quiz.id ? 'bg-blue-50/30' : ''}`}
                      onClick={() => setActiveQuizId(quiz.id)}
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{quiz.title}</div>
                        <div className="text-xs text-slate-500 truncate max-w-md mt-0.5">{quiz.description}</div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                        {quiz.scheduledStartTime ? new Date(quiz.scheduledStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Scheduled'}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {quiz.questions.length} Questions
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          quiz.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                          quiz.status === 'Published' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {quiz.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onStartQuiz(quiz.id); }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        >
                          <Play className="w-3 h-3 fill-white" /> Start
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewResults(quiz.id); }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Award className="w-3 h-3 text-amber-500" /> Leaderboard
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

        {/* Real-time Registered Participants List */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registered Participants in Lobby</h3>
              <p className="text-xs text-slate-500">Real-time list of students connected and waiting in the lobby.</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
              {participants.length} Total Students
            </span>
          </div>

          {participants.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No students registered yet.</p>
              <p className="text-xs text-slate-400 mt-1">Share the Student Login QR code with students to let them register.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Student Name</th>
                    <th className="py-3 px-6">Roll Number</th>
                    <th className="py-3 px-6">Department</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-600">{p.rollNumber}</td>
                      <td className="py-3.5 px-6 text-slate-600">{p.department}</td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status === 'COMPLETED' ? 'Finished Quiz' : 'Waiting in Lobby'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
