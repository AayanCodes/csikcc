import React, { useState, useEffect, useRef } from 'react';
import { Question, Quiz } from '../types';

interface AdminQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  quizId: string;
  quizzes?: Quiz[];
  nextQuestionNumber: number;
  onSave: (question: Question) => Promise<void>;
}

// Client-side image compression to optimize mobile photos and PC uploads for Firestore
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Clean JPEG compression, typically 40KB - 120KB
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

export const AdminQuestionModal: React.FC<AdminQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  quizId,
  quizzes,
  nextQuestionNumber,
  onSave,
}) => {
  const [targetQuizId, setTargetQuizId] = useState(quizId);
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (question) {
      setTargetQuizId(question.quizId || quizId);
      setQuestionText(question.questionText);
      setImageUrl(question.imageUrl || '');
      setOptA(question.options[0] || '');
      setOptB(question.options[1] || '');
      setOptC(question.options[2] || '');
      setOptD(question.options[3] || '');
      setCorrectIndex(question.correctOptionIndex);
      setDuration(question.durationSeconds || 30);
    } else {
      setTargetQuizId(quizId);
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
  }, [question, quizId, isOpen]);

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP, etc.).');
      return;
    }
    setIsUploadingImage(true);
    setError(null);
    try {
      const compressedDataUrl = await compressImage(file);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Could not process the selected image. Please try another image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  if (!isOpen) return null;

  const targetQuiz = quizzes?.find((q) => q.id === targetQuizId);

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
      const cleanImg = imageUrl.trim();
      const qObj: Question = {
        id: question ? question.id : `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        quizId: targetQuizId || quizId,
        questionNumber: question ? question.questionNumber : nextQuestionNumber,
        questionText: questionText.trim(),
        options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
        correctOptionIndex: correctIndex,
        durationSeconds: duration > 0 ? duration : 30,
        createdAt: question?.createdAt || new Date().toISOString(),
      };
      if (cleanImg) {
        qObj.imageUrl = cleanImg;
      }
      await onSave(qObj);
      onClose();
    } catch (err) {
      console.error('Failed to save question:', err);
      setError(err instanceof Error ? err.message : 'Failed to save question.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {question ? `Edit Question #${question.questionNumber}` : `Add Question #${nextQuestionNumber}`}
            </h3>
            {targetQuiz && (
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                Event: {targetQuiz.title} <span className="text-slate-400 font-mono text-[11px]">({targetQuiz.id})</span>
              </p>
            )}
          </div>
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
          {/* Target Event Selector */}
          {quizzes && quizzes.length > 0 && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Competition Event
              </label>
              <select
                value={targetQuizId}
                onChange={(e) => setTargetQuizId(e.target.value)}
                disabled={Boolean(question)}
                className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {quizzes.map((qz) => (
                  <option key={qz.id} value={qz.id}>
                    {qz.title} ({qz.totalQuestions || 0} Qs) [ID: {qz.id}]
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                This question will be saved and assigned exclusively to this competition event.
              </p>
            </div>
          )}
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

          {/* Question Image (Upload from Phone or PC) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Question Image (Optional)
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>🗑️</span>
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Hidden native file input - supports mobile camera/gallery and PC file system */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!imageUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                  isUploadingImage
                    ? 'border-blue-400 bg-blue-50/50 cursor-wait'
                    : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50 bg-slate-50/40'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl text-blue-600">
                  {isUploadingImage ? '⏳' : '📷'}
                </div>
                {isUploadingImage ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-blue-700">Optimizing & Uploading Image...</p>
                    <p className="text-xs text-slate-500">Compressing for seamless projector sync</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Upload Image from Phone or PC
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tap on mobile to take a photo or select from gallery • Drag & drop on PC
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-blue-600 shadow-2xs">
                      Choose Photo / File
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="relative rounded-xl border border-slate-200 bg-slate-100 p-2 overflow-hidden space-y-2">
                <div className="w-full h-44 rounded-lg bg-slate-900/5 flex items-center justify-center overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Question visual"
                    className="max-h-40 w-auto object-contain rounded"
                  />
                </div>
                <div className="flex items-center justify-between px-2 pb-1 text-xs">
                  <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Image ready for auditorium display</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
                  >
                    Change Image
                  </button>
                </div>
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
