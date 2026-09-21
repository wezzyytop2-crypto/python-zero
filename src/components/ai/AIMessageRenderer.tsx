import React from 'react';

interface AIMessageRendererProps {
  content: string;
}

export const AIMessageRenderer: React.FC<AIMessageRendererProps> = ({ content }) => {
  // Split content by code blocks ```python ... ``` or ``` ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Extract language and code
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          const lang = match?.[1] || 'python';
          const code = match?.[2] || part.slice(3, -3);

          return (
            <div 
              key={index}
              className="my-2 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-md font-mono text-xs"
            >
              <div className="px-3 py-1 bg-slate-800 text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center justify-between border-b border-slate-700">
                <span>{lang || 'python'}</span>
                <span className="text-slate-400">🐍 пример</span>
              </div>
              <pre className="p-3 overflow-x-auto text-emerald-300">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }

        // Regular text with inline markdown
        const paragraphs = part.split('\n\n').filter(Boolean);

        return (
          <React.Fragment key={index}>
            {paragraphs.map((para, pIdx) => {
              const lines = para.split('\n');

              return (
                <div key={pIdx} className="space-y-1">
                  {lines.map((line, lIdx) => {
                    // Check if bullet point
                    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                    const cleanLine = isBullet ? line.trim().slice(2) : line;

                    return (
                      <div 
                        key={lIdx} 
                        className={isBullet ? "flex items-start gap-2 pl-2" : ""}
                      >
                        {isBullet && (
                          <span className="text-[#58cc02] font-black shrink-0 mt-0.5">•</span>
                        )}
                        <div>
                          {renderFormattedText(cleanLine)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Formatter for inline **bold**, `code`, and *italic*
function renderFormattedText(text: string): React.ReactNode[] {
  // Regex to split by `code`, **bold**, *italic*
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code 
          key={i} 
          className="px-1.5 py-0.5 rounded-lg bg-[#58cc02]/15 dark:bg-[#58cc02]/25 text-[#46a302] dark:text-[#58cc02] font-mono text-[11px] font-black border border-[#58cc02]/30"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-black text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-600 dark:text-slate-400">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{token}</span>;
  });
}
