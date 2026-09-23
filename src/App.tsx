import { useState, useEffect } from 'react';
import { 
  collection, doc, setDoc, updateDoc, deleteDoc, 
  onSnapshot, getDocs, query, orderBy, Timestamp 
} from 'firebase/firestore';
import { db } from './lib/firebase';
import { Quiz, Participant, AppView, QuizStatus } from './types';
import { Navbar } from './components/Navbar';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentRegistration } from './components/StudentRegistration';
import { StudentWaitingLobby } from './components/StudentWaitingLobby';
import { StudentInterface } from './components/StudentInterface';
import { AuditoriumScreen } from './components/AuditoriumScreen';
import { FirebaseSchemaView } from './components/FirebaseSchemaView';

const SAMPLE_QUIZ: Quiz = {
  id: 'quiz-college-2026',
  title: 'Annual College Technical & Computer Science Quiz 2026',
  description: 'Official assessment covering algorithms, web systems, databases, and computer architecture.',
  status: 'SCHEDULED',
  currentQuestionIndex: 0,
  timerSeconds: 30,
  totalQuestions: 4,
  scheduledStartTime: new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16),
  createdAt: new Date().toLocaleDateString(),
  questions: [
    {
      id: 'q1',
      quizId: 'quiz-college-2026',
      questionNumber: 1,
      questionText: 'Which data structure uses LIFO (Last In, First Out) ordering?',
      options: ['Queue', 'Stack', 'Array', 'Binary Tree'],
      correctOptionIndex: 1, // Stack
      durationSeconds: 30,
    },
    {
      id: 'q2',
      quizId: 'quiz-college-2026',
      questionNumber: 2,
      questionText: 'What does CSS stand for in web development?',
      options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Syntax'],
      correctOptionIndex: 1, // Cascading Style Sheets
      durationSeconds: 30,
    },
    {
      id: 'q3',
      quizId: 'quiz-college-2026',
      questionNumber: 3,
      questionText: 'Which protocol is secure and encrypted for web browser communication?',
      options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
      correctOptionIndex: 2, // HTTPS
      durationSeconds: 30,
    },
    {
      id: 'q4',
      quizId: 'quiz-college-2026',
      questionNumber: 4,
      questionText: 'In relational databases, what does ACID stand for regarding transactions?',
      options: [
        'Atomicity, Consistency, Isolation, Durability', 
        'Access Control In Database', 
        'Async Core Indexing Design', 
        'Automated Column Insertion Data'
      ],
      correctOptionIndex: 0,
      durationSeconds: 30,
    }
  ]
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('student-registration');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([SAMPLE_QUIZ]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  // Real-time Firestore sync for quizzes
  useEffect(() => {
    const unsubQuizzes = onSnapshot(collection(db, 'quizzes'), (snapshot) => {
      const qList: Quiz[] = [];
      snapshot.forEach((docSnap) => {
        qList.push({ id: docSnap.id, ...docSnap.data() } as Quiz);
      });
      if (qList.length > 0) {
        setQuizzes(qList);
      } else {
        // Seed default sample quiz if collection is empty
        setDoc(doc(db, 'quizzes', SAMPLE_QUIZ.id), SAMPLE_QUIZ).catch(() => {});
        setQuizzes([SAMPLE_QUIZ]);
      }
    }, (error) => {
      console.warn('Firestore quizzes listener error:', error);
    });

    // Real-time Firestore sync for participants
    const unsubParticipants = onSnapshot(collection(db, 'participants'), (snapshot) => {
      const pList: Participant[] = [];
      snapshot.forEach((docSnap) => {
        pList.push({ id: docSnap.id, ...docSnap.data() } as Participant);
      });
      setParticipants(pList);
    }, (error) => {
      console.warn('Firestore participants listener error:', error);
    });

    return () => {
      unsubQuizzes();
      unsubParticipants();
    };
  }, []);

  const activeQuiz = quizzes[0] || SAMPLE_QUIZ;

  // Quiz Management Operations
  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      await setDoc(doc(db, 'quizzes', quiz.id), quiz);
    } catch (err) {
      console.error('Error saving quiz:', err);
      // Fallback local update
      setQuizzes(prev => {
        const exists = prev.some(q => q.id === quiz.id);
        if (exists) return prev.map(q => q.id === quiz.id ? quiz : q);
        return [quiz, ...prev];
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (quizzes.length <= 1) {
      alert('You must keep at least one quiz.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
    }
  };

  const handleUpdateQuizStatus = async (quizId: string, status: QuizStatus, nextIdx?: number) => {
    const target = quizzes.find(q => q.id === quizId) || activeQuiz;
    const updated: Quiz = {
      ...target,
      status,
      currentQuestionIndex: typeof nextIdx === 'number' ? nextIdx : target.currentQuestionIndex,
    };

    try {
      await updateDoc(doc(db, 'quizzes', quizId), {
        status,
        currentQuestionIndex: updated.currentQuestionIndex
      });
    } catch (err) {
      console.error('Error updating quiz status:', err);
      setQuizzes(prev => prev.map(q => q.id === quizId ? updated : q));
    }
  };

  const handleResetQuiz = async (quizId: string) => {
    await handleUpdateQuizStatus(quizId, 'SCHEDULED', 0);
  };

  // Student Registration & Answer Recording
  const handleRegisterParticipant = async (participant: Participant) => {
    setCurrentParticipant(participant);
    try {
      await setDoc(doc(db, 'participants', participant.id), participant);
    } catch (err) {
      console.error('Error registering participant:', err);
      setParticipants(prev => [...prev.filter(p => p.id !== participant.id), participant]);
    }
  };

  const handleRecordAnswer = async (questionNumber: number, optionIndex: number, isCorrect: boolean) => {
    if (!currentParticipant) return;

    const updatedParticipant: Participant = {
      ...currentParticipant,
      correctCount: currentParticipant.correctCount + (isCorrect ? 1 : 0),
      wrongCount: currentParticipant.wrongCount + (isCorrect ? 0 : 1),
      totalScore: currentParticipant.totalScore + (isCorrect ? 1 : 0),
      status: 'COMPLETED'
    };

    setCurrentParticipant(updatedParticipant);

    try {
      await updateDoc(doc(db, 'participants', updatedParticipant.id), {
        correctCount: updatedParticipant.correctCount,
        wrongCount: updatedParticipant.wrongCount,
        totalScore: updatedParticipant.totalScore,
        status: updatedParticipant.status
      });
    } catch (err) {
      console.error('Error updating participant score:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={() => { setIsAdminLoggedIn(false); setCurrentView('student-registration'); }}
      />

      <main>
        {currentView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={() => setIsAdminLoggedIn(true)}
            onNavigate={setCurrentView}
          />
        )}

        {currentView.startsWith('admin') && currentView !== 'admin-login' && (
          <AdminDashboard
            quizzes={quizzes}
            participants={participants}
            onNavigate={setCurrentView}
            onUpdateQuizStatus={handleUpdateQuizStatus}
            onDeleteQuiz={handleDeleteQuiz}
            onSaveQuiz={handleSaveQuiz}
            onResetQuiz={handleResetQuiz}
          />
        )}

        {currentView === 'student-registration' && (
          <StudentRegistration
            quiz={activeQuiz}
            onRegister={handleRegisterParticipant}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'student-waiting' && (
          <StudentWaitingLobby
            quiz={activeQuiz}
            participant={currentParticipant}
            onEnterQuiz={() => setCurrentView('student-interface')}
            onBackToRegistration={() => setCurrentView('student-registration')}
          />
        )}

        {currentView === 'student-interface' && (
          <StudentInterface
            quiz={activeQuiz}
            participant={currentParticipant}
            onBackToRegistration={() => setCurrentView('student-registration')}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {currentView === 'auditorium' && (
          <AuditoriumScreen
            quiz={activeQuiz}
            participants={participants}
            onBackToAdmin={() => setCurrentView(isAdminLoggedIn ? 'admin-dashboard' : 'student-registration')}
          />
        )}

        {currentView === 'firebase-schema' && (
          <FirebaseSchemaView />
        )}
      </main>
    </div>
  );
}
