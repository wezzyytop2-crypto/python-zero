import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { soundManager } from '../../core/sound/soundEffects';
import { 
  X, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'sign_in' | 'sign_up';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'sign_in',
}) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithPhone, 
    verifyOtp, 
    signInWithGoogle,
    resetPassword,
    isConfigured 
  } = useAuth();

  const [mode, setMode] = useState<'sign_in' | 'sign_up' | 'forgot' | 'verify_otp'>(initialMode);
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    soundManager.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error);
        soundManager.playError();
      } else {
        soundManager.playSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка входа через Google');
      soundManager.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'sign_in') {
        if (method === 'email') {
          if (!email.trim() || !password.trim()) {
            setErrorMessage('Пожалуйста, заполните email и пароль');
            soundManager.playError();
            setIsLoading(false);
            return;
          }
          const { error } = await signInWithEmail(email.trim(), password);
          if (error) {
            setErrorMessage(error);
            soundManager.playError();
          } else {
            soundManager.playSuccess();
            onClose();
          }
        } else {
          // Phone sign in
          if (!phone.trim()) {
            setErrorMessage('Введите номер телефона');
            soundManager.playError();
            setIsLoading(false);
            return;
          }
          const { error } = await signInWithPhone(phone.trim());
          if (error) {
            setErrorMessage(error);
            soundManager.playError();
          } else {
            soundManager.playSuccess();
            setMode('verify_otp');
            setSuccessMessage(`Код подтверждения отправлен на номер ${phone}`);
          }
        }
      } else if (mode === 'sign_up') {
        if (method === 'email') {
          if (!email.trim() || !password.trim()) {
            setErrorMessage('Пожалуйста, заполните все поля');
            soundManager.playError();
            setIsLoading(false);
            return;
          }
          if (password.length < 6) {
            setErrorMessage('Пароль должен содержать не менее 6 символов');
            soundManager.playError();
            setIsLoading(false);
            return;
          }
          const { error, needsConfirmation } = await signUpWithEmail(email.trim(), password, fullName.trim());
          if (error) {
            setErrorMessage(error);
            soundManager.playError();
          } else {
            soundManager.playSuccess();
            if (needsConfirmation) {
              setSuccessMessage(`На адрес ${email} отправлено письмо для подтверждения с вашего домена. Проверьте почту!`);
            } else {
              onClose();
            }
          }
        } else {
          // Phone sign up
          if (!phone.trim()) {
            setErrorMessage('Введите номер телефона');
            soundManager.playError();
            setIsLoading(false);
            return;
          }
          const { error } = await signInWithPhone(phone.trim());
          if (error) {
            setErrorMessage(error);
            soundManager.playError();
          } else {
            soundManager.playSuccess();
            setMode('verify_otp');
            setSuccessMessage(`Код подтверждения отправлен на номер ${phone}`);
          }
        }
      } else if (mode === 'verify_otp') {
        if (!otpCode.trim()) {
          setErrorMessage('Введите 6-значный код из SMS');
          soundManager.playError();
          setIsLoading(false);
          return;
        }
        const { error } = await verifyOtp(phone.trim(), otpCode.trim());
        if (error) {
          setErrorMessage(error);
          soundManager.playError();
        } else {
          soundManager.playSuccess();
          onClose();
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMessage('Введите email для сброса пароля');
          soundManager.playError();
          setIsLoading(false);
          return;
        }
        const { error } = await resetPassword(email.trim());
        if (error) {
          setErrorMessage(error);
          soundManager.playError();
        } else {
          soundManager.playSuccess();
          setSuccessMessage(`Инструкция по восстановлению пароля отправлена на ${email}`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Произошла непредвиденная ошибка');
      soundManager.playError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-pop-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#1f2e35] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] shadow-2xl overflow-hidden">
        {/* Header with Mascot and Close Button */}
        <div className="p-5 pb-3 border-b-2 border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#58cc02] to-[#46a302] flex items-center justify-center text-2xl shadow-sm border-b-2 border-[#378202]">
              🐍
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {mode === 'sign_in' ? 'Добро пожаловать!' : mode === 'sign_up' ? 'Создать аккаунт' : mode === 'verify_otp' ? 'Подтверждение номера' : 'Сброс пароля'}
              </h3>
              <p className="text-[11px] font-bold text-slate-400">
                Сохраняй прогресс и очки XP в облаке
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Toggle Tabs (Вход / Регистрация) */}
        {mode !== 'verify_otp' && mode !== 'forgot' && (
          <div className="px-5 pt-3 flex gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setMode('sign_in');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-2 border-b-4 ${
                mode === 'sign_in'
                  ? 'border-[#58cc02] bg-[#58cc02]/15 text-[#46a302] dark:text-[#58cc02]'
                  : 'border-[#e5e5e5] dark:border-[#37464f] text-slate-500 hover:bg-slate-50 dark:hover:bg-[#131f24]'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setMode('sign_up');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-2 border-b-4 ${
                mode === 'sign_up'
                  ? 'border-[#58cc02] bg-[#58cc02]/15 text-[#46a302] dark:text-[#58cc02]'
                  : 'border-[#e5e5e5] dark:border-[#37464f] text-slate-500 hover:bg-slate-50 dark:hover:bg-[#131f24]'
              }`}
            >
              Регистрация
            </button>
          </div>
        )}

        {/* Google 1-click OAuth Button */}
        {mode !== 'verify_otp' && mode !== 'forgot' && (
          <div className="px-5 pt-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="btn-3d btn-3d-neutral w-full py-3 px-4 rounded-2xl border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-sm active:translate-y-1 transition-all"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Продолжить с Google</span>
            </button>

            <div className="flex items-center gap-3 mt-3.5 mb-1">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">или через логин</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        )}

        {/* Method Switch: Email vs Phone */}
        {mode !== 'verify_otp' && mode !== 'forgot' && (
          <div className="px-5 pt-3 flex items-center justify-center gap-4 text-xs font-black">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setMethod('email');
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                method === 'email'
                  ? 'border-[#58cc02] text-[#46a302] dark:text-[#58cc02]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Почта / Корп. Email</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setMethod('phone');
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                method === 'phone'
                  ? 'border-[#58cc02] text-[#46a302] dark:text-[#58cc02]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Номер телефона</span>
            </button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border-2 border-rose-400/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-[#58cc02]/15 border-2 border-[#58cc02]/40 text-[#46a302] dark:text-[#58cc02] text-xs font-bold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Full Name input (sign up only) */}
          {mode === 'sign_up' && (
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                Ваше имя
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Александр"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-[#e5e5e5] dark:border-[#37464f] focus:border-[#58cc02] dark:focus:border-[#58cc02] focus:outline-none text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Email or Phone field */}
          {mode !== 'verify_otp' && (
            method === 'email' ? (
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Электронная почта</span>
                  <span className="text-[10px] text-[#58cc02] font-bold">Корпоративная / личная</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@yourdomain.ru"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-[#e5e5e5] dark:border-[#37464f] focus:border-[#58cc02] dark:focus:border-[#58cc02] focus:outline-none text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                  Номер телефона
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-[#e5e5e5] dark:border-[#37464f] focus:border-[#58cc02] dark:focus:border-[#58cc02] focus:outline-none text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>
            )
          )}

          {/* Password (for email mode) */}
          {mode !== 'verify_otp' && method === 'email' && mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                  Пароль
                </label>
                {mode === 'sign_in' && (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setMode('forgot');
                    }}
                    className="text-[11px] font-bold text-[#1cb0f6] hover:underline"
                  >
                    Забыли пароль?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-[#e5e5e5] dark:border-[#37464f] focus:border-[#58cc02] dark:focus:border-[#58cc02] focus:outline-none text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>
          )}

          {/* OTP Code input (phone mode) */}
          {mode === 'verify_otp' && (
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                Код из SMS
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-center text-base tracking-widest font-mono font-black rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-[#e5e5e5] dark:border-[#37464f] focus:border-[#58cc02] dark:focus:border-[#58cc02] focus:outline-none text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit 3D Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-3d btn-3d-green w-full py-3.5 rounded-2xl text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md mt-2"
          >
            {isLoading ? (
              <span>Подождите...</span>
            ) : mode === 'sign_in' ? (
              <>
                <span>Войти в профиль</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'sign_up' ? (
              <>
                <span>Зарегистрироваться (+100 XP)</span>
                <Sparkles className="w-4 h-4 fill-white" />
              </>
            ) : mode === 'verify_otp' ? (
              <>
                <span>Подтвердить код</span>
                <ShieldCheck className="w-4 h-4" />
              </>
            ) : (
              <span>Отправить ссылку для сброса</span>
            )}
          </button>

          {/* Back button for Forgot / OTP */}
          {(mode === 'forgot' || mode === 'verify_otp') && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setMode('sign_in');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="w-full py-2 text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-center"
            >
              ← Вернуться ко входу
            </button>
          )}

          {/* Info Badge */}
          {!isConfigured && (
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-sky-700 dark:text-sky-300 text-[11px] leading-relaxed">
              <strong>💡 Демо-режим:</strong> Supabase API-ключи ещё не внесены в <code>.env</code>. Вы можете сразу войти под любым тестовым email или телефоном для проверки интерфейса!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
