import { X, QrCode, Copy, Check, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Login QR Code</h3>
              <p className="text-xs text-slate-500">Scan to open registration & login instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-6">
          {/* Simulated QR Code box with high contrast SVG pattern */}
          <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-inner flex flex-col items-center justify-center">
            <div className="w-48 h-48 bg-slate-900 rounded-xl p-3 flex items-center justify-center relative overflow-hidden group">
              {/* Decorative QR matrix representation */}
              <div className="absolute inset-2 grid grid-cols-7 gap-1.5 opacity-90">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 || i % 5 === 0 || i === 0 || i === 6 || i === 42 || i === 48)
                        ? 'bg-white'
                        : 'bg-slate-900'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 pointer-events-none" />
              <div className="z-10 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> Scan with Phone
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-3 font-mono break-all max-w-[260px]">
              {currentUrl}
            </p>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Link Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Student Access Link
                </>
              )}
            </button>
            <p className="text-xs text-slate-500">
              Project this QR code on the auditorium screen or share it via projector so all students can log in simultaneously.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
