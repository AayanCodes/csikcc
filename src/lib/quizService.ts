import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Quiz,
  Question,
  QuizState,
  Participant,
  AnswerSubmission,
  QuizResult,
} from '../types';

export const DEFAULT_QUIZ_ID = 'college-live-quiz-2026';

// Seed Initial Quiz to Firestore if no quizzes exist
export async function seedInitialQuizIfEmpty(): Promise<void> {
  try {
    const quizDoc = await getDoc(doc(db, 'quizzes', DEFAULT_QUIZ_ID));
    if (!quizDoc.exists()) {
      const now = new Date();
      const scheduledDate = now.toISOString().slice(0, 10);
      const scheduledTime = '10:00';

      const initialQuiz: Quiz = {
        id: DEFAULT_QUIZ_ID,
        title: 'College Annual Live Quiz Championship',
        description: 'Official collegiate live competition covering algorithms, networking, databases, and systems.',
        scheduledDate,
        scheduledTime,
        questionDurationSeconds: 30,
        totalQuestions: 4,
        status: 'WAITING',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const initialQuestions: Question[] = [
        {
          id: 'q1',
          quizId: DEFAULT_QUIZ_ID,
          questionNumber: 1,
          questionText: 'Which protocol is used for encrypted, secure web communications over SSL/TLS?',
          options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
          correctOptionIndex: 2, // HTTPS
          durationSeconds: 30,
          createdAt: now.toISOString(),
        },
        {
          id: 'q2',
          quizId: DEFAULT_QUIZ_ID,
          questionNumber: 2,
          questionText: 'Which data structure strictly operates on a Last-In, First-Out (LIFO) order?',
          options: ['Queue', 'Stack', 'Array', 'Binary Search Tree'],
          correctOptionIndex: 1, // Stack
          durationSeconds: 30,
          createdAt: now.toISOString(),
        },
        {
          id: 'q3',
          quizId: DEFAULT_QUIZ_ID,
          questionNumber: 3,
          questionText: 'In database management systems, what does the "A" in the ACID guarantee represent?',
          options: ['Atomicity', 'Access Control', 'Authentication', 'Asynchronous'],
          correctOptionIndex: 0, // Atomicity
          durationSeconds: 30,
          createdAt: now.toISOString(),
        },
        {
          id: 'q4',
          quizId: DEFAULT_QUIZ_ID,
          questionNumber: 4,
          questionText: 'What is the average case time complexity of searching a balanced Binary Search Tree (BST)?',
          options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
          correctOptionIndex: 2, // O(log n)
          durationSeconds: 30,
          createdAt: now.toISOString(),
        },
      ];

      const initialQuizState: QuizState = {
        quizId: DEFAULT_QUIZ_ID,
        status: 'WAITING',
        currentQuestionNumber: 1,
        currentQuestionId: 'q1',
        questionStartTime: 0,
        questionEndTime: 0,
        durationSeconds: 30,
        updatedAt: Date.now(),
      };

      const batch = writeBatch(db);
      batch.set(doc(db, 'quizzes', DEFAULT_QUIZ_ID), initialQuiz);
      batch.set(doc(db, 'quizState', DEFAULT_QUIZ_ID), initialQuizState);
      for (const q of initialQuestions) {
        batch.set(doc(db, 'questions', q.id), q);
      }
      await batch.commit();
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('Initial seed check deferred: Firestore client is establishing connection.');
      return;
    }
    console.error('Initial database seed check failed:', error);
  }
}

// Subscribe to Quizzes list
export function subscribeToQuizzes(
  onUpdate: (quizzes: Quiz[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, 'quizzes');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Quiz[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Quiz);
      });
      onUpdate(list);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, 'quizzes');
    }
  );
}

