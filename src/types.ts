export type QuizSessionStatus = 
  | 'WAITING' 
  | 'LIVE' 
  | 'ENDED' 
  | 'RESULTS_PUBLISHED' 
  | 'RESET';

export type ParticipantStatus = 'WAITING' | 'LIVE' | 'COMPLETED';

export interface Question {
  id: string;
  quizId: string;
  questionNumber: number;
  questionText: string;
  options: [string, string, string, string] | string[];
  correctOptionIndex: number; // 0 for A, 1 for B, 2 for C, 3 for D
  durationSeconds: number;
  createdAt?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  questionDurationSeconds: number;
  totalQuestions: number;
  status: QuizSessionStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface QuizState {
  quizId: string;
  status: QuizSessionStatus;
  currentQuestionNumber: number;
  currentQuestionId: string;
  questionStartTime: number; // timestamp ms
  questionEndTime: number; // timestamp ms
  durationSeconds: number;
  updatedAt: number;
}

export interface Participant {
  id: string;
  quizId: string;
  name: string;
  rollNumber: string;
  department: string;
  status: ParticipantStatus;
  score: number;
  correct: number;
  incorrect: number;
  registeredAt: string;
}

export interface AnswerSubmission {
  id: string;
  quizId: string;
  questionId: string;
  questionNumber: number;
  participantId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  submittedAt: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  participantId: string;
  name: string;
  rollNumber: string;
  department: string;
  score: number;
  percentage: number;
  correct: number;
  incorrect: number;
  totalQuestions: number;
  rank: number;
  publishedAt: string;
}

export type AppView =
  | 'landing'
  | 'student-registration'
  | 'student-waiting'
  | 'student-quiz'
  | 'student-result'
  | 'auditorium'
  | 'admin-login'
  | 'admin-dashboard';
