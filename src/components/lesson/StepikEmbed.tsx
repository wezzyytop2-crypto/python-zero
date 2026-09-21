import React, { useState } from 'react';
import { stepikClient } from '../../core/stepik/stepikClient';
import { 
  ExternalLink, 
  MonitorPlay, 
  Maximize2, 
  Sparkles, 
  Key, 
  CheckCircle 
} from 'lucide-react';

interface StepikEmbedProps {
  stepikUrl?: string;
  lessonTitle: string;
}

export const StepikEmbed: React.FC<StepikEmbedProps> = ({
  stepikUrl,
  lessonTitle,
}) => {
  const [showIframe, setShowIframe] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  const isApiConfigured = stepikClient.isConfigured();

  if (!stepikUrl) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          К данному уроку не привязана ссылка на Stepik
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl pb-8 animate-in fade-in duration-200">
      {/* Stepik Banner Card */}
      <div className="p-5 rounded-2xl border border-emerald-300/70 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-900/5 dark:from-emerald-950/30 dark:via-slate-900/40 dark:to-slate-900/20 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Stepik: Соответствующий урок курса
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  Интеграция
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showIframe ? (
              <button
                onClick={() => setShowIframe(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
              >
                <MonitorPlay className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Встроить плеер</span>
              </button>
            ) : (
              <button
                onClick={() => setShowIframe(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Скрыть плеер
              </button>
            )}

            <a
              href={stepikUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs hover:shadow"
            >
              <span>Открыть на Stepik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Embedded Iframe Player (if active) */}
      {showIframe && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md">
          <div className="h-9 px-4 bg-slate-900 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800">
            <span className="truncate">{lessonTitle} — Встроенный плеер Stepik</span>
            <div className="flex items-center gap-3">
              <a
                href={stepikUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 text-[11px]"
                title="Развернуть в новой вкладке"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Новая вкладка</span>
              </a>
              <button
                onClick={() => setShowIframe(false)}
                className="hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <iframe
            src={stepikUrl}
            title={lessonTitle}
            className="w-full h-[540px] border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setIframeFailed(true)}
          />

          {iframeFailed && (
            <div className="p-3 bg-amber-950/80 text-amber-200 text-xs flex items-center justify-between">
              <span>Stepik может ограничивать показ в iframe. Нажмите кнопку «Открыть на Stepik» для перехода.</span>
              <a
                href={stepikUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-amber-500 text-black font-bold rounded text-[10px]"
              >
                Открыть
              </a>
            </div>
          )}
        </div>
      )}

      {/* Stepik Synergy Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>На нашей платформе «Python с нуля»:</span>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc leading-relaxed">
            <li>Запуск кода в браузере за миллисекунды (Pyodide Web Worker).</li>
            <li>Человеческие объяснения ошибок на русском с номером строки.</li>
            <li>3-уровневые подсказки и защита от списывания.</li>
            <li>5 интерактивных типов заданий.</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>На платформе Stepik:</span>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc leading-relaxed">
            <li>Официальный сертификат об окончании курса.</li>
            <li>Форум решений и обсуждения с тысячами других студентов.</li>
            <li>Взаимная проверка работ (peer-review).</li>
          </ul>
        </div>
      </div>

      {/* Stepik API Developer Status Card */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
          <Key className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Статус Stepik API (OAuth2 Client Credentials):
            </span>
            <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
              isApiConfigured
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {isApiConfigured ? 'Подключен' : 'Отключен (по умолчанию)'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Заготовка модуля API создана в <code className="text-brand-600 dark:text-brand-400 font-mono">src/core/stepik/stepikClient.ts</code>. Для автоматического получения структуры курсов укажите ключи в файле <code className="text-brand-600 dark:text-brand-400 font-mono">.env</code> (см. <code className="text-brand-600 dark:text-brand-400 font-mono">.env.example</code>).
          </p>
        </div>
      </div>
    </div>
  );
};
