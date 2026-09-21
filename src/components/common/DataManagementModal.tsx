import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Download, Upload, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => string;
  onImport: (json: string) => { success: boolean; message: string };
  onReset: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  onReset,
}) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const json = onExport();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `python-zero-progress-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', text: 'Файл прогресса успешно скачан!' });
    } catch (e: any) {
      setFeedback({ type: 'error', text: `Ошибка экспорта: ${e.message}` });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = onImport(content);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    };
    reader.onerror = () => {
      setFeedback({ type: 'error', text: 'Не удалось прочитать файл' });
    };
    reader.readAsText(file);
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetConfirm = () => {
    onReset();
    setShowConfirmReset(false);
    setFeedback({ type: 'success', text: 'Прогресс успешно сброшен к начальному состоянию' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Управление прогрессом" maxWidth="max-w-md">
      <div className="space-y-5">
        {feedback && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2.5 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Весь ваш прогресс (решённые уроки, код заданий, серия дней) хранится локально в вашем браузере. Вы можете экспортировать его в файл или перенести на другое устройство.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all shadow-sm hover:shadow active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            Скачать прогресс (JSON)
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-sm transition-all active:scale-[0.99]"
          >
            <Upload className="w-4 h-4" />
            Загрузить прогресс из файла
          </button>
        </div>

        {/* Danger Zone: Reset */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Сбросить весь прогресс
            </button>
          ) : (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-2">
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                Вы уверены? Это действие сотрет все решения и достижения без возможности отмены.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetConfirm}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                >
                  Да, сбросить всё
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
