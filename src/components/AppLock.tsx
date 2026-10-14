import React, { useState, useEffect, useRef } from 'react';
import { Store, Lock, KeyRound, ShieldCheck, AlertCircle, Delete, ArrowRight } from 'lucide-react';

const REQUIRED_APP_PIN = '0801';
const STORAGE_KEY = 'shop_app_unlocked';

export const lockAppSession = () => {
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('app_lock_status_change'));
};

interface AppLockProps {
  children: React.ReactNode;
}

export const AppLock: React.FC<AppLockProps> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Listen for lock events
  useEffect(() => {
    const handleLockEvent = () => {
      setIsUnlocked(sessionStorage.getItem(STORAGE_KEY) === 'true');
    };
    window.addEventListener('app_lock_status_change', handleLockEvent);
    return () => window.removeEventListener('app_lock_status_change', handleLockEvent);
  }, []);

  // Auto-focus hidden input on load or when locked
  useEffect(() => {
    if (!isUnlocked) {
      setPin('');
      setError('');
      setIsSuccess(false);
      hiddenInputRef.current?.focus();
    }
  }, [isUnlocked]);

  const verifyPin = (currentPin: string) => {
    if (currentPin === REQUIRED_APP_PIN) {
      setIsSuccess(true);
      setError('');
      setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setIsUnlocked(true);
      }, 400);
    } else {
      setError('Incorrect PIN. Please try again.');
      // Auto clear after shake
      setTimeout(() => {
        setPin('');
      }, 600);
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4 && !isSuccess) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (!isSuccess && pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError('');
    }
  };

  const handleClear = () => {
    if (!isSuccess) {
      setPin('');
      setError('');
      hiddenInputRef.current?.focus();
    }
  };

  // Physical keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      handleKeyPress(e.key);
    } else if (e.key === 'Backspace') {
      handleDelete();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
      handleClear();
    } else if (e.key === 'Enter' && pin.length === 4) {
      verifyPin(pin);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none"
      onClick={() => hiddenInputRef.current?.focus()}
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden real input for mobile and desktop keyboards */}
      <input
        ref={hiddenInputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '');
          if (val.length <= 4) {
            setPin(val);
            setError('');
            if (val.length === 4) {
              verifyPin(val);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute -top-10 left-0 h-1 w-1 pointer-events-none"
        autoFocus
      />

      <div className="w-full max-w-sm sm:max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
        {/* App Logo & Lock Badge */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <Store className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-blue-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Shop Contact Manager
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400">
            Enter 4-Digit Security PIN to Access App
          </p>
        </div>

        {/* PIN Indicators (4 Dots/Pills) */}
        <div className="py-2">
          <div className={`flex items-center justify-center gap-4 transition-transform duration-200 ${error ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all duration-300 ${
                    isSuccess
                      ? 'bg-emerald-500 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/50'
                      : error
                      ? 'bg-red-500/30 border-red-500 scale-105'
                      : isFilled
                      ? 'bg-blue-500 border-blue-400 scale-110 shadow-md shadow-blue-500/50'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Feedback messages */}
          <div className="h-6 mt-3">
            {isSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 animate-fadeIn">
                <ShieldCheck className="w-4 h-4" />
                <span>PIN Verified! Opening Dashboard...</span>
              </span>
            )}
            {error && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 animate-fadeIn">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </span>
            )}
            {!isSuccess && !error && (
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <KeyRound className="w-3 h-3 text-slate-500" />
                <span>Default App Security PIN</span>
              </span>
            )}
          </div>
        </div>

        {/* Interactive Numeric Keypad */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-3 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleKeyPress(digit);
              }}
              className="h-13 sm:h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:bg-blue-600 text-white font-bold text-xl border border-slate-700/60 shadow-sm transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer select-none"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="h-13 sm:h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs uppercase tracking-wider border border-slate-800 transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            Clear
          </button>

          {/* 0 Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleKeyPress('0');
            }}
            className="h-13 sm:h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:bg-blue-600 text-white font-bold text-xl border border-slate-700/60 shadow-sm transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer select-none"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="h-13 sm:h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:bg-slate-700 text-slate-400 hover:text-white border border-slate-800 transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Manual Enter / Submit Button if 4 digits entered */}
        {pin.length === 4 && !isSuccess && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              verifyPin(pin);
            }}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer animate-fadeIn"
          >
            <span>Unlock Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Footer Info */}
      <p className="text-slate-500 text-xs mt-6 text-center">
        Shop Contact Manager • Secured System
      </p>
    </div>
  );
};
