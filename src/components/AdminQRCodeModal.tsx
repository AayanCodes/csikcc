import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface AdminQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl: string;
}

export const AdminQRCodeModal: React.FC<AdminQRCodeModalProps> = ({
  isOpen,
  onClose,
  defaultUrl,
}) => {
  const [url, setUrl] = useState(defaultUrl);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (defaultUrl) {
      setUrl(defaultUrl);
    }
  }, [defaultUrl]);

  useEffect(() => {
    if (!isOpen || !url.trim()) return;

    QRCode.toDataURL(
      url.trim(),
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (err, dataUrl) => {
        if (err) {
          console.error('QR code generation failed:', err);
        } else {
          setQrDataUrl(dataUrl);
        }
      }
    );
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'college-quiz-registration-qr.png';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Event QR Code & Registration Link
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* URL Input & Quick Presets */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Target URL (Editable)
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUrl(`${window.location.origin}/#register`)}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
            >
              Student Portal Link
            </button>
            <button
              type="button"
              onClick={() => setUrl(`${window.location.origin}/#auditorium`)}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
            >
              Auditorium Screen Link
            </button>
          </div>
        </div>

        {/* QR Code Canvas / Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Generated Event QR Code"
              className="w-56 h-56 object-contain border border-slate-200 rounded bg-white p-2"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
              Generating QR Code...
            </div>
          )}
          <p className="text-xs text-slate-500 mt-2 text-center">
            Scan with smartphone camera to open the student registration page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 px-3 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-xs rounded transition-colors cursor-pointer text-center"
          >
            {copied ? '✓ Copied URL!' : 'Copy Link'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded transition-colors disabled:opacity-50 cursor-pointer text-center"
          >
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};
