import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  isLoading?: boolean;
  requiredPassword?: string; // defaults to '151571'
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loadingText = 'Deleting...',
  isLoading = false,
  requiredPassword = '151571',
  onConfirm,
  onCancel
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (requiredPassword) {
      if (!password.trim()) {
        setError('Please enter the deletion password');
        inputRef.current?.focus();
        return;
      }
      if (password.trim() !== requiredPassword) {
        setError('Incorrect password! Deletion denied.');
        inputRef.current?.focus();
        return;
      }
    }

    setError('');
    onConfirm(password.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header with Alert Icon */}
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-red-100/80 rounded-2xl flex-shrink-0 text-red-600 border border-red-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Security Password Box */}
        {requiredPassword && (
          <form onSubmit={handleSubmit} className="space-y-2 bg-red-50/60 rounded-xl p-4 border border-red-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-600" />
                <span>Deletion Security Password:</span>
              </label>
              <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                Required
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              This action cannot be undone. Enter password to confirm.
            </p>

            <div className="relative mt-1">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter password..."
                className={`w-full pl-3.5 pr-10 py-2.5 bg-white text-sm font-mono border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-400 focus:ring-red-500 text-red-900 bg-red-50/30'
                    : 'border-slate-300 focus:ring-red-500 focus:border-red-500 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold pt-1 animate-pulse">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading || (Boolean(requiredPassword) && !password)}
            onClick={() => handleSubmit()}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