// Subscribe to Questions for a quiz
export function subscribeToQuestions(
  quizId: string,
  onUpdate: (questions: Question[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const qQuery = query(collection(db, 'questions'), where('quizId', '==', quizId));
  return onSnapshot(
    qQuery,
    (snapshot) => {
      const list: Question[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Question);
      });
      list.sort((a, b) => a.questionNumber - b.questionNumber);
      onUpdate(list);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, 'questions');
    }
  );
}

// Subscribe to Authoritative Quiz State
export function subscribeToQuizState(
  quizId: string,
  onUpdate: (state: QuizState | null) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'quizState', quizId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as QuizState);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.GET, `quizState/${quizId}`);
    }
  );
}

// Subscribe to Participants for a quiz
export function subscribeToParticipants(
  quizId: string,
  onUpdate: (participants: Participant[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const pQuery = query(collection(db, 'participants'), where('quizId', '==', quizId));
  return onSnapshot(
    pQuery,
    (snapshot) => {
      const list: Participant[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Participant);
      });
      list.sort((a, b) => (b.score || 0) - (a.score || 0));
      onUpdate(list);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, 'participants');
    }
  );
}

// Subscribe to all Answers for a quiz (Admin and Results calculation)
export function subscribeToAnswers(
  quizId: string,
  onUpdate: (answers: AnswerSubmission[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const aQuery = query(collection(db, 'answers'), where('quizId', '==', quizId));
  return onSnapshot(
    aQuery,
    (snapshot) => {
      const list: AnswerSubmission[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AnswerSubmission);
      });
      onUpdate(list);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, 'answers');
    }
  );
}

// Subscribe to Student's submitted answers
export function subscribeToStudentAnswers(
  quizId: string,
  participantId: string,
  onUpdate: (answers: AnswerSubmission[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, 'answers'),
    where('quizId', '==', quizId),
    where('participantId', '==', participantId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list: AnswerSubmission[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AnswerSubmission);
      });
      onUpdate(list);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, 'answers');
    }
  );
}

// Subscribe to Published Results
export function subscribeToResults(
  quizId: string,
  onUpdate: (results: QuizResult[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const rQuery = query(collection(db, 'results'), where('quizId', '==', quizId));
  return onSnapshot(
    rQuery,
    (snapshot) => {
      const list: QuizResult[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as QuizResult);
      });
      list.sort((a, b) => a.rank - b.rank);
      onUpdate(list);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, 'results');
    }
  );
}

// Subscribe to a specific student's result
export function subscribeToStudentResult(
  quizId: string,
  participantId: string,
  onUpdate: (result: QuizResult | null) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'results', `${quizId}_${participantId}`);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as QuizResult);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.GET, `results/${quizId}_${participantId}`);
    }
  );
}

