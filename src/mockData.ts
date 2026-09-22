import { Quiz, Participant } from './types';

export const initialQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'College Tech Fest 2026: Code & Logic Challenge',
    description: 'Annual inter-collegiate technical quiz competition testing computer science fundamentals, algorithmic problem solving, and modern web architecture.',
    status: 'Published',
    currentQuestionIndex: 0,
    timerSeconds: 15,
    totalQuestions: 5,
    createdAt: '2026-09-21 06:16 PM',
    questions: [
      {
        id: 'q1',
        quizId: 'quiz-1',
        questionNumber: 1,
        questionText: 'Which data structure is typically used to implement recursion and function call stacks?',
        options: ['Queue', 'Stack', 'Hash Table', 'Binary Search Tree'],
        correctOptionIndex: 1, // Stack
        durationSeconds: 15,
      },
      {
        id: 'q2',
        quizId: 'quiz-1',
        questionNumber: 2,
        questionText: 'What is the worst-case time complexity of standard Quicksort algorithm?',
        options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
        correctOptionIndex: 2, // O(n^2)
        durationSeconds: 15,
      },
      {
        id: 'q3',
        quizId: 'quiz-1',
        questionNumber: 3,
        questionText: 'In React 19, which hook is used for handling asynchronous actions and form submissions with built-in pending states?',
        options: ['useActionState', 'useReducer', 'useMemo', 'useContext'],
        correctOptionIndex: 0, // useActionState
        durationSeconds: 15,
      },
      {
        id: 'q4',
        quizId: 'quiz-1',
        questionNumber: 4,
        questionText: 'Which HTTP status code indicates that the request has succeeded and a new resource has been created?',
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctOptionIndex: 1, // 201 Created
        durationSeconds: 15,
      },
      {
        id: 'q5',
        quizId: 'quiz-1',
        questionNumber: 5,
        questionText: 'What does CSS property "display: grid" primarily establish for child container items?',
        options: ['Floating block layout', 'Two-dimensional grid-based layout', 'Inline flexbox wrapping', 'Absolute positioning context'],
        correctOptionIndex: 1, // Two-dimensional grid
        durationSeconds: 15,
      }
    ]
  },
  {
    id: 'quiz-2',
    title: 'General Science & Innovation Trivia',
    description: 'An exciting fast-paced round on physics, astronomy, and computing history.',
    status: 'Draft',
    currentQuestionIndex: 0,
    timerSeconds: 20,
    totalQuestions: 4,
    createdAt: '2026-09-21 04:10 PM',
    questions: [
      {
        id: 'gs1',
        quizId: 'quiz-2',
        questionNumber: 1,
        questionText: 'Which fundamental force holds quarks together inside protons and neutrons?',
        options: ['Electromagnetic force', 'Gravitational force', 'Strong nuclear force', 'Weak nuclear force'],
        correctOptionIndex: 2,
        durationSeconds: 20,
      },
      {
        id: 'gs2',
        quizId: 'quiz-2',
        questionNumber: 2,
        questionText: 'Who proposed the theory of general relativity in 1915?',
        options: ['Isaac Newton', 'Albert Einstein', 'Niels Bohr', 'Marie Curie'],
        correctOptionIndex: 1,
        durationSeconds: 20,
      },
      {
        id: 'gs3',
        quizId: 'quiz-2',
        questionNumber: 3,
        questionText: 'What is the most abundant gas in Earths atmosphere by volume?',
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
        correctOptionIndex: 2,
        durationSeconds: 20,
      },
      {
        id: 'gs4',
        quizId: 'quiz-2',
        questionNumber: 4,
        questionText: 'Which computing pioneer is credited with writing the first algorithm intended for implementation on Charles Babbage Analytical Engine?',
        options: ['Alan Turing', 'Ada Lovelace', 'Grace Hopper', 'John von Neumann'],
        correctOptionIndex: 1,
        durationSeconds: 20,
      }
    ]
  }
];

export const initialParticipants: Participant[] = [
  {
    id: 'p1',
    name: 'Test Student',
    rollNumber: 'TEST-DUP-4200',
    department: 'CS',
    email: '',
    status: 'IN_PROGRESS',
    correctCount: 0,
    wrongCount: 0,
    unansweredCount: 0,
    totalScore: 0,
  },
  {
    id: 'p2',
    name: 'Ananya Roy',
    rollNumber: 'CS-2026-088',
    department: 'Computer Science',
    email: '',
    status: 'IN_PROGRESS',
    correctCount: 0,
    wrongCount: 0,
    unansweredCount: 0,
    totalScore: 0,
  },
  {
    id: 'p3',
    name: 'Ananya Roy',
    rollNumber: 'CS-2026-088',
    department: 'Computer Science',
    email: 'ananya@college.edu',
    status: 'IN_PROGRESS',
    correctCount: 0,
    wrongCount: 0,
    unansweredCount: 0,
    totalScore: 0,
  },
  {
    id: 'p4',
    name: 'Alice Smith',
    rollNumber: 'CS2026-001',
    department: 'Computer Science',
    email: '',
    status: 'IN_PROGRESS',
    correctCount: 1,
    wrongCount: 0,
    unansweredCount: 0,
    totalScore: 1,
  },
  {
    id: 'p5',
    name: 'Test Student',
    rollNumber: 'CS999',
    department: 'General',
    email: '',
    status: 'IN_PROGRESS',
    correctCount: 1,
    wrongCount: 0,
    unansweredCount: 0,
    totalScore: 1,
  },
  {
    id: 'p6',
    name: 'Rohan Gupta',
    rollNumber: 'EC2024-089',
    department: 'Electronics & Communication',
    email: 'rohan.g@college.edu',
    status: 'COMPLETED',
    correctCount: 3,
    wrongCount: 1,
    unansweredCount: 1,
    totalScore: 3,
    completionTime: '07:16 PM\n9/21/2026'
  },
  {
    id: 'p7',
    name: 'Priya Nair',
    rollNumber: 'IT2023-118',
    department: 'Information Technology',
    email: 'priya.nair@college.edu',
    status: 'COMPLETED',
    correctCount: 4,
    wrongCount: 1,
    unansweredCount: 0,
    totalScore: 4,
    completionTime: '06:46 PM\n9/21/2026'
  },
  {
    id: 'p8',
    name: 'Aarav Sharma',
    rollNumber: 'CS2023-042',
    department: 'Computer Science & Engineering',
    email: 'aarav.sharma@college.edu',
    status: 'COMPLETED',
    correctCount: 5,
    wrongCount: 0,
    unansweredCount: 0,
    totalScore: 5,
    completionTime: '06:16 PM\n9/21/2026'
  }
];
