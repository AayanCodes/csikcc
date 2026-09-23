import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface AdminQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  quizId: string;
  nextQuestionNumber: number;
  onSave: (question: Question) => Promise<void>;
}

export const AdminQuestionModal: React.FC<AdminQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  quizId,
  nextQuestionNumber,
  onSave,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setQuestionText(question.questionText);
      setImageUrl(question.imageUrl || '');
      setOptA(question.options[0] || '');
      setOptB(question.options[1] || '');
      setOptC(question.options[2] || '');
      setOptD(question.options[3] || '');
      setCorrectIndex(question.correctOptionIndex);
      setDuration(question.durationSeconds || 30);
    } else {
      setQuestionText('');
      setImageUrl('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectIndex(0);
      setDuration(30);
    }
    setError(null);
  }, [question, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Question text is required.');
      return;
    }
    if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setError('All 4 options (A, B, C, D) are required.');
      return;
    }

    setIsSaving(true);
    try {
      const qObj: Question = {
        id: question ? question.id : `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        quizId,
        questionNumber: question ? question.questionNumber : nextQuestionNumber,
        questionText: questionText.trim(),
        imageUrl: imageUrl.trim() || undefined,
        options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
        correctOptionIndex: correctIndex,
        durationSeconds: duration > 0 ? duration : 30,
        createdAt: question?.createdAt || new Date().toISOString(),
      };
      await onSave(qObj);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {question ? `Edit Question #${question.questionNumber}` : `Add Question #${nextQuestionNumber}`}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Question Text
            </label>
            <textarea
              required
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Which layer of the OSI model does the TCP protocol belong to?"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Question Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g. https://images.unsplash.com/... or image link"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imageUrl.trim() && (
              <div className="mt-2 relative w-full h-32 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Question preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Options & Correct Answer
            </label>
            <p className="text-xs text-slate-500">
              Select the radio button next to the correct answer.
            </p>

            {/* Option A */}
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="correctOpt"
                checked={correctIndex === 0}
                onChange={() => setCorrectIndex(0)}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-xs font-bold w-6">A:</span>
              <input
                type="text"
                required
                value={optA}
                onChange={(e) => setOptA(e.target.value)}
                placeholder="Option A text"
                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Option B */}
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="correctOpt"
                checked={correctIndex === 1}
                onChange={() => setCorrectIndex(1)}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-xs font-bold w-6">B:</span>
              <input
                type="text"
                required
                value={optB}
                onChange={(e) => setOptB(e.target.value)}
                placeholder="Option B text"
                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Option C */}
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="correctOpt"
                checked={correctIndex === 2}
                onChange={() => setCorrectIndex(2)}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-xs font-bold w-6">C:</span>
              <input
                type="text"
                required
                value={optC}
                onChange={(e) => setOptC(e.target.value)}
                placeholder="Option C text"
                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Option D */}
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="correctOpt"
                checked={correctIndex === 3}
                onChange={() => setCorrectIndex(3)}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-xs font-bold w-6">D:</span>
              <input
                type="text"
                required
                value={optD}
                onChange={(e) => setOptD(e.target.value)}
                placeholder="Option D text"
                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Timer Duration (Seconds)
            </label>
            <input
              type="number"
              min={5}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-32 px-3 py-1.5 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
