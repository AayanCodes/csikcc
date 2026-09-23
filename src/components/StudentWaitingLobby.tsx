import React, { useEffect, useState } from 'react';
import { Quiz, Participant } from '../types';

interface StudentWaitingLobbyProps {
  quiz: Quiz | null;
  participant: Participant | null;
}

export const StudentWaitingLobby: React.FC<StudentWaitingLobbyProps> = ({
  quiz,
  participant,
}) => {
  const [scheduledCountdown, setScheduledCountdown] = useState<string>('');

  useEffect(() => {
    if (!quiz?.scheduledDate || !quiz?.scheduledTime) {
      setScheduledCountdown('');
      return;
    }

    const interval = setInterval(() => {
      try {
        const scheduledTarget = new Date(`${quiz.scheduledDate}T${quiz.scheduledTime}:00`);
        const now = new Date();
        const diffMs = scheduledTarget.getTime() - now.getTime();

        if (diffMs <= 0) {
          setScheduledCountdown('Ready to start');
        } else {
          const totalSeconds = Math.floor(diffMs / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          if (hours > 0) {
            setScheduledCountdown(
              `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
            );
          } else {
            setScheduledCountdown(
              `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
          }
        }
      } catch {
        setScheduledCountdown('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz?.scheduledDate, quiz?.scheduledTime]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-sm p-8 text-center space-y-8">
        {/* Quiz Event Name */}
        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
            Official Examination
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {quiz?.title || 'College Live Quiz'}
          </h1>
        </div>

        {/* Student Details Only */}
        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-left space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Student Name:</span>
            <span className="font-semibold text-slate-900">{participant?.name || '—'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Roll Number:</span>
            <span className="font-mono font-semibold text-slate-900">{participant?.rollNumber || '—'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Department:</span>
            <span className="font-medium text-slate-900">{participant?.department || '—'}</span>
          </div>
        </div>

        {/* Countdown & Waiting Status */}
        <div className="space-y-3 py-4">
          <div className="inline-flex items-center justify-center space-x-2 text-blue-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <span className="text-xs font-bold tracking-widest uppercase">
              Live Connection Active
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            WAITING FOR QUIZ TO START
          </h2>

          {scheduledCountdown ? (
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">
                Scheduled Start Countdown
              </span>
              <span className="font-mono text-3xl font-bold text-slate-900 tracking-wider">
                {scheduledCountdown}
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              The quiz will automatically begin when the administrator starts the session. Please stay on this screen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
