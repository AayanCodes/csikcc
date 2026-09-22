import { Database, ShieldCheck, Server, Key, Terminal } from 'lucide-react';

export function SqlSchemaView() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Supabase Production Architecture & SQL Schema</h2>
              <p className="text-xs text-slate-400 mt-0.5">PostgreSQL Database Migrations, RLS Policies, and Environment Configuration</p>
            </div>
          </div>
        </div>

        {/* Environment Variables Section */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" /> Environment Variables Setup
          </h3>
          <p className="text-xs text-slate-300">
            Configure these variables in your Vercel project settings and local <code className="bg-slate-900 px-1.5 py-0.5 rounded text-blue-300 font-mono">.env</code> file:
          </p>
          <pre className="bg-slate-950 p-4 rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto border border-slate-800">
{`# Frontend-safe (Public)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Server-only (Private Secret - NEVER expose in frontend code)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key`}
          </pre>
        </div>

        {/* Database Tables & Migrations */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" /> SQL Migration Script (<code className="font-mono text-xs text-emerald-300">supabase/migrations/001_initial_schema.sql</code>)
          </h3>

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto space-y-3">
              <div className="text-emerald-400">-- 1. EVENTS TABLE</div>
              <div>{`CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);`}</div>

              <div className="text-emerald-400 pt-2">-- 2. QUIZZES TABLE</div>
              <div>{`CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Active', 'Finished')),
  current_question_index INT DEFAULT 0,
  timer_seconds INT DEFAULT 15,
  total_questions INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);`}</div>

              <div className="text-emerald-400 pt-2">-- 3. QUESTIONS TABLE (Secured for Auditorium & Admin Only)</div>
              <div>{`CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INT NOT NULL,
  duration_seconds INT DEFAULT 15
);`}</div>

              <div className="text-emerald-400 pt-2">-- 4. PARTICIPANTS TABLE</div>
              <div>{`CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'IN_PROGRESS',
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  unanswered_count INT DEFAULT 0,
  total_score INT DEFAULT 0,
  completion_time TIMESTAMPTZ
);`}</div>

              <div className="text-emerald-400 pt-2">-- 5. ANSWERS TABLE</div>
              <div>{`CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  selected_option_index INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);`}</div>
            </div>
          </div>
        </div>

        {/* Security & RLS Policies */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> Row Level Security (RLS) & Question Privacy
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            To ensure students can never query or receive question text through browser inspection or direct API calls:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-2">
            <li>Supabase RLS is enabled on the <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300 font-mono">questions</code> table, restricting read access exclusively to authenticated admin organizer roles and secure auditorium server endpoints.</li>
            <li>Student client APIs return only options, question numbers, and timer expiry stamps.</li>
            <li>All score calculations and answer validations occur server-side.</li>
          </ul>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-4 border-t border-slate-800">
          <Terminal className="w-4 h-4 text-emerald-400" /> Ready for Vercel deployment with zero filesystem persistence.
        </div>

      </div>
    </div>
  );
}
