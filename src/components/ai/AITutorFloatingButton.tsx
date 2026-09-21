import React from 'react';
import { Sparkles } from 'lucide-react';
import { soundManager } from '../../core/sound/soundEffects';

interface AITutorFloatingButtonProps {
  onClick: () => void;
  hasErrorNotification?: boolean;
}

export const AITutorFloatingButton: React.FC<AITutorFloatingButtonProps> = ({
  onClick,
  hasErrorNotification = false,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-40 animate-bounce-gentle">
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          onClick();
        }}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#58cc02] to-[#46a302] border-2 border-b-4 border-[#378202] text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Задать вопрос Питончику AI"
      >
        {/* Mascot Avatar */}
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-lg">
          🐍
        </div>

        {/* Text Label */}
        <div className="flex flex-col items-start leading-none pr-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 fill-current" />
            Gemini AI
          </span>
          <span className="text-xs font-black">
            Спросить Питончика
          </span>
        </div>

        {/* Pulsing notification badge if code has error */}
        {hasErrorNotification && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-black items-center justify-center text-white">!</span>
          </span>
        )}
      </button>
    </div>
  );
};
