import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Clock, BookOpen } from 'lucide-react';
import { Quiz, Question, QuizStatus } from '../types';

interface QuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuiz: (quiz: Quiz) => void;
  editingQuiz?: Quiz | null;
}

export function QuizEditorModal({ isOpen, onClose, onSaveQuiz, editingQuiz }: QuizEditorModalProps) {
  const [title, setTitle] = useState(editingQuiz ? editingQuiz.title : 'College Technical Quiz 2026');
  const [description, setDescription] = useState(editingQuiz ? editingQuiz.description : 'Test your knowledge on algorithms, web systems, and databases.');
  const [timerSeconds, setTimerSeconds] = useState(editingQuiz ? editingQuiz.timerSeconds : 30);
  const [scheduledStartTime, setScheduledStartTime] = useState(editingQuiz ? editingQuiz.scheduledStartTime : () => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });

  const [questions, setQuestions] = useState<Question[]>(editingQuiz ? editingQuiz.questions : [
    {
      id: 'q-1',
      quizId: 'quiz-new',
      questionNumber: 1,
      questionText: 'Which language is primarily used for styling web pages?',
      options: ['HTML', 'CSS', 'Python', 'Java'],
      correctOptionIndex: 1, // CSS
      durationSeconds: 30,
    }
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: 'q-' + Date.now() + Math.random().toString(36).substring(2, 5),
      quizId: 'quiz-new',
      questionNumber: questions.length + 1,
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      durationSeconds: timerSeconds,
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateText = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].questionText = text;
    setQuestions(updated);
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = text;
    setQuestions(updated);
  };

  const handleSetCorrect = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctOptionIndex = optIdx;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert('Quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, questionNumber: i + 1 }));
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a quiz title.');
      return;
    }

    const quiz: Quiz = {
      id: editingQuiz ? editingQuiz.id : 'quiz-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      status: editingQuiz ? editingQuiz.status : 'SCHEDULED' as QuizStatus,
      currentQuestionIndex: editingQuiz ? editingQuiz.currentQuestionIndex : 0,
      timerSeconds: Number(timerSeconds),
      totalQuestions: questions.length,
      scheduledStartTime: scheduledStartTime,
      createdAt: editingQuiz ? editingQuiz.createdAt : new Date().toLocaleString(),
      questions: questions.map((q, i) => ({ ...q, questionNumber: i + 1, durationSeconds: Number(q.durationSeconds || timerSeconds) }))
    };

    onSaveQuiz(quiz);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col my-6">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{editingQuiz ? 'Edit Quiz & Questions' : 'Create New College Quiz'}</h3>
              <p className="text-xs text-slate-500">Configure quiz details, scheduled start time, and multi-choice question items.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quiz Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scheduled Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledStartTime}
                  onChange={(e) => setScheduledStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Default Question Timer (Seconds)
                </label>
                <input
                  type="number"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  min={5}
                  max={120}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Question Bank ({questions.length})</h4>
                <p className="text-xs text-slate-500">Define options [A, B, C, D] and select the correct answer.</p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={q.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Question {qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(qIdx)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Question Text <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => handleUpdateText(qIdx, e.target.value)}
                    placeholder="e.g. What is the output of..."
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-600">Options [A, B, C, D] — Select Correct Answer</label>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correctOptionIndex === optIdx}
                        onChange={() => handleSetCorrect(qIdx, optIdx)}
                        className="w-4 h-4 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className="text-xs font-bold text-slate-600 w-5">{String.fromCharCode(65 + optIdx)}:</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)} text`}
                        required
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" /> Save Quiz & Questions
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
