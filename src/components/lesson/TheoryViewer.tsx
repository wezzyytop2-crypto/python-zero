import React from 'react';
import type { LessonData, TheoryExample } from '../../types/course';
import { CommonMistakes } from './CommonMistakes';
import { Play, Sparkles, Lightbulb } from 'lucide-react';

interface TheoryViewerProps {
  lesson: LessonData;
  onRunExample?: (code: string) => void;
  onGoToTasks?: () => void;
}

export const TheoryViewer: React.FC<TheoryViewerProps> = ({
  lesson,
  onRunExample,
  onGoToTasks,
}) => {
  // Markdown renderer with Duolingo & Stepik styling
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block toggle
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
          codeBlockContent = [];
        } else {
          inCodeBlock = false;
          const codeText = codeBlockContent.join('\n');
          elements.push(
            <div key={`code-${i}`} className="my-4 rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#0f172a] text-slate-100 shadow-sm">
              <div className="px-4 py-2 bg-slate-900 text-slate-400 text-xs font-mono flex items-center justify-between border-b border-slate-800">
                <span className="font-bold uppercase tracking-wider text-emerald-400">{codeLanguage || 'python'}</span>
                {onRunExample && (
                  <button
                    onClick={() => onRunExample(codeText)}
                    className="btn-3d btn-3d-green flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] text-white"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    Запустить в консоли
                  </button>
                )}
              </div>
              <pre className="p-4 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed text-emerald-300">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={`empty-${i}`} className="h-3" />);
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-4 mb-3 tracking-tight">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-6 mb-3 tracking-tight flex items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-[#58cc02]"></span>
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        // Blockquote / Tip (Duolingo Lightbulb card)
        const tipText = line.replace('> ', '');
        elements.push(
          <div key={`quote-${i}`} className="my-4 p-4 rounded-2xl bg-amber-500/10 border-2 border-b-4 border-amber-400 text-slate-800 dark:text-amber-100 text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Lightbulb className="w-5 h-5 fill-white" />
            </div>
            <div className="pt-0.5" dangerouslySetInnerHTML={{ __html: parseInlineFormatting(tipText) }} />
          </div>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={`li-${i}`} className="ml-5 list-disc text-xs sm:text-sm text-slate-700 dark:text-slate-200 my-1.5 leading-relaxed font-medium">
            <span dangerouslySetInnerHTML={{ __html: parseInlineFormatting(line.replace(/^[-*]\s+/, '')) }} />
          </li>
        );
      } else {
        elements.push(
          <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            <span dangerouslySetInnerHTML={{ __html: parseInlineFormatting(line) }} />
          </p>
        );
      }
    }

    return elements;
  };

  // Helper for inline markdown: **bold**, *italic*, `code`
  const parseInlineFormatting = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-lg bg-emerald-500/10 text-[#46a302] dark:text-[#58cc02] font-mono text-[11px] sm:text-xs font-bold border border-emerald-500/20">$1</code>');
  };

  return (
    <div className="space-y-6 max-w-3xl pb-12">
      {/* Duolingo-style Python Mascot Greeting Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1f2e35] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#58cc02] to-[#46a302] p-1 flex items-center justify-center shrink-0 shadow-sm border-b-2 border-[#378202]">
          <span className="text-3xl sm:text-4xl filter drop-shadow">🐍</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
              Питончик говорит:
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#58cc02]/20 text-[#46a302] dark:text-[#58cc02]">
              Наставник
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Изучи теорию по шагам, протестируй интерактивные примеры и переходи к задачам, чтобы заработать <strong className="text-[#ff9600] font-black">+15 XP</strong>!
          </p>
        </div>
      </div>

      {/* Theory Markdown Content in a clean Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#1f2e35] border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] shadow-xs">
        {renderMarkdown(lesson.theoryMarkdown)}
      </div>

      {/* Interactive Theory Examples */}
      {lesson.theoryExamples && lesson.theoryExamples.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
              Интерактивные примеры кода
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {lesson.theoryExamples.map((ex: TheoryExample) => (
              <div
                key={ex.id}
                className="p-4 rounded-2xl border-2 border-b-4 border-[#e5e5e5] dark:border-[#37464f] bg-white dark:bg-[#1f2e35] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                    {ex.title}
                  </span>
                  {onRunExample && (
                    <button
                      onClick={() => onRunExample(ex.code)}
                      className="btn-3d btn-3d-green flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      Запустить в консоли
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {ex.description}
                </p>

                <div className="rounded-xl bg-[#0f172a] p-3 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800">
                  <pre>{ex.code}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Mistakes */}
      {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
        <div className="pt-2">
          <CommonMistakes mistakes={lesson.commonMistakes} />
        </div>
      )}

      {/* Action Footer Card: Jump to Tasks */}
      {onGoToTasks && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#58cc02]/15 via-[#1cb0f6]/10 to-transparent border-2 border-b-4 border-[#58cc02]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              Теория освоена? Время практики!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Решай практические задачи с автопроверкой и получай очки опыта.
            </p>
          </div>

          <button
            onClick={onGoToTasks}
            className="btn-3d btn-3d-green px-8 py-3.5 rounded-2xl text-white text-sm font-black tracking-wider uppercase shrink-0 shadow-md"
          >
            Перейти к задачам (+15 XP) →
          </button>
        </div>
      )}
    </div>
  );
};
