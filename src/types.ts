export interface Question {
  id: string;
  quizId: string;
  questionNumber: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number; // 0-3 (A-D)
  durationSeconds: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  status: 'Draft' | 'Published' | 'Active' | 'Finished';
  currentQuestionIndex: number;
  timerSeconds: number;
  totalQuestions: number;
  questions: Question[];
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  email: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DISCONNECTED';
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalScore: number;
  completionTime?: string;
}

export interface AnswerSubmission {
  id: string;
  participantId: string;
  quizId: string;
  questionNumber: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
  submittedAt: string;
}

export type AppView = 
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-results'
  | 'auditorium'
  | 'student-registration'
  | 'student-interface'
  | 'sql-schema';
