import React, { useState } from 'react';
import type { QuizQuestion } from '../../types/course';
import { useLessonProgress } from '../../hooks/useLessonProgress';
import { soundManager } from '../../core/sound/soundEffects';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, RotateCcw, HelpCircle, Sparkles } from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
  lessonId: string;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  lessonId,
}) => {
  const { isQuizCompleted, markQuizDone } = useLessonProgress();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = useState<boolean>(() => isQuizCompleted(lessonId));

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        В этом уроке нет вопросов для самопроверки
      </div>
    );
  }

  const handleSelectOption = (questionId: string, optionIdx: number, isMulti: boolean) => {
    if (submitted) return;
    soundManager.playClick();
    setSelectedAnswers(prev => {
      const current = prev[questionId] || [];
      if (isMulti) {
        if (current.includes(optionIdx)) {
          return { ...prev, [questionId]: current.filter(i => i !== optionIdx) };
        } else {
          return { ...prev, [questionId]: [...current, optionIdx] };
        }
      } else {
        return { ...prev, [questionId]: [optionIdx] };
      }
    });
  };

  const calculateScore = () => {
    let correct = 0;
    for (const q of questions) {
      const userSelected = selectedAnswers[q.id] || [];
      const isMatch = 
        userSelected.length === q.correctIndices.length &&
        userSelected.every(idx => q.correctIndices.includes(idx));
      if (isMatch) correct++;
    }
    return correct;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    if (score === questions.length) {
      soundManager.playSuccess();
      markQuizDone(lessonId);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6'],
      });
    } else {
      soundManager.playError();
    }
  };

  const handleReset = () => {
    soundManager.playClick();
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const score = calculateScore();
  const allAnswered = questions.every(q => (selectedAnswers[q.id] || []).length > 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border-b-2 border-amber-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Проверь себя (квиз)
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Закрепите знания урока, выбрав правильные ответы
            </span>
          </div>
        </div>

        {submitted && (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-3 py-1.5 rounded-xl border-b-2 ${
              score === questions.length 
                ? 'bg-emerald-500 text-white border-emerald-700 shadow-xs'
                : 'bg-amber-500 text-white border-amber-700 shadow-xs'
            }`}>
              {score === questions.length ? '🏆 100% Успех!' : `${score} из ${questions.length}`}
            </span>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Пройти заново"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const isMulti = q.correctIndices.length > 1;
          const userSelected = selectedAnswers[q.id] || [];

          return (
            <div
              key={q.id}
              className="p-5 sm:p-6 rounded-3xl border-2 border-b-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center flex-shrink-0 border-b-2 border-emerald-500/20">
                  {qIndex + 1}
                </span>
                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 leading-snug">
                  {q.question}
                </p>
              </div>

              {q.codeSnippet && (
                <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-sky-200 overflow-x-auto border-2 border-slate-800 shadow-inner">
                  <pre>{q.codeSnippet}</pre>
                </div>
              )}

              {/* Duolingo Option Cards */}
              <div className="space-y-2.5 pt-1">
                {q.options.map((option, optIdx) => {
                  const isSelected = userSelected.includes(optIdx);
                  const isCorrect = q.correctIndices.includes(optIdx);

                  let cardStyle = 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50';
                  let letterBadgeStyle = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';

                  if (submitted) {
                    if (isCorrect) {
                      cardStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                      letterBadgeStyle = 'bg-emerald-500 text-white border-emerald-700';
                    } else if (isSelected && !isCorrect) {
                      cardStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-bold';
                      letterBadgeStyle = 'bg-rose-500 text-white border-rose-700';
                    } else {
                      cardStyle = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-100 font-black shadow-xs ring-2 ring-sky-400/30';
                    letterBadgeStyle = 'bg-sky-500 text-white border-sky-700';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIdx, isMulti)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer active:translate-y-0.5 active:border-b-2 select-none ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 border-b-2 ${letterBadgeStyle}`}>
                          {OPTION_LETTERS[optIdx] || optIdx + 1}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </div>

                      {submitted && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation card after submission */}
              {submitted && (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-black text-slate-900 dark:text-slate-100 block mb-1">
                    💡 Разбор ответа:
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Reset Footer with Duolingo Chunky Button */}
      <div className="pt-3 flex justify-end gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="btn-3d-green px-8 py-3 rounded-2xl text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Проверить ответы</span>
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="btn-3d-neutral flex items-center gap-2 px-6 py-3 rounded-2xl text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Пройти заново</span>
          </button>
        )}
      </div>
    </div>
  );
};
