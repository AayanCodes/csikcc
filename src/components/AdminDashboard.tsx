import React, { useState } from 'react';
import {
  Quiz,
  Question,
  QuizState,
  Participant,
  AnswerSubmission,
  QuizResult,
} from '../types';
import {
  adminStartQuiz,
  adminNextQuestion,
  adminEndQuiz,
  adminPublishResults,
  adminResetQuiz,
  adminSaveQuestion,
  adminDeleteQuestion,
  adminSaveQuiz,
} from '../lib/quizService';
import { AdminQuestionModal } from './AdminQuizEditorModal';
import { AdminQRCodeModal } from './AdminQRCodeModal';
import { testFirestoreConnection, FIREBASE_CONFIG, FIRESTORE_DATABASE_ID } from '../lib/firebase';

interface AdminDashboardProps {
  quiz: Quiz;
  quizState: QuizState | null;
  questions: Question[];
  participants: Participant[];
  answers: AnswerSubmission[];
  results: QuizResult[];
  onLogout: () => void;
  onOpenAuditorium: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  quiz,
  quizState,
  questions,
  participants,
  answers,
  results,
  onLogout,
  onOpenAuditorium,
}) => {
  const [activeTab, setActiveTab] = useState<
    'control' | 'questions' | 'participants' | 'results' | 'env'
  >('control');

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Connection test state
  const [connTestStatus, setConnTestStatus] = useState<string | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);

  // Quiz details edit state
  const [editTitle, setEditTitle] = useState(quiz.title);
  const [editDesc, setEditDesc] = useState(quiz.description);
  const [editDate, setEditDate] = useState(quiz.scheduledDate || '');
  const [editTime, setEditTime] = useState(quiz.scheduledTime || '');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const currentStatus = quizState?.status || quiz.status || 'WAITING';
  const currentQNum = quizState?.currentQuestionNumber || 1;
  const currentQuestion = questions.find((q) => q.questionNumber === currentQNum);
  const isLastQuestion = currentQNum >= questions.length;

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Live Controls
  const handleStart = async () => {
    if (questions.length === 0) {
      alert('Please add at least one question before starting.');
      return;
    }
    setActionLoading(true);
    try {
      await adminStartQuiz(quiz.id, questions[0]);
      showFeedback('Quiz started! Question 1 is now LIVE across all student and auditorium screens.');
    } catch (err) {
      alert('Failed to start quiz: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleNext = async () => {
    const nextQNum = currentQNum + 1;
    const nextQ = questions.find((q) => q.questionNumber === nextQNum);
    if (!nextQ) {
      alert('No next question found.');
      return;
    }
    setActionLoading(true);
    try {
      await adminNextQuestion(quiz.id, nextQ);
      showFeedback(`Advanced to Question ${nextQNum} across all clients.`);
    } catch (err) {
      alert('Failed to advance question: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!confirm('End the live quiz? Students will no longer be able to submit answers.')) return;
    setActionLoading(true);
    try {
      await adminEndQuiz(quiz.id);
      showFeedback('Quiz ended. Ready to publish results.');
    } catch (err) {
      alert('Failed to end quiz: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish official results calculated strictly from submitted answers?')) return;
    setActionLoading(true);
    try {
      await adminPublishResults(quiz.id, participants, answers, questions.length);
      showFeedback('Official results published! Students can now view their scores.');
    } catch (err) {
      alert('Failed to publish results: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset quiz session back to Waiting Lobby? (Participants will remain in lobby)')) return;
    setActionLoading(true);
    try {
      await adminResetQuiz(quiz.id, questions[0]?.id);
      showFeedback('Quiz session reset to WAITING status.');
    } catch (err) {
      alert('Failed to reset quiz: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveQuizDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    try {
      await adminSaveQuiz({
        ...quiz,
        title: editTitle.trim(),
        description: editDesc.trim(),
        scheduledDate: editDate,
        scheduledTime: editTime,
        totalQuestions: questions.length,
        updatedAt: new Date().toISOString(),
      });
      showFeedback('Quiz event details updated successfully.');
    } catch (err) {
      alert('Failed to update details: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleRunConnTest = async () => {
    setIsTestingConn(true);
    setConnTestStatus('Testing read/write to Firestore...');
    const res = await testFirestoreConnection();
    if (res.success) {
      setConnTestStatus('SUCCESS: Firebase Firestore connected and confirmed operative!');
    } else {
      setConnTestStatus('ERROR: ' + res.error);
    }
    setIsTestingConn(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              ADM
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">
                Exam Controller Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {quiz.title} • Status:{' '}
                <span className="font-semibold text-blue-600 uppercase">
                  {currentStatus}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 transition-colors cursor-pointer"
            >
              QR / Event Link
            </button>
            <button
              onClick={onOpenAuditorium}
              className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 transition-colors cursor-pointer"
            >
              Auditorium Screen
            </button>
            <button
              onClick={onLogout}
              className="text-xs font-medium px-3 py-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-xs font-semibold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('control')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'control'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Live Quiz Control
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'questions'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'participants'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Real Participants ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'results'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Official Results ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'env'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Firebase & Vercel Sync
          </button>
        </div>

        {/* TAB 1: LIVE CONTROL */}
        {activeTab === 'control' && (
          <div className="space-y-6">
            {/* Live Status Overview Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                    Authoritative Real-Time Session
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    Current Session Status:{' '}
                    <span
                      className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider ${
                        currentStatus === 'LIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentStatus === 'ENDED'
                          ? 'bg-amber-100 text-amber-800'
                          : currentStatus === 'RESULTS_PUBLISHED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono text-slate-600">
                  <div>
                    Participants: <strong className="text-slate-900 font-bold">{participants.length}</strong>
                  </div>
                  <div>
                    Answers Recorded: <strong className="text-slate-900 font-bold">{answers.length}</strong>
                  </div>
                </div>
              </div>

              {/* Live Question Display */}
              {currentStatus === 'LIVE' && currentQuestion && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-blue-600">
                    <span>Active Question {currentQuestion.questionNumber} of {questions.length}</span>
                    <span>Duration: {currentQuestion.durationSeconds}s</span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    {currentQuestion.questionText}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {currentQuestion.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded border ${
                          idx === currentQuestion.correctOptionIndex
                            ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {['A', 'B', 'C', 'D'][idx]}. {opt}
                        {idx === currentQuestion.correctOptionIndex && ' (Correct Answer)'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Authoritative Live Action Controls */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
                  Authoritative Session Controls (Updates all students and auditorium simultaneously)
                </h4>
                <div className="flex flex-wrap gap-3">
                  {currentStatus === 'WAITING' && (
                    <button
                      onClick={handleStart}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      ▶ START QUIZ (QUESTION 1)
                    </button>
                  )}

                  {currentStatus === 'LIVE' && (
                    <>
                      {!isLastQuestion ? (
                        <button
                          onClick={handleNext}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          NEXT QUESTION → ({currentQNum + 1})
                        </button>
                      ) : (
                        <button
                          onClick={handleEnd}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          END QUIZ (LAST QUESTION FINISHED)
                        </button>
                      )}

                      <button
                        onClick={handleEnd}
                        disabled={actionLoading}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded border border-slate-300 transition-colors cursor-pointer"
                      >
                        End Quiz Early
                      </button>
                    </>
                  )}

                  {(currentStatus === 'ENDED' || currentStatus === 'LIVE') && (
                    <button
                      onClick={handlePublish}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      PUBLISH OFFICIAL RESULTS
                    </button>
                  )}

                  <button
                    onClick={handleReset}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-600 font-medium text-xs rounded border border-slate-300 transition-colors cursor-pointer"
                  >
                    Reset Session
                  </button>
                </div>
              </div>
            </div>

            {/* Quiz Event Metadata Form */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Quiz Event Details & Schedule
              </h3>
              <form onSubmit={handleSaveQuizDetails} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Event Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Scheduled Date & Time
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-1/2 px-3 py-2 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-1/2 px-3 py-2 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Event Description
                  </label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingDetails}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingDetails ? 'Saving...' : 'Save Event Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: QUESTIONS MANAGEMENT */}
        {activeTab === 'questions' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Quiz Questions Repository ({questions.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Questions stored persistently in Firestore.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsQuestionModalOpen(true);
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded transition-colors cursor-pointer"
              >
                + Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No questions added yet. Click "+ Add Question" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        Question #{q.questionNumber} • {q.durationSeconds}s duration
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setIsQuestionModalOpen(true);
                          }}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 border border-slate-200 rounded cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete Question #${q.questionNumber}?`)) {
                              await adminDeleteQuestion(q.id);
                              showFeedback(`Question #${q.questionNumber} deleted.`);
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 border border-red-200 rounded cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-medium text-slate-900">
                      {q.questionText}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded border ${
                            idx === q.correctOptionIndex
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-bold mr-1.5">{['A', 'B', 'C', 'D'][idx]}.</span>
                          {opt}
                          {idx === q.correctOptionIndex && ' (✓ Correct)'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REAL PARTICIPANTS */}
        {activeTab === 'participants' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Live Participant Register ({participants.length})
              </h3>
              <p className="text-xs text-slate-500">
                Real student records synced directly from Firestore. No mock participants.
              </p>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No students registered yet. Students can register via the student portal.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Live Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {participants.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-700">{p.rollNumber}</td>
                        <td className="py-2.5 px-4 text-slate-600">{p.department}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              p.status === 'LIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                          {p.score || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OFFICIAL RESULTS */}
        {activeTab === 'results' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Official Calculated Results ({results.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Rankings computed authoritatively from actual answer submissions in Firestore.
                </p>
              </div>
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded transition-colors cursor-pointer"
              >
                Recalculate & Publish Results
              </button>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Results have not yet been published. Click "Recalculate & Publish Results" after students have submitted answers.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Participant</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-right">Score</th>
                      <th className="py-3 px-4 text-right">Correct</th>
                      <th className="py-3 px-4 text-right">Incorrect</th>
                      <th className="py-3 px-4 text-right">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                          #{r.rank}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">{r.name}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-700">{r.rollNumber}</td>
                        <td className="py-2.5 px-4 text-slate-600">{r.department}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-600">
                          {r.score} / {r.totalQuestions}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-700">
                          {r.correct}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-red-700">
                          {r.incorrect}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                          {r.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FIREBASE & VERCEL CONSISTENCY */}
        {activeTab === 'env' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Single Source of Truth: Firebase & Vercel Consistency
              </h3>
              <p className="text-xs text-slate-500">
                The exact SAME Firebase project and Firestore database must be used in AI Studio and Vercel.
              </p>
            </div>

            {/* Connectivity Test */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Live Database Connection Test (Requirement #24)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Creates, reads back, and cleanly deletes a temporary health-check record directly from Firestore.
                  </p>
                </div>
                <button
                  onClick={handleRunConnTest}
                  disabled={isTestingConn}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isTestingConn ? 'Testing...' : 'Test Connection Now'}
                </button>
              </div>

              {connTestStatus && (
                <div
                  className={`p-3 text-xs rounded font-mono ${
                    connTestStatus.startsWith('SUCCESS')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {connTestStatus}
                </div>
              )}
            </div>

            {/* Vercel Environment Variables */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Required Vercel Production Environment Variables
              </h4>
              <p className="text-xs text-slate-600">
                Add these exact environment variables to your Vercel Project Settings → Environment Variables to ensure production points to the exact same Firestore database:
              </p>

              <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-xs overflow-x-auto space-y-1">
                <div>VITE_FIREBASE_API_KEY={FIREBASE_CONFIG.apiKey}</div>
                <div>VITE_FIREBASE_AUTH_DOMAIN={FIREBASE_CONFIG.authDomain}</div>
                <div>VITE_FIREBASE_PROJECT_ID={FIREBASE_CONFIG.projectId}</div>
                <div>VITE_FIREBASE_STORAGE_BUCKET={FIREBASE_CONFIG.storageBucket}</div>
                <div>VITE_FIREBASE_MESSAGING_SENDER_ID={FIREBASE_CONFIG.messagingSenderId}</div>
                <div>VITE_FIREBASE_APP_ID={FIREBASE_CONFIG.appId}</div>
                <div>VITE_FIREBASE_DATABASE_ID={FIRESTORE_DATABASE_ID}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Add/Edit Modal */}
      <AdminQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
        quizId={quiz.id}
        nextQuestionNumber={questions.length + 1}
        onSave={async (savedQ) => {
          await adminSaveQuestion(savedQ);
          showFeedback(`Question #${savedQ.questionNumber} saved successfully.`);
        }}
      />

      {/* QR Code Modal */}
      <AdminQRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        defaultUrl={`${window.location.origin}/#register`}
      />
    </div>
  );
};
