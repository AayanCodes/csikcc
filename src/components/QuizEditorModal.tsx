import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Quiz, Question } from '../types';

interface QuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuiz: (quiz: Quiz) => void;
}

export function QuizEditorModal({ isOpen, onClose, onSaveQuiz }: QuizEditorModalProps) {
  const [title, setTitle] = useState('College Hackathon & Web Quiz 2026');
  const [description, setDescription] = useState('Test your knowledge of web development, algorithms, and system design.');
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [scheduledStartTime, setScheduledStartTime] = useState(() => {
    const d = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now default
    return d.toISOString().slice(0, 16);
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-new-1',
      quizId: 'quiz-new',
      questionNumber: 1,
      questionText: 'Which CSS property creates a flex container?',
      options: ['display: flex', 'display: block', 'display: grid', 'display: inline'],
      correctOptionIndex: 0,
      durationSeconds: 15,
    }
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: 'q-' + Date.now(),
      quizId: 'quiz-new',
      questionNumber: questions.length + 1,
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      durationSeconds: timerSeconds,
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  const handleSetCorrect = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = optIndex;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('Quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, questionNumber: i + 1 }));
    setQuestions(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a quiz title.');
      return;
    }

    const newQuiz: Quiz = {
      id: 'quiz-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      status: 'Published',
      currentQuestionIndex: 0,
      timerSeconds: Number(timerSeconds),
      totalQuestions: questions.length,
      scheduledStartTime: scheduledStartTime,
      createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      questions: questions.map((q, i) => ({ ...q, questionNumber: i + 1 }))
    };

    onSaveQuiz(newQuiz);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col my-8">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create / Edit Quiz & Set Start Time</h3>
            <p className="text-xs text-slate-500">Configure quiz title, scheduled start time, questions, and timer duration.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
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
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scheduled Quiz Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledStartTime}
                  onChange={(e) => setScheduledStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Timer per Question (Seconds)
                </label>
                <input
                  type="number"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  min={5}
                  max={120}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Questions ({questions.length})</h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={q.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Question {qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(qIdx)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Question Text</label>
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                    placeholder="Enter question prompt..."
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Options [A, B, C, D] (Select Correct)</label>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correctOptionIndex === optIdx}
                        onChange={() => handleSetCorrect(qIdx, optIdx)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className="text-xs font-bold text-slate-500 w-5">{String.fromCharCode(65 + optIdx)}:</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        required
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Quiz & Set Schedule
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
