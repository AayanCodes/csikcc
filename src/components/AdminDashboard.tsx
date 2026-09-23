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
import logoImg from '../logo.jpeg';

interface AdminDashboardProps {
  quiz: Quiz;
  quizState: QuizState | null;
  questions: Question[];
  participants: Participant[];
  answers: AnswerSubmission[];
  results: QuizResult[];
  onLogout: () => void;
  onOpenAuditorium: () => void;
  onOpenStudentLogin: () => void;
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
  onOpenStudentLogin,
}) => {
  const [activeTab, setActiveTab] = useState<
    'control' | 'questions' | 'participants' | 'results' | 'env'
  >('control');

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [showStudentPreviewModal, setShowStudentPreviewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

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
    setActionError(null);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleSeedDefaultQuestions = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const defaults = [
        {
          id: `${quiz.id}_q1`,
          quizId: quiz.id,
          questionNumber: 1,
          questionText: 'Which protocol is used for encrypted, secure web communications over SSL/TLS?',
          options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
          correctOptionIndex: 2,
          durationSeconds: 30,
          createdAt: new Date().toISOString(),
        },
        {
          id: `${quiz.id}_q2`,
          quizId: quiz.id,
          questionNumber: 2,
          questionText: 'Which data structure strictly operates on a Last-In, First-Out (LIFO) order?',
          options: ['Queue', 'Stack', 'Array', 'Binary Search Tree'],
          correctOptionIndex: 1,
          durationSeconds: 30,
          createdAt: new Date().toISOString(),
        },
        {
          id: `${quiz.id}_q3`,
          quizId: quiz.id,
          questionNumber: 3,
          questionText: 'In database management systems, what does the "A" in the ACID guarantee represent?',
          options: ['Atomicity', 'Access Control', 'Authentication', 'Asynchronous'],
          correctOptionIndex: 0,
          durationSeconds: 30,
          createdAt: new Date().toISOString(),
        },
        {
          id: `${quiz.id}_q4`,
          quizId: quiz.id,
          questionNumber: 4,
          questionText: 'What is the average case time complexity of searching a balanced Binary Search Tree (BST)?',
          options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
          correctOptionIndex: 2,
          durationSeconds: 30,
          createdAt: new Date().toISOString(),
        },
      ];
      for (const q of defaults) {
        await adminSaveQuestion(q);
      }
      showFeedback('4 championship questions seeded successfully!');
    } catch (err) {
      setActionError('Failed to seed default questions: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  // Live Controls (Authoritative)
  const handleStart = async () => {
    setActionError(null);
    if (questions.length === 0) {
      setActionError('Cannot start quiz: No questions configured. Click "Seed 4 Default Questions" below or add questions in the Questions tab.');
      return;
    }
    const sortedQuestions = [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
    const firstQ = sortedQuestions[0];
    setActionLoading(true);
    try {
      await adminStartQuiz(quiz.id, firstQ);
      showFeedback('Quiz started! Question 1 is now LIVE across all student and auditorium screens.');
    } catch (err) {
      console.error('Failed to start quiz:', err);
      setActionError('Failed to start quiz: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleNext = async () => {
    setActionError(null);
    const nextQNum = currentQNum + 1;
    const nextQ = questions.find((q) => q.questionNumber === nextQNum);
    if (!nextQ) {
      setActionError(`No question found for Question #${nextQNum}.`);
      return;
    }
    setActionLoading(true);
    try {
      await adminNextQuestion(quiz.id, nextQ);
      showFeedback(`Advanced to Question #${nextQNum} across all connected student and auditorium screens.`);
    } catch (err) {
      console.error('Failed to advance question:', err);
      setActionError('Failed to advance question: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      await adminEndQuiz(quiz.id);
      showFeedback('Quiz ended. Answering is locked for all participants. Ready to publish results.');
    } catch (err) {
      console.error('Failed to end quiz:', err);
      setActionError('Failed to end quiz: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      await adminPublishResults(quiz.id, participants, answers, questions.length || quiz.totalQuestions);
      showFeedback('Official results published! Students and auditorium display are now viewing final ranks.');
    } catch (err) {
      console.error('Failed to publish results:', err);
      setActionError('Failed to publish results: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      const sortedQuestions = [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
      await adminResetQuiz(quiz.id, sortedQuestions[0]?.id);
      showFeedback('Quiz session reset to WAITING lobby status. Students remain in waiting lobby.');
    } catch (err) {
      console.error('Failed to reset quiz:', err);
      setActionError('Failed to reset quiz: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveQuizDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    setActionError(null);
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
      setActionError('Failed to update details: ' + (err instanceof Error ? err.message : String(err)));
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
            <img
              src={logoImg}
              alt="College Quiz Logo"
              className="w-9 h-9 rounded object-cover shadow-2xs border border-slate-200"
            />
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
              onClick={onOpenStudentLogin}
              className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Open Student Registration and Login Screen"
            >
              <span>👤</span>
              <span>Show Student Login Page</span>
            </button>
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
              className="text-xs font-medium px-3 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign Out and return to Front Page"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-xs font-semibold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action Error Alert */}
        {actionError && (
          <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
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
            {/* Student Access & Login Portal Highlight Card */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-lg p-5 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-900">🎓 Student Login & Registration Screen</span>
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 font-semibold rounded">
                      Direct Student Access
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-xl">
                    Students log in with their Name, Roll Number, and Department. Real-time synchronized with this Exam Controller. You can display the student portal on screen, preview it, or share the direct link.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={onOpenStudentLogin}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>👤</span>
                    <span>Show Student Login Page</span>
                  </button>
                  <button
                    onClick={() => setShowStudentPreviewModal(true)}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>👁️</span>
                    <span>Preview in Modal</span>
                  </button>
                  <button
                    onClick={() => setIsQRModalOpen(true)}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>📱</span>
                    <span>QR Code & Link</span>
                  </button>
                </div>
              </div>
            </div>

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Authoritative Session Controls (Updates all students and auditorium simultaneously)
                  </h4>
                  {actionLoading && (
                    <span className="text-xs font-medium text-blue-600 animate-pulse flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                      Updating session across all connected clients...
                    </span>
                  )}
                </div>

                {/* Inline Confirmation Card for Destructive Actions (Replaces blocked window.confirm) */}
                {confirmModal && (
                  <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                      <span>⚠️</span>
                      <span>{confirmModal.title}</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {confirmModal.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={confirmModal.onConfirm}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded shadow-xs transition-colors cursor-pointer"
                      >
                        {confirmModal.confirmLabel || 'Yes, Confirm & Proceed'}
                      </button>
                      <button
                        onClick={() => setConfirmModal(null)}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium rounded transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Count Alert if 0 questions */}
                {questions.length === 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center justify-between">
                    <div>
                      <strong>No questions loaded for this quiz.</strong> Please add questions or click the button below to seed 4 standard championship questions.
                    </div>
                    <button
                      onClick={handleSeedDefaultQuestions}
                      disabled={actionLoading}
                      className="ml-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-xs transition-colors cursor-pointer shrink-0"
                    >
                      + Seed 4 Default Questions
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {(currentStatus === 'WAITING' || currentStatus === 'RESET') && (
                    <button
                      onClick={handleStart}
                      disabled={actionLoading || questions.length === 0}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>▶</span>
                      <span>START QUIZ (QUESTION 1)</span>
                    </button>
                  )}

                  {currentStatus === 'LIVE' && (
                    <>
                      {!isLastQuestion ? (
                        <button
                          onClick={handleNext}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                        >
                          <span>NEXT QUESTION →</span>
                          <span>(Question {currentQNum + 1})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setConfirmModal({
                              title: 'End Live Quiz?',
                              message: 'This is the final question. Ending the quiz will lock answer submissions for all students.',
                              confirmLabel: 'End Live Quiz',
                              onConfirm: () => {
                                setConfirmModal(null);
                                handleEnd();
                              },
                            });
                          }}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          END QUIZ (LAST QUESTION FINISHED)
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setConfirmModal({
                            title: 'End Quiz Early?',
                            message: 'Are you sure you want to end the live quiz early? All connected student answer submissions will be closed.',
                            confirmLabel: 'Yes, End Early',
                            onConfirm: () => {
                              setConfirmModal(null);
                              handleEnd();
                            },
                          });
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded border border-slate-300 transition-colors cursor-pointer"
                      >
                        End Quiz Early
                      </button>
                    </>
                  )}

                  {(currentStatus === 'ENDED' || currentStatus === 'LIVE') && (
                    <button
                      onClick={() => {
                        setConfirmModal({
                          title: 'Publish Official Results?',
                          message: 'This will compute final ranks strictly based on submitted student answers and broadcast results to all students and the auditorium podium.',
                          confirmLabel: 'Publish Results Now',
                          onConfirm: () => {
                            setConfirmModal(null);
                            handlePublish();
                          },
                        });
                      }}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🏆</span>
                      <span>PUBLISH OFFICIAL RESULTS</span>
                    </button>
                  )}

                  {currentStatus === 'RESULTS_PUBLISHED' && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold rounded">
                        ✓ Official Results Published Live
                      </span>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            title: 'Re-compute & Re-publish Results?',
                            message: 'This will re-calculate ranks from all submitted answers and update student screens.',
                            confirmLabel: 'Re-publish Results',
                            onConfirm: () => {
                              setConfirmModal(null);
                              handlePublish();
                            },
                          });
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Re-publish Results
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setConfirmModal({
                        title: 'Reset Session to WAITING Lobby?',
                        message: 'This resets the live state back to WAITING. Participants will remain registered in the lobby, ready for Question 1.',
                        confirmLabel: 'Yes, Reset Session',
                        onConfirm: () => {
                          setConfirmModal(null);
                          handleReset();
                        },
                      });
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs rounded border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>🔄</span>
                    <span>Reset Session to WAITING</span>
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
                          onClick={() => {
                            setConfirmModal({
                              title: `Delete Question #${q.questionNumber}?`,
                              message: `Are you sure you want to delete Question #${q.questionNumber}: "${q.questionText}"?`,
                              confirmLabel: 'Delete Question',
                              onConfirm: async () => {
                                setConfirmModal(null);
                                try {
                                  await adminDeleteQuestion(q.id);
                                  showFeedback(`Question #${q.questionNumber} deleted.`);
                                } catch (err) {
                                  setActionError('Failed to delete question: ' + (err instanceof Error ? err.message : String(err)));
                                }
                              },
                            });
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

      {/* Student Login Live Preview Modal */}
      {showStudentPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎓</span>
                <span className="font-bold text-sm">Student Registration & Login Screen Preview</span>
              </div>
              <button
                onClick={() => setShowStudentPreviewModal(false)}
                className="text-slate-400 hover:text-white text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-center justify-between">
                <span>This preview demonstrates what students see on their mobile phones and laptops when registering.</span>
                <button
                  onClick={() => {
                    setShowStudentPreviewModal(false);
                    onOpenStudentLogin();
                  }}
                  className="font-bold text-blue-700 hover:text-blue-900 underline text-xs cursor-pointer ml-2 shrink-0"
                >
                  Open Full Screen →
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4 pointer-events-none opacity-90">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Student Registration</h3>
                  <p className="text-xs text-slate-500">{quiz.title}</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Full Name</label>
                    <input type="text" placeholder="e.g. Alex Johnson" disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Roll Number</label>
                    <input type="text" placeholder="e.g. CS2026-084" disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Department</label>
                    <input type="text" placeholder="e.g. Computer Science" disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-xs" />
                  </div>
                  <button disabled className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded opacity-80">
                    Register & Enter Waiting Lobby
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowStudentPreviewModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setShowStudentPreviewModal(false);
                    onOpenStudentLogin();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Switch to Student Login Page</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