// Student Registration
export async function registerStudent(
  quizId: string,
  name: string,
  rollNumber: string,
  department: string
): Promise<Participant> {
  try {
    const cleanRoll = rollNumber.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanDept = department.trim();

    // Check for duplicate roll number in this quiz
    const existingQ = query(
      collection(db, 'participants'),
      where('quizId', '==', quizId),
      where('rollNumber', '==', cleanRoll)
    );
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      // Re-use existing participant session
      return existingSnap.docs[0].data() as Participant;
    }

    const participantId = `part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newParticipant: Participant = {
      id: participantId,
      quizId,
      name: cleanName,
      rollNumber: cleanRoll,
      department: cleanDept,
      status: 'WAITING',
      score: 0,
      correct: 0,
      incorrect: 0,
      registeredAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'participants', participantId), newParticipant);
    return newParticipant;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'participants');
  }
}

// Submit Answer (Atomic Lock)
export async function submitStudentAnswer(
  quizId: string,
  questionId: string,
  questionNumber: number,
  participantId: string,
  selectedOptionIndex: number,
  isCorrect: boolean
): Promise<void> {
  const answerId = `${quizId}_${participantId}_q${questionNumber}`;
  try {
    const answerRef = doc(db, 'answers', answerId);
    const submission: AnswerSubmission = {
      id: answerId,
      quizId,
      questionId,
      questionNumber,
      participantId,
      selectedOptionIndex,
      isCorrect,
      submittedAt: Date.now(),
    };

    await setDoc(answerRef, submission);

    // Update participant live score atomically
    const partRef = doc(db, 'participants', participantId);
    const partSnap = await getDoc(partRef);
    if (partSnap.exists()) {
      const part = partSnap.data() as Participant;
      const newScore = (part.score || 0) + (isCorrect ? 1 : 0);
      const newCorrect = (part.correct || 0) + (isCorrect ? 1 : 0);
      const newIncorrect = (part.incorrect || 0) + (isCorrect ? 0 : 1);
      await setDoc(
        partRef,
        {
          ...part,
          score: newScore,
          correct: newCorrect,
          incorrect: newIncorrect,
          status: 'LIVE',
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `answers/${answerId}`);
  }
}

// Admin Operations
export async function adminStartQuiz(
  quizId: string,
  firstQuestion: Question
): Promise<void> {
  try {
    const duration = firstQuestion.durationSeconds || 30;
    const now = Date.now();
    const endTime = now + duration * 1000;

    const batch = writeBatch(db);
    batch.set(
      doc(db, 'quizState', quizId),
      {
        quizId,
        status: 'LIVE',
        currentQuestionNumber: firstQuestion.questionNumber,
        currentQuestionId: firstQuestion.id,
        questionStartTime: now,
        questionEndTime: endTime,
        durationSeconds: duration,
        updatedAt: now,
      } as QuizState,
      { merge: true }
    );

    batch.set(
      doc(db, 'quizzes', quizId),
      {
        status: 'LIVE',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `quizState/${quizId}`);
  }
}

export async function adminNextQuestion(
  quizId: string,
  nextQuestion: Question
): Promise<void> {
  try {
    const duration = nextQuestion.durationSeconds || 30;
    const now = Date.now();
    const endTime = now + duration * 1000;

    await setDoc(
      doc(db, 'quizState', quizId),
      {
        quizId,
        status: 'LIVE',
        currentQuestionNumber: nextQuestion.questionNumber,
        currentQuestionId: nextQuestion.id,
        questionStartTime: now,
        questionEndTime: endTime,
        durationSeconds: duration,
        updatedAt: now,
      } as QuizState,
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `quizState/${quizId}`);
  }
}

export async function adminPreviousQuestion(
  quizId: string,
  prevQuestion: Question
): Promise<void> {
  try {
    const duration = prevQuestion.durationSeconds || 30;
    const now = Date.now();
    const endTime = now + duration * 1000;

    await setDoc(
      doc(db, 'quizState', quizId),
      {
        quizId,
        status: 'LIVE',
        currentQuestionNumber: prevQuestion.questionNumber,
        currentQuestionId: prevQuestion.id,
        questionStartTime: now,
        questionEndTime: endTime,
        durationSeconds: duration,
        updatedAt: now,
      } as QuizState,
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `quizState/${quizId}`);
  }
}

export async function adminJumpToQuestion(
  quizId: string,
  targetQuestion: Question
): Promise<void> {
  try {
    const duration = targetQuestion.durationSeconds || 30;
    const now = Date.now();
    const endTime = now + duration * 1000;

    await setDoc(
      doc(db, 'quizState', quizId),
      {
        quizId,
        status: 'LIVE',
        currentQuestionNumber: targetQuestion.questionNumber,
        currentQuestionId: targetQuestion.id,
        questionStartTime: now,
        questionEndTime: endTime,
        durationSeconds: duration,
        updatedAt: now,
      } as QuizState,
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `quizState/${quizId}`);
  }
}

export async function adminRestartQuestionTimer(
  quizId: string,
  durationSeconds?: number
): Promise<void> {
  try {
    const duration = durationSeconds || 30;
    const now = Date.now();
    const endTime = now + duration * 1000;

    await setDoc(
      doc(db, 'quizState', quizId),
      {
        questionStartTime: now,
        questionEndTime: endTime,
        durationSeconds: duration,
        status: 'LIVE',
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `quizState/${quizId}`);
  }
}

export async function adminExtendQuestionTimer(
  quizId: string,
  extraSeconds: number
): Promise<void> {
  try {
    const qsDoc = await getDoc(doc(db, 'quizState', quizId));
    const now = Date.now();
    let currentEndTime = now;
    let startTime = now;
    let oldDuration = 30;

    if (qsDoc.exists()) {
      const qs = qsDoc.data() as QuizState;
      currentEndTime = qs.questionEndTime || now;
      startTime = qs.questionStartTime || now;
      oldDuration = qs.durationSeconds || 30;
    }

    const baseTime = currentEndTime > now ? currentEndTime : now;
    const newEndTime = baseTime + extraSeconds * 1000;
    const newDuration = Math.max(oldDuration + extraSeconds, Math.ceil((newEndTime - startTime) / 1000));

    await setDoc(
      doc(db, 'quizState', quizId),
      {
        questionEndTime: newEndTime,
        durationSeconds: newDuration,
        status: 'LIVE',
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `quizState/${quizId}`);
  }
}

export async function adminEndQuiz(quizId: string): Promise<void> {
  try {
    const now = Date.now();
    const batch = writeBatch(db);

    batch.set(
      doc(db, 'quizState', quizId),
      {
        status: 'ENDED',
        updatedAt: now,
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'quizzes', quizId),
      {
        status: 'ENDED',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `quizState/${quizId}`);
  }
}

export async function adminPublishResults(
  quizId: string,
  participants: Participant[],
  answers: AnswerSubmission[],
  totalQuestions: number
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    // Calculate official scores strictly from actual answers, falling back to participant scores
    const effectiveTotalQuestions = totalQuestions > 0 ? totalQuestions : 1;
    const participantStats = participants.map((p) => {
      const pAnswers = answers.filter((a) => a.participantId === p.id);
      const hasAnswers = pAnswers.length > 0;
      const correct = hasAnswers
        ? pAnswers.filter((a) => a.isCorrect).length
        : Math.max(p.correct ?? p.score ?? 0, 0);
      const incorrect = hasAnswers
        ? pAnswers.filter((a) => !a.isCorrect).length
        : Math.max(p.incorrect ?? 0, 0);
      const score = correct;
      const percentage = Math.round((score / effectiveTotalQuestions) * 100);

      return {
        participantId: p.id,
        name: p.name,
        rollNumber: p.rollNumber,
        department: p.department,
        score,
        percentage,
        correct,
        incorrect,
        totalQuestions: effectiveTotalQuestions,
      };
    });

    // Sort descending by score, then percentage, then roll number
    participantStats.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return a.rollNumber.localeCompare(b.rollNumber);
    });

    // Assign rank and write to results collection
    participantStats.forEach((stat, index) => {
      const rank = index + 1;
      const resultDocId = `${quizId}_${stat.participantId}`;
      const resultObj: QuizResult = {
        id: resultDocId,
        quizId,
        participantId: stat.participantId,
        name: stat.name,
        rollNumber: stat.rollNumber,
        department: stat.department,
        score: stat.score,
        percentage: stat.percentage,
        correct: stat.correct,
        incorrect: stat.incorrect,
        totalQuestions: stat.totalQuestions,
        rank,
        publishedAt: now,
      };
      batch.set(doc(db, 'results', resultDocId), resultObj);

      // Also mark participant status as COMPLETED
      batch.set(
        doc(db, 'participants', stat.participantId),
        {
          status: 'COMPLETED',
          score: stat.score,
          correct: stat.correct,
          incorrect: stat.incorrect,
        },
        { merge: true }
      );
    });

    // Update Quiz and QuizState
    batch.set(
      doc(db, 'quizState', quizId),
      {
        status: 'RESULTS_PUBLISHED',
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'quizzes', quizId),
      {
        status: 'RESULTS_PUBLISHED',
        updatedAt: now,
      },
      { merge: true }
    );

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `results`);
  }
}

export async function adminResetQuiz(
  quizId: string,
  firstQuestionId?: string,
  wipeParticipants: boolean = false
): Promise<void> {
  try {
    const now = Date.now();
    const batch = writeBatch(db);

    batch.set(
      doc(db, 'quizState', quizId),
      {
        quizId,
        status: 'WAITING',
        currentQuestionNumber: 1,
        currentQuestionId: firstQuestionId || '',
        questionStartTime: 0,
        questionEndTime: 0,
        updatedAt: now,
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'quizzes', quizId),
      {
        status: 'WAITING',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await batch.commit();

    if (wipeParticipants) {
      await adminDeleteAllParticipants(quizId);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `quizState/${quizId}`);
  }
}

// Helper to delete all documents matching a query in safe chunks up to 400
async function deleteQueryBatch(q: any): Promise<number> {
  const snapshot = await getDocs(q);
  if (snapshot.empty) return 0;

  let count = 0;
  let batch = writeBatch(db);
  let batchCount = 0;

  for (const docSnapshot of snapshot.docs) {
    batch.delete(docSnapshot.ref);
    count++;
    batchCount++;
    if (batchCount >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return count;
}

// Delete a single participant and their answers/results from Firestore
export async function adminDeleteSingleParticipant(participantId: string, quizId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'participants', participantId));
    batch.delete(doc(db, 'results', `${quizId}_${participantId}`));
    await batch.commit();

    // Also remove any submitted answers by this participant
    const answersQ = query(
      collection(db, 'answers'),
      where('quizId', '==', quizId),
      where('participantId', '==', participantId)
    );
    await deleteQueryBatch(answersQ);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `participants/${participantId}`);
  }
}

// Delete ALL participants, answers, and results for a specific quiz event
export async function adminDeleteAllParticipants(quizId: string): Promise<{
  participantsDeleted: number;
  answersDeleted: number;
  resultsDeleted: number;
}> {
  try {
    const pQ = query(collection(db, 'participants'), where('quizId', '==', quizId));
    const aQ = query(collection(db, 'answers'), where('quizId', '==', quizId));
    const rQ = query(collection(db, 'results'), where('quizId', '==', quizId));

    const [participantsDeleted, answersDeleted, resultsDeleted] = await Promise.all([
      deleteQueryBatch(pQ),
      deleteQueryBatch(aQ),
      deleteQueryBatch(rQ),
    ]);

    // Reset quiz status to WAITING if it was in RESULTS_PUBLISHED
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (quizDoc.exists()) {
      const qData = quizDoc.data() as Quiz;
      if (qData.status === 'RESULTS_PUBLISHED') {
        const batch = writeBatch(db);
        batch.set(
          doc(db, 'quizzes', quizId),
          { status: 'WAITING', updatedAt: new Date().toISOString() },
          { merge: true }
        );
        batch.set(
          doc(db, 'quizState', quizId),
          { status: 'WAITING', updatedAt: Date.now() },
          { merge: true }
        );
        await batch.commit();
      }
    }

    return { participantsDeleted, answersDeleted, resultsDeleted };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `participants`);
    return { participantsDeleted: 0, answersDeleted: 0, resultsDeleted: 0 };
  }
}

// Clear / Delete official calculated results for a quiz event to refresh and reset the leaderboard
export async function adminClearOfficialResults(quizId: string): Promise<number> {
  try {
    const rQ = query(collection(db, 'results'), where('quizId', '==', quizId));
    const resultsDeleted = await deleteQueryBatch(rQ);

    // Revert quiz status back from RESULTS_PUBLISHED to ENDED (awaiting new recalculation)
    const batch = writeBatch(db);
    batch.set(
      doc(db, 'quizState', quizId),
      {
        status: 'ENDED',
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'quizzes', quizId),
      {
        status: 'ENDED',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await batch.commit();
    return resultsDeleted;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `results`);
    return 0;
  }
}

// Delete a single result document by resultId
export async function adminDeleteSingleResult(resultId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'results', resultId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `results/${resultId}`);
  }
}

export async function adminSaveQuestion(question: Question): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'questions', question.id), question);

    if (question.quizId) {
      // Update totalQuestions if needed
      const qQuery = query(collection(db, 'questions'), where('quizId', '==', question.quizId));
      const snapshot = await getDocs(qQuery);
      const allQuestions: Question[] = [];
      let exists = false;
      snapshot.forEach((d) => {
        const data = d.data() as Question;
        if (data.id === question.id) {
          exists = true;
          allQuestions.push(question);
        } else {
          allQuestions.push(data);
        }
      });
      if (!exists) {
        allQuestions.push(question);
      }

      batch.set(
        doc(db, 'quizzes', question.quizId),
        {
          totalQuestions: allQuestions.length,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `questions/${question.id}`);
  }
}

export async function adminDeleteQuestion(questionId: string, quizId?: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'questions', questionId));

    if (quizId) {
      const qQuery = query(collection(db, 'questions'), where('quizId', '==', quizId));
      const snapshot = await getDocs(qQuery);
      const remaining: Question[] = [];
      snapshot.forEach((d) => {
        if (d.id !== questionId) {
          remaining.push(d.data() as Question);
        }
      });

      // Sort remaining questions by existing questionNumber
      remaining.sort((a, b) => a.questionNumber - b.questionNumber);

      // Renumber sequentially 1..N
      remaining.forEach((q, idx) => {
        const newNumber = idx + 1;
        if (q.questionNumber !== newNumber) {
          batch.update(doc(db, 'questions', q.id), { questionNumber: newNumber });
        }
      });

      // Update quiz doc totalQuestions
      batch.set(
        doc(db, 'quizzes', quizId),
        {
          totalQuestions: remaining.length,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update quizState if question count changed
      const quizStateSnap = await getDoc(doc(db, 'quizState', quizId));
      if (quizStateSnap.exists()) {
        const qs = quizStateSnap.data() as QuizState;
        let currentNum = qs.currentQuestionNumber;
        if (currentNum > remaining.length && remaining.length > 0) {
          currentNum = remaining.length;
        } else if (remaining.length === 0) {
          currentNum = 1;
        }
        const activeQ = remaining.find((q) => q.questionNumber === currentNum);
        batch.update(doc(db, 'quizState', quizId), {
          currentQuestionNumber: currentNum,
          currentQuestionId: activeQ ? activeQ.id : '',
          updatedAt: Date.now(),
        });
      }
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `questions/${questionId}`);
  }
}

export async function adminSaveQuiz(quiz: Quiz): Promise<void> {
  try {
    await setDoc(doc(db, 'quizzes', quiz.id), quiz, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `quizzes/${quiz.id}`);
  }
}

export function generateStarterQuestions(quizId: string): Question[] {
  const now = new Date().toISOString();
  return [
    {
      id: `${quizId}_q1`,
      quizId,
      questionNumber: 1,
      questionText: 'Which protocol is used for encrypted, secure web communications over SSL/TLS?',
      options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
      correctOptionIndex: 2,
      durationSeconds: 30,
      createdAt: now,
    },
    {
      id: `${quizId}_q2`,
      quizId,
      questionNumber: 2,
      questionText: 'Which data structure strictly operates on a Last-In, First-Out (LIFO) order?',
      options: ['Queue', 'Stack', 'Array', 'Binary Search Tree'],
      correctOptionIndex: 1,
      durationSeconds: 30,
      createdAt: now,
    },
    {
      id: `${quizId}_q3`,
      quizId,
      questionNumber: 3,
      questionText: 'In database management systems, what does the "A" in the ACID guarantee represent?',
      options: ['Atomicity', 'Access Control', 'Authentication', 'Asynchronous'],
      correctOptionIndex: 0,
      durationSeconds: 30,
      createdAt: now,
    },
    {
      id: `${quizId}_q4`,
      quizId,
      questionNumber: 4,
      questionText: 'What is the average case time complexity of searching a balanced Binary Search Tree (BST)?',
      options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
      correctOptionIndex: 2,
      durationSeconds: 30,
      createdAt: now,
    },
  ];
}

export async function adminCreateNewQuiz(
  quiz: Quiz,
  seedQuestions: boolean = true
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const questions = seedQuestions ? generateStarterQuestions(quiz.id) : [];
    const quizWithTotal: Quiz = {
      ...quiz,
      totalQuestions: questions.length,
      createdAt: quiz.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    batch.set(doc(db, 'quizzes', quiz.id), quizWithTotal);

    const initialQuizState: QuizState = {
      quizId: quiz.id,
      status: 'WAITING',
      currentQuestionNumber: 1,
      currentQuestionId: questions[0]?.id || '',
      questionStartTime: 0,
      questionEndTime: 0,
      durationSeconds: quiz.questionDurationSeconds || 30,
      updatedAt: Date.now(),
    };
    batch.set(doc(db, 'quizState', quiz.id), initialQuizState);

    for (const q of questions) {
      batch.set(doc(db, 'questions', q.id), q);
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `quizzes/${quiz.id}`);
  }
}

export async function adminDeleteQuiz(quizId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'quizzes', quizId));
    batch.delete(doc(db, 'quizState', quizId));

    // Delete associated questions
    const qSnap = await getDocs(query(collection(db, 'questions'), where('quizId', '==', quizId)));
    qSnap.forEach((d) => batch.delete(d.ref));

    // Delete associated participants
    const pSnap = await getDocs(query(collection(db, 'participants'), where('quizId', '==', quizId)));
    pSnap.forEach((d) => batch.delete(d.ref));

    // Delete associated answers
    const aSnap = await getDocs(query(collection(db, 'answers'), where('quizId', '==', quizId)));
    aSnap.forEach((d) => batch.delete(d.ref));

    // Delete associated results
    const rSnap = await getDocs(query(collection(db, 'results'), where('quizId', '==', quizId)));
    rSnap.forEach((d) => batch.delete(d.ref));

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `quizzes/${quizId}`);
  }
}

export function getStudentEventLink(quizId: string): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const path = window.location.pathname.replace(/\/$/, '');
  return `${origin}${path}#register?quiz=${encodeURIComponent(quizId)}`;
}

