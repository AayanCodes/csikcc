import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { ResultsView } from './components/ResultsView';
import { AuditoriumScreen } from './components/AuditoriumScreen';
import { StudentRegistration } from './components/StudentRegistration';
import { StudentWaitingLobby } from './components/StudentWaitingLobby';
import { StudentInterface } from './components/StudentInterface';
import { SqlSchemaView } from './components/SqlSchemaView';
import { QuizEditorModal } from './components/QuizEditorModal';
import { initialQuizzes, initialParticipants } from './mockData';
import { Quiz, Participant, AppView } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('admin-login');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(initialParticipants[0]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>(initialQuizzes[0].id);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0];

  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    // Update quiz status to Active so all waiting students auto-launch simultaneously
    setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, status: 'Active', currentQuestionIndex: 0 } : q));
    setCurrentView('auditorium');
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (quizzes.length <= 1) {
      alert('Cannot delete the last remaining quiz.');
      return;
    }
    setQuizzes(quizzes.filter(q => q.id !== quizId));
  };

  const handleSaveQuiz = (newQuiz: Quiz) => {
    setQuizzes([newQuiz, ...quizzes]);
    setSelectedQuizId(newQuiz.id);
  };

  const handleRegisterParticipant = (participant: Participant) => {
    setCurrentParticipant(participant);
    setParticipants(prev => [participant, ...prev]);
    setCurrentView('student-waiting');
  };

  const handleRecordAnswer = (questionNumber: number, optionIndex: number, isCorrect: boolean) => {
    if (!currentParticipant) return;

    setParticipants(prev => prev.map(p => {
      if (p.id === currentParticipant.id) {
        const correctCount = p.correctCount + (isCorrect ? 1 : 0);
        const wrongCount = p.wrongCount + (isCorrect ? 0 : 1);
        const totalScore = correctCount;
        const isCompleted = questionNumber >= selectedQuiz.totalQuestions;

        return {
          ...p,
          correctCount,
          wrongCount,
          totalScore,
          status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
          completionTime: isCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '\n' + new Date().toLocaleDateString() : p.completionTime
        };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'student-interface' && !currentParticipant) {
            setCurrentView('student-registration');
          } else {
            setCurrentView(view);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          setCurrentView('admin-login');
        }}
      />

      <main>
        {currentView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={() => setIsAdminLoggedIn(true)}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            quizzes={quizzes}
            participants={participants}
            onNavigate={(view) => setCurrentView(view)}
            onStartQuiz={handleStartQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onOpenEditor={() => setIsEditorOpen(true)}
            onViewResults={(quizId) => {
              setSelectedQuizId(quizId);
              setCurrentView('admin-results');
            }}
          />
        )}

        {currentView === 'admin-results' && (
          <ResultsView
            quiz={selectedQuiz}
            participants={participants}
            onBack={() => setCurrentView('admin-dashboard')}
          />
        )}

        {currentView === 'auditorium' && (
          <AuditoriumScreen
            quiz={selectedQuiz}
            onBackToAdmin={() => setCurrentView('admin-dashboard')}
          />
        )}

        {currentView === 'student-registration' && (
          <StudentRegistration
            quiz={selectedQuiz}
            onRegister={handleRegisterParticipant}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'student-waiting' && (
          <StudentWaitingLobby
            quiz={selectedQuiz}
            participant={currentParticipant}
            onEnterQuiz={() => setCurrentView('student-interface')}
            onBackToRegistration={() => setCurrentView('student-registration')}
          />
        )}

        {currentView === 'student-interface' && (
          <StudentInterface
            quiz={selectedQuiz}
            participant={currentParticipant}
            onBackToRegistration={() => setCurrentView('student-registration')}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {currentView === 'sql-schema' && (
          <SqlSchemaView />
        )}
      </main>

      <QuizEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaveQuiz={handleSaveQuiz}
      />
    </div>
  );
}
