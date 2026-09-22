import { useState, useEffect } from 'react';
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
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('admin-login');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0] || {
    id: 'default',
    title: 'No Quiz Available',
    description: 'Please create a quiz from the Admin Portal.',
    status: 'Draft',
    currentQuestionIndex: 0,
    timerSeconds: 15,
    totalQuestions: 0,
    createdAt: new Date().toLocaleDateString(),
    questions: []
  };

  // Setup Supabase Realtime channel `quiz_live` and fetch live data
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const currentSupabase = supabase;

    // Fetch initial participants from Supabase
    const fetchParticipants = async () => {
      const { data, error } = await currentSupabase.from('participants').select('*');
      if (!error && data && data.length > 0) {
        const mapped: Participant[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          rollNumber: row.roll_number,
          department: row.department,
          email: row.email || '',
          status: row.status || 'IN_PROGRESS',
          correctCount: row.correct_count || 0,
          wrongCount: row.wrong_count || 0,
          unansweredCount: row.unanswered_count || 0,
          totalScore: row.total_score || 0,
        }));
        setParticipants(mapped);
      }
    };

    fetchParticipants();

    const channel = currentSupabase.channel('quiz_live');

    channel
      .on('broadcast', { event: 'quiz-update' }, (payload) => {
        if (payload.payload && (payload.payload as any).quizzes) {
          setQuizzes((payload.payload as any).quizzes);
        }
        if (payload.payload && (payload.payload as any).selectedQuizId) {
          setSelectedQuizId((payload.payload as any).selectedQuizId);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        fetchParticipants();
      })
      .subscribe();

    return () => {
      currentSupabase.removeChannel(channel);
    };
  }, []);

  const broadcastQuizState = (updatedQuizzes: Quiz[], quizId: string) => {
    if (isSupabaseConfigured && supabase) {
      supabase.channel('quiz_live').send({
        type: 'broadcast',
        event: 'quiz-update',
        payload: { quizzes: updatedQuizzes, selectedQuizId: quizId },
      });
    }
  };

  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    const updated = quizzes.map(q => q.id === quizId ? { ...q, status: 'Active' as const, currentQuestionIndex: 0 } : q);
    setQuizzes(updated);
    broadcastQuizState(updated, quizId);
    setCurrentView('auditorium');
  };

  const handleDeleteQuiz = (quizId: string) => {
    const updated = quizzes.filter(q => q.id !== quizId);
    setQuizzes(updated);
    if (selectedQuizId === quizId) {
      setSelectedQuizId(updated[0]?.id || '');
    }
    broadcastQuizState(updated, updated[0]?.id || '');
  };

  const handleSaveQuiz = (newQuiz: Quiz) => {
    const updated = [newQuiz, ...quizzes];
    setQuizzes(updated);
    setSelectedQuizId(newQuiz.id);
    broadcastQuizState(updated, newQuiz.id);
  };

  const handleRegisterParticipant = (participant: Participant) => {
    setCurrentParticipant(participant);
    setParticipants(prev => [participant, ...prev]);
    setCurrentView('student-waiting');
  };

  const handleRecordAnswer = async (questionNumber: number, optionIndex: number, isCorrect: boolean) => {
    if (!currentParticipant) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('answers').insert([
          {
            participant_id: currentParticipant.id,
            quiz_id: selectedQuiz.id,
            question_number: questionNumber,
            selected_option_index: optionIndex,
            is_correct: isCorrect,
          }
        ]);
      } catch (err) {
        console.error('Error inserting answer to Supabase:', err);
      }
    }

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