export function getAuditoriumEventLink(quizId: string): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const path = window.location.pathname.replace(/\/$/, '');
  return `${origin}${path}#auditorium?quiz=${encodeURIComponent(quizId)}`;
}

export function extractQuizIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check window.location.search (?quiz=... or ?event=...)
  const searchParams = new URLSearchParams(window.location.search);
  const quizFromSearch = searchParams.get('quiz') || searchParams.get('event');
  if (quizFromSearch) return quizFromSearch;

  // 2. Check window.location.hash
  const hash = window.location.hash;
  if (hash) {
    // If hash has query string e.g. #register?quiz=abc or #auditorium?quiz=abc
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
      const hashParams = new URLSearchParams(hash.slice(qIdx + 1));
      const val = hashParams.get('quiz') || hashParams.get('event');
      if (val) return val;
    }
    // If hash has #event=abc or #quiz=abc
    const matchParam = hash.match(/(?:quiz|event)=([^&?#/]+)/i);
    if (matchParam && matchParam[1]) return decodeURIComponent(matchParam[1]);

    // If hash is #register/abc or #event/abc
    const matchSlash = hash.match(/#(?:register|event|quiz|auditorium)\/([^&?#/]+)/i);
    if (matchSlash && matchSlash[1]) return decodeURIComponent(matchSlash[1]);
  }

  return null;
}
