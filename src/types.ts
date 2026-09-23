export type QuizStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'RESULTS_PUBLISHED' | 'RESET';

export interface Question {
  id: string;
  quizId: string;
  questionNumber: number;
  questionText: string;
  options: string[]; // [A, B, C, D]
  correctOptionIndex: number; // 0-3
  durationSeconds: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  status: QuizStatus;
  currentQuestionIndex: number;
  timerSeconds: number;
  totalQuestions: number;
  questions: Question[];
  scheduledStartTime: string; // ISO string or datetime-local string
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  email?: string;
  status: 'WAITING' | 'LIVE' | 'COMPLETED';
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
  | 'admin-analytics'
  | 'admin-participants'
  | 'auditorium'
  | 'student-registration'
  | 'student-waiting'
  | 'student-interface'
  | 'student-result'
  | 'firebase-schema';
