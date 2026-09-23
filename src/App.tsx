import React, { useState, useEffect, useMemo } from 'react';
import {
  Quiz,
  Question,
  QuizState,
  Participant,
  AnswerSubmission,
  QuizResult,
  AppView,
} from './types';
import {
  DEFAULT_QUIZ_ID,
  seedInitialQuizIfEmpty,
  subscribeToQuizzes,
  subscribeToQuestions,
  subscribeToQuizState,
  subscribeToParticipants,
  subscribeToAnswers,
  subscribeToResults,
  subscribeToStudentAnswers,
  subscribeToStudentResult,
  adminCreateNewQuiz,
  adminDeleteQuiz,
  extractQuizIdFromLocation,
} from './lib/quizService';
import { LandingPage } from './components/LandingPage';
import { StudentRegistration } from './components/StudentRegistration';
import { StudentWaitingLobby } from './components/StudentWaitingLobby';
import { StudentQuiz } from './components/StudentQuiz';
import { StudentResult } from './components/StudentResult';
import { AuditoriumScreen } from './components/AuditoriumScreen';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [dbError, setDbError] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Authoritative Firestore Data State
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string>(() => {
    return extractQuizIdFromLocation() || DEFAULT_QUIZ_ID;
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [answers, setAnswers] = useState<AnswerSubmission[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);

  // Current Student Session State
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<AnswerSubmission[]>([]);
  const [studentResult, setStudentResult] = useState<QuizResult | null>(null);

  // Initialize Route / Hash on load and listen for hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      // Extract target quiz ID if encoded in hash or search param
      const targetQuizId = extractQuizIdFromLocation();
      if (targetQuizId) {
        setActiveQuizId(targetQuizId);
      }

      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (hash.includes('auditorium') || path.includes('auditorium')) {
        setCurrentView('auditorium');
      } else if (hash.includes('admin') || path.includes('admin')) {
        const isAuth = localStorage.getItem('cq_admin_authenticated') === 'true';
        setIsAdminAuthenticated(isAuth);
        setCurrentView(isAuth ? 'admin-dashboard' : 'admin-login');
      } else if (hash.includes('register') || path.includes('register')) {
        setCurrentView('student-registration');
      } else if (!hash || hash === '#' || hash === '#/' || hash === '#index' || hash === '#home') {
        setCurrentView('landing');
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    return () => window.removeEventListener('hashchange', handleLocationChange);
  }, []);

  // Restore participant session from memory/storage if exists
  useEffect(() => {
    const savedPartJson = sessionStorage.getItem('cq_current_participant');
    if (savedPartJson) {
      try {
        const parsed = JSON.parse(savedPartJson) as Participant;
        setCurrentParticipant(parsed);
      } catch {
        sessionStorage.removeItem('cq_current_participant');
      }
    }
  }, []);

  // Ensure initial seed in Firestore on mount
  useEffect(() => {
    seedInitialQuizIfEmpty().catch((err) => {
      console.warn('Initial database seed check note:', err);
    });
  }, []);

  // Subscribe to Quizzes list in Firestore
  useEffect(() => {
    const unsub = subscribeToQuizzes(
      (list) => {
        setQuizzes(list);
        setDbError(null);
        if (list.length > 0 && !list.some((q) => q.id === activeQuizId)) {
          setActiveQuizId(list[0].id);
        }
      },
      (err) => {
        console.error('Quizzes subscription error:', err);
        setDbError('Unable to connect to the quiz database.');
      }
    );
    return () => unsub();
  }, [activeQuizId]);

  const activeQuiz = useMemo(() => {
    return quizzes.find((q) => q.id === activeQuizId) || null;
  }, [quizzes, activeQuizId]);

  // Subscribe to Questions for active quiz
  useEffect(() => {
    if (!activeQuizId) return;
    const unsub = subscribeToQuestions(
      activeQuizId,
      (qList) => {
        setQuestions(qList);
      },
      (err) => {
        console.error('Questions subscription error:', err);
      }
    );
    return () => unsub();
  }, [activeQuizId]);

  // Subscribe to Authoritative Quiz State in Firestore
  useEffect(() => {
    if (!activeQuizId) return;
    const unsub = subscribeToQuizState(
      activeQuizId,
      (state) => {
        setQuizState(state);
      },
      (err) => {
        console.error('QuizState subscription error:', err);
      }
    );
    return () => unsub();
  }, [activeQuizId]);

  // Subscribe to Participants for active quiz
  useEffect(() => {
    if (!activeQuizId) return;
    const unsub = subscribeToParticipants(
      activeQuizId,
      (pList) => {
        setParticipants(pList);
      },
      (err) => {
        console.error('Participants subscription error:', err);
      }
    );
    return () => unsub();
  }, [activeQuizId]);

  // Subscribe to Answers for active quiz
  useEffect(() => {
    if (!activeQuizId) return;
    const unsub = subscribeToAnswers(
      activeQuizId,
      (aList) => {
        setAnswers(aList);
      },
      (err) => {
        console.error('Answers subscription error:', err);
      }
    );
    return () => unsub();
  }, [activeQuizId]);

  // Subscribe to Results for active quiz
  useEffect(() => {
    if (!activeQuizId) return;
    const unsub = subscribeToResults(
      activeQuizId,
      (rList) => {
        setResults(rList);
      },
      (err) => {
        console.error('Results subscription error:', err);
      }
    );
    return () => unsub();
  }, [activeQuizId]);

  // Subscribe to current student's submitted answers
  useEffect(() => {
    if (!activeQuizId || !currentParticipant) return;
    const unsub = subscribeToStudentAnswers(
      activeQuizId,
      currentParticipant.id,
      (subs) => {
        setStudentAnswers(subs);
      },
      (err) => {
        console.error('Student answers subscription error:', err);
      }
    );
    return () => unsub();
  }, [activeQuizId, currentParticipant?.id]);

  // Subscribe to current student's personal published result
  useEffect(() => {
    if (!activeQuizId || !currentParticipant) return;
    const unsub = subscribeToStudentResult(
      activeQuizId,
      currentParticipant.id,
      (res) => {
        setStudentResult(res);
      },
      (err) => {
        console.error('Student result subscription error:', err);
      }
    );
    return () => unsub();
  }, [activeQuizId, currentParticipant?.id]);

  // REALTIME SYNCHRONIZATION FOR STUDENTS:
  // Automatically switch student screen in response to authoritative Firestore quizState changes!
  useEffect(() => {
    if (!currentParticipant) return;
    // Don't override view if user is in admin or auditorium view
    if (currentView === 'auditorium' || currentView.startsWith('admin')) return;

    const status = quizState?.status;

    // Only switch automatically if user is actively engaged as a student in a quiz session
    if (currentView === 'landing' || currentView === 'student-registration') {
      return;
    }

    if (status === 'LIVE') {
      if (currentView !== 'student-quiz') {
        setCurrentView('student-quiz');
      }
    } else if (status === 'RESULTS_PUBLISHED') {
      if (currentView !== 'student-result') {
        setCurrentView('student-result');
      }
    } else if (status === 'WAITING') {
      if (currentView === 'student-quiz' || currentView === 'student-result') {
        setCurrentView('student-waiting');
      }
    } else if (status === 'ENDED') {
      // Keep student in quiz or show result awaiting card
      if (currentView === 'student-quiz') {
        setCurrentView('student-result');
      }
    }
  }, [quizState?.status, currentParticipant, currentView]);

  // Handle student registration
  const handleStudentRegistered = (participant: Participant) => {
    setCurrentParticipant(participant);
    sessionStorage.setItem('cq_current_participant', JSON.stringify(participant));

    if (quizState?.status === 'LIVE') {
      setCurrentView('student-quiz');
    } else {
      setCurrentView('student-waiting');
    }
  };

  // Find active question object
  const currentQuestionNumber = quizState?.currentQuestionNumber || 1;
  const currentActiveQuestion = useMemo(() => {
    return questions.find((q) => q.questionNumber === currentQuestionNumber) || null;
  }, [questions, currentQuestionNumber]);

  const handleSelectQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
  };

  const handleCreateQuiz = async (newQuiz: Quiz, seedQuestions: boolean) => {
    await adminCreateNewQuiz(newQuiz, seedQuestions);
    setActiveQuizId(newQuiz.id);
  };

  const handleDeleteQuiz = async (quizIdToDelete: string) => {
    await adminDeleteQuiz(quizIdToDelete);
    if (activeQuizId === quizIdToDelete) {
      const remaining = quizzes.filter((q) => q.id !== quizIdToDelete);
      if (remaining.length > 0) {
        setActiveQuizId(remaining[0].id);
      } else {
        setActiveQuizId(DEFAULT_QUIZ_ID);
      }
    }
  };

  const resolvedQuiz = activeQuiz || quizzes[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Database Error Banner if connection fails */}
      {dbError && (
        <div className="bg-red-600 text-white text-xs px-4 py-2.5 text-center font-medium flex items-center justify-center space-x-2">
          <span>⚠️</span>
          <span>{dbError}</span>
        </div>
      )}

      {/* VIEW: LANDING PAGE */}
      {currentView === 'landing' && (
        <LandingPage
          quizzes={quizzes}
          activeQuiz={resolvedQuiz}
          onSelectQuiz={handleSelectQuiz}
          onJoinQuiz={(quizId) => {
            const targetId = quizId || activeQuizId;
            if (targetId) setActiveQuizId(targetId);
            if (currentParticipant && currentParticipant.quizId === targetId) {
              if (quizState?.status === 'LIVE') setCurrentView('student-quiz');
              else if (quizState?.status === 'RESULTS_PUBLISHED') setCurrentView('student-result');
              else setCurrentView('student-waiting');
            } else {
              window.location.hash = targetId ? `register?quiz=${targetId}` : 'register';
              setCurrentView('student-registration');
            }
          }}
          onOpenAdmin={() => {
            window.location.hash = 'admin';
            const isAuth = localStorage.getItem('cq_admin_authenticated') === 'true';
            setIsAdminAuthenticated(isAuth);
            setCurrentView(isAuth ? 'admin-dashboard' : 'admin-login');
          }}
          onOpenAuditorium={(quizId) => {
            const targetId = quizId || activeQuizId;
            if (targetId) setActiveQuizId(targetId);
            window.location.hash = targetId ? `auditorium?quiz=${targetId}` : 'auditorium';
            setCurrentView('auditorium');
          }}
        />
      )}

      {/* VIEW: STUDENT REGISTRATION */}
      {currentView === 'student-registration' && (
        <StudentRegistration
          quiz={resolvedQuiz}
          quizzes={quizzes}
          onSelectQuiz={handleSelectQuiz}
          isAdmin={isAdminAuthenticated}
          onReturnToAdmin={() => {
            window.location.hash = 'admin';
            setCurrentView('admin-dashboard');
          }}
          onRegistered={handleStudentRegistered}
          onBackToHome={() => {
            window.location.hash = '';
            setCurrentView('landing');
          }}
        />
      )}

      {/* VIEW: STUDENT WAITING LOBBY */}
      {currentView === 'student-waiting' && (
        <StudentWaitingLobby
          quiz={resolvedQuiz}
          participant={currentParticipant}
          onSignOut={() => {
            sessionStorage.removeItem('cq_current_participant');
            setCurrentParticipant(null);
            setStudentAnswers([]);
            setStudentResult(null);
            window.location.hash = '';
            setCurrentView('landing');
          }}
        />
      )}

      {/* VIEW: STUDENT QUIZ INTERFACE */}
      {currentView === 'student-quiz' && resolvedQuiz && quizState && currentParticipant && (
        <StudentQuiz
          quiz={resolvedQuiz}
          quizState={quizState}
          currentQuestion={currentActiveQuestion}
          totalQuestions={questions.length || resolvedQuiz.totalQuestions}
          participant={currentParticipant}
          existingAnswers={studentAnswers}
        />
      )}

      {/* VIEW: STUDENT RESULT (Personal result card only) */}
      {currentView === 'student-result' && (
        <StudentResult
          result={studentResult}
          quizTitle={activeQuiz?.title || 'College Live Quiz'}
          onBackToHome={() => {
            sessionStorage.removeItem('cq_current_participant');
            setCurrentParticipant(null);
            setStudentAnswers([]);
            setStudentResult(null);
            window.location.hash = '';
            setCurrentView('landing');
          }}
        />
      )}

      {/* VIEW: AUDITORIUM DISPLAY */}
      {currentView === 'auditorium' && (
        <AuditoriumScreen
          quiz={resolvedQuiz}
          quizState={quizState}
          currentQuestion={currentActiveQuestion}
          totalQuestions={questions.length || activeQuiz?.totalQuestions || 4}
          results={results}
          onExitAuditorium={() => {
            window.location.hash = '';
            setCurrentView('landing');
          }}
        />
      )}

      {/* VIEW: ADMIN LOGIN */}
      {currentView === 'admin-login' && (
        <AdminLogin
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            setCurrentView('admin-dashboard');
          }}
          onBackToHome={() => {
            window.location.hash = '';
            setCurrentView('landing');
          }}
        />
      )}

      {/* VIEW: ADMIN DASHBOARD */}
      {currentView === 'admin-dashboard' && resolvedQuiz && (
        <AdminDashboard
          quiz={resolvedQuiz}
          quizzes={quizzes}
          quizState={quizState}
          questions={questions}
          participants={participants}
          answers={answers}
          results={results}
          onSelectQuiz={handleSelectQuiz}
          onCreateQuiz={handleCreateQuiz}
          onDeleteQuiz={handleDeleteQuiz}
          onLogout={() => {
            localStorage.removeItem('cq_admin_authenticated');
            setIsAdminAuthenticated(false);
            if (window.location.hash) {
              window.location.hash = '';
            }
            if (window.history && window.history.pushState) {
              window.history.pushState(null, '', window.location.pathname);
            }
            setCurrentView('landing');
          }}
          onOpenAuditorium={(quizId) => {
            const targetId = quizId || activeQuizId;
            if (targetId) setActiveQuizId(targetId);
            window.location.hash = targetId ? `auditorium?quiz=${targetId}` : 'auditorium';
            setCurrentView('auditorium');
          }}
          onOpenStudentLogin={(quizId) => {
            const targetId = quizId || activeQuizId;
            if (targetId) setActiveQuizId(targetId);
            window.location.hash = targetId ? `register?quiz=${targetId}` : 'register';
            setCurrentView('student-registration');
          }}
        />
      )}
    </div>
  );
}
