import { BarChart3, Users, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Quiz, Participant } from '../types';

interface AdminAnalyticsProps {
  quiz: Quiz;
  participants: Participant[];
}

export function AdminAnalytics({ quiz, participants }: AdminAnalyticsProps) {
  const completed = participants.filter(p => p.status === 'COMPLETED');
  const completionRate = participants.length > 0 ? ((completed.length / participants.length) * 100).toFixed(1) : '0';
  const scores = completed.map(p => p.totalScore);
  const avgScore = completed.length > 0 ? (scores.reduce((a, b) => a + b, 0) / completed.length).toFixed(1) : '0';
  const highScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowScore = scores.length > 0 ? Math.min(...scores) : 0;

  return (
    <div className="space-y-8">
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion Rate</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{completionRate}%</div>
            <span className="text-xs text-emerald-600 mt-1 inline-block">{completed.length} of {participants.length} finished</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</span>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">{avgScore} / {quiz.totalQuestions}</div>
            <span className="text-xs text-slate-500 mt-1 inline-block">Across completed responses</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Highest Score</span>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">{highScore}</div>
            <span className="text-xs text-slate-500 mt-1 inline-block">Top participant result</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lowest Score</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{lowScore}</div>
            <span className="text-xs text-slate-500 mt-1 inline-block">Minimum recorded</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Question breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Question Performance Analysis</h3>
          <p className="text-xs text-slate-500">Review question details and correct answer distribution for {quiz.title}.</p>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Question {idx + 1}</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Correct: {String.fromCharCode(65 + q.correctOptionIndex)}. {q.options[q.correctOptionIndex]}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{q.questionText}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className={`p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between ${
                    optIdx === q.correctOptionIndex ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                    {optIdx === q.correctOptionIndex && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">Correct Answer</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
