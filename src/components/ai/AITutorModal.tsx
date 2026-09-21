import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Settings, 
  Key, 
  ExternalLink, 
  HelpCircle, 
  Bug, 
  Lightbulb, 
  Check, 
  RefreshCw,
  Zap
} from 'lucide-react';
import type { AIMessage } from '../../core/ai/geminiClient';
import { 
  sendGeminiPrompt, 
  getStoredGeminiKey, 
  setStoredGeminiKey, 
  hasGeminiKey 
} from '../../core/ai/geminiClient';
import { AIMessageRenderer } from './AIMessageRenderer';
import { soundManager } from '../../core/sound/soundEffects';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    code?: string;
    error?: string;
    taskTitle?: string;
    taskDescription?: string;
  };
  initialPrompt?: string;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  context,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: '🐍 **Привет! Я Питончик — твой личный ИИ-наставник!** 🚀\n\nЯ помогу найти ошибку, дам подсказку или объясню любую непонятную тему. Спрашивай о чём угодно!',
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getStoredGeminiKey());
  const [keySavedMessage, setKeySavedMessage] = useState(false);
  const [isKeyConfigured, setIsKeyConfigured] = useState(hasGeminiKey());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // If initialPrompt provided when opening modal, trigger it
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    soundManager.playClick();
    setStoredGeminiKey(apiKeyInput);
    setIsKeyConfigured(hasGeminiKey());
    setKeySavedMessage(true);
    setTimeout(() => {
      setKeySavedMessage(false);
      setShowSettings(false);
    }, 1500);
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    soundManager.playClick();
    setInput('');

    const userMsg: AIMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const reply = await sendGeminiPrompt(promptText, context);
      soundManager.playSuccess();
      const tutorMsg: AIMessage = {
        id: 'tutor-' + Date.now(),
        sender: 'tutor',
        text: reply,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, tutorMsg]);
    } catch (e: any) {
      soundManager.playError();
      const errorMsg: AIMessage = {
        id: 'tutor-err-' + Date.now(),
        sender: 'tutor',
        text: '🐍 *Упс, что-то пошло не так при обращении к ИИ. Попробуй ещё раз или проверь интернет-соединение.*',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-pop-in">
      <div className="relative w-full max-w-2xl h-[90vh] max-h-[720px] rounded-3xl bg-white dark:bg-[#1f2e35] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#18252b]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#58cc02] to-[#46a302] flex items-center justify-center text-2xl shadow-sm border-b-2 border-[#378202]">
              🐍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  Питончик AI
                </h3>
                {isKeyConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#58cc02]/15 text-[#46a302] dark:text-[#58cc02] border border-[#58cc02]/30">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    Gemini Flash
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Zap className="w-2.5 h-2.5" />
                    Смарт-демо
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                ИИ-наставник по Python на базе Google Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Key Settings Toggle */}
            <button
              onClick={() => {
                soundManager.playClick();
                setShowSettings(prev => !prev);
              }}
              className={`p-2 rounded-xl border-2 transition-all ${
                showSettings 
                  ? 'border-[#58cc02] bg-[#58cc02]/10 text-[#46a302] dark:text-[#58cc02]' 
                  : 'border-[#e5e5e5] dark:border-[#37464f] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Настройки Gemini API Key"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Close Button */}
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
        </div>

        {/* Gemini API Key Configuration Drawer */}
        {showSettings && (
          <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border-b-2 border-amber-500/20 animate-slide-in-up">
            <div className="flex items-start gap-2.5 mb-3">
              <Key className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Google Gemini API Key</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#1cb0f6] hover:underline font-bold"
                  >
                    <span>Получить бесплатно</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  Ключ сохраняется только в вашем браузере (localStorage). Без ключа Питончик работает в умном офлайн-режиме эвристик.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#58cc02]"
              />
              <button
                onClick={handleSaveKey}
                className="btn-3d btn-3d-green px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5"
              >
                {keySavedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Сохранено!</span>
                  </>
                ) : (
                  <span>Сохранить</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-[#131f24]/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {isUser ? (
                    <div className="w-8 h-8 rounded-xl bg-[#1cb0f6] flex items-center justify-center text-white text-xs font-black shadow-xs">
                      Вы
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#58cc02] to-[#46a302] flex items-center justify-center text-base shadow-xs border-b-2 border-[#378202]">
                      🐍
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl shadow-xs border-2 ${
                    isUser
                      ? 'bg-[#1cb0f6] border-[#1899d6] text-white rounded-tr-xs font-semibold text-xs sm:text-sm'
                      : 'bg-white dark:bg-[#1f2e35] border-[#e5e5e5] dark:border-[#37464f] rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <AIMessageRenderer content={msg.text} />
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#58cc02] to-[#46a302] flex items-center justify-center text-base shadow-xs">
                🐍
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-[#e5e5e5] dark:border-[#37464f] rounded-tl-xs flex items-center gap-2 text-xs font-bold text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#58cc02]" />
                <span>Питончик думает и анализирует код...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#18252b] border-t-2 border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {context?.error && (
            <button
              onClick={() => handleSend('Объясни, пожалуйста, мою ошибку и где я ошибся')}
              disabled={isLoading}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-black hover:bg-rose-500/20 transition-all"
            >
              <Bug className="w-3 h-3" />
              <span>Разобрать ошибку</span>
            </button>
          )}

          <button
            onClick={() => handleSend('Дай небольшую подсказку к текущему заданию без спойлера решения')}
            disabled={isLoading}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black hover:bg-amber-500/20 transition-all"
          >
            <Lightbulb className="w-3 h-3" />
            <span>Подсказка без спойлера</span>
          </button>

          <button
            onClick={() => handleSend('Как можно сделать этот код красивее по правилам PEP 8?')}
            disabled={isLoading}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#58cc02]/10 text-[#46a302] dark:text-[#58cc02] border border-[#58cc02]/30 text-xs font-black hover:bg-[#58cc02]/20 transition-all"
          >
            <Sparkles className="w-3 h-3" />
            <span>Улучшить код (PEP 8)</span>
          </button>

          <button
            onClick={() => handleSend('Объясни мне эту тему на жизненном и простом примере')}
            disabled={isLoading}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-black hover:bg-sky-500/20 transition-all"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Пример из жизни</span>
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3.5 border-t-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1f2e35] flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Спроси Питончика об ошибке или коде..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-[#e5e5e5] dark:border-[#37464f] focus:border-[#58cc02] dark:focus:border-[#58cc02] focus:outline-none text-slate-900 dark:text-white transition-all"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-3d btn-3d-green p-2.5 sm:px-4 sm:py-2.5 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Отправить</span>
          </button>
        </form>
      </div>
    </div>
  );
};
