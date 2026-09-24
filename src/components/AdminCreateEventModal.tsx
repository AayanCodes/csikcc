import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';

interface AdminCreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (quiz: Quiz, seedQuestions: boolean) => Promise<void>;
  existingQuizIds: string[];
}

export const AdminCreateEventModal: React.FC<AdminCreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  existingQuizIds,
}) => {
  const [title, setTitle] = useState('');
  const [customId, setCustomId] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [duration, setDuration] = useState(30);
  const [seedQuestions, setSeedQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().slice(0, 10);
      setTitle('');
      setCustomId('');
      setAutoSlug(true);
      setDescription('Official college live competition assessment.');
      setScheduledDate(today);
      setScheduledTime('11:00');
      setDuration(30);
      setSeedQuestions(false);
      setError(null);
    }
  }, [isOpen]);

  // Auto-generate slug from title if autoSlug is true
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setCustomId(slug);
    }
  };

  const handleCustomIdChange = (val: string) => {
    setAutoSlug(false);
    setCustomId(
      val
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
    );
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    const cleanId = (customId.trim() || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '');

    if (!cleanTitle) {
      setError('Please enter a title for the event.');
      return;
    }

    if (!cleanId) {
      setError('Please provide a valid Event ID/Code.');
      return;
    }

    if (existingQuizIds.includes(cleanId)) {
      setError(`An event with code "${cleanId}" already exists. Please choose a unique Event ID.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const newQuiz: Quiz = {
        id: cleanId,
        title: cleanTitle,
        description: description.trim() || 'Live academic competition.',
        scheduledDate: scheduledDate || new Date().toISOString().slice(0, 10),
        scheduledTime: scheduledTime || '11:00',
        questionDurationSeconds: duration > 5 ? duration : 30,
        totalQuestions: seedQuestions ? 4 : 0,
        status: 'WAITING',
        createdAt: now,
        updatedAt: now,
      };

      await onCreate(newQuiz, seedQuestions);
      onClose();
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <h3 className="font-bold text-base">Create New Quiz Event</h3>
              <p className="text-xs text-slate-400">Host multiple concurrent or scheduled competitions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. AI & Machine Learning Championship 2026"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Event ID / URL Slug *
              </label>
              <span className="text-[11px] text-slate-400">Used in direct student links</span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={customId}
                onChange={(e) => handleCustomIdChange(e.target.value)}
                placeholder="e.g. ai-ml-championship-2026"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Student join link will be: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">#register?quiz={customId || 'event-id'}</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for participants..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Scheduled Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Default Question Timer (Seconds)
            </label>
            <input
              type="number"
              min={10}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Questions Setup for this Event
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                onClick={() => setSeedQuestions(false)}
                className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                  !seedQuestions
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500 text-blue-950 font-medium'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="seedOption"
                  checked={!seedQuestions}
                  onChange={() => setSeedQuestions(false)}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <strong className="block font-bold">Blank Event (0 Questions)</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Recommended: Add your own separate, unique questions for this event.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setSeedQuestions(true)}
                className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                  seedQuestions
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500 text-blue-950 font-medium'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="seedOption"
                  checked={seedQuestions}
                  onChange={() => setSeedQuestions(true)}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <strong className="block font-bold">Sample Template (4 Questions)</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Pre-populate with 4 sample computer science starter questions.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? 'Creating Event...' : '🚀 Create Event & Generate Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
