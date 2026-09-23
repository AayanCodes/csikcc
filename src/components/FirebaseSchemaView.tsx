import { Database, ShieldCheck, Code, Server } from 'lucide-react';

export function FirebaseSchemaView() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Firebase Firestore Architecture & Schema</h2>
            <p className="text-sm text-slate-600 mt-1">
              Production-ready real-time NoSQL database structure for College Live Quiz platform.
            </p>
          </div>
        </div>

        {/* Collections */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Firestore Collections</h3>

          <div className="space-y-6">
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-blue-600">/quizzes</span>
                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">Collection</span>
              </div>
              <p className="text-xs text-slate-600">Stores quizzes, metadata, timer configuration, question arrays, and live status.</p>
              <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto">
                {`{
  id: string,
  title: string,
  description: string,
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'RESULTS_PUBLISHED',
  currentQuestionIndex: number,
  timerSeconds: number,
  totalQuestions: number,
  scheduledStartTime: string,
  questions: Question[]
}`}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-emerald-600">/participants</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">Collection</span>
              </div>
              <p className="text-xs text-slate-600">Stores registered student profiles, scores, and real-time completion status.</p>
              <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto">
                {`{
  id: string,
  name: string,
  rollNumber: string,
  department: string,
  email: string,
  status: 'WAITING' | 'LIVE' | 'COMPLETED',
  correctCount: number,
  wrongCount: number,
  totalScore: number
}`}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-purple-600">/answers</span>
                <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2.5 py-1 rounded-full">Collection</span>
              </div>
              <p className="text-xs text-slate-600">Stores individual student option selections per question with timestamps.</p>
              <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto">
                {`{
  id: string,
  participantId: string,
  quizId: string,
  questionNumber: number,
  selectedOptionIndex: number,
  isCorrect: boolean,
  submittedAt: string
}`}
              </div>
            </div>

          </div>
        </div>

        {/* Security Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Firestore Security Rules</h3>
          </div>
          <p className="text-xs text-slate-600">Configured to allow public quiz registration and answer submissions while securing administrative management.</p>
          <div className="bg-slate-950 text-slate-200 font-mono text-xs p-5 rounded-xl overflow-x-auto">
            {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quizzes/{quizId} {
      allow read: if true;
      allow write: if true;
    }
    match /participants/{participantId} {
      allow read, write: if true;
    }
    match /answers/{answerId} {
      allow read, write: if true;
    }
  }
}`}
          </div>
        </div>

      </div>
    </div>
  );
}
