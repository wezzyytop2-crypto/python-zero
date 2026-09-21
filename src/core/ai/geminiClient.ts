/**
 * Client for Google Gemini API and Offline Smart AI Tutor
 * Supports Gemini 1.5/2.5 Flash via REST API without heavy external dependencies.
 */

export interface AIMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: number;
}

const STORAGE_KEY = 'python_zero_gemini_key';

export const getStoredGeminiKey = (): string => {
  return localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const setStoredGeminiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const hasGeminiKey = (): boolean => {
  return Boolean(getStoredGeminiKey());
};

const SYSTEM_INSTRUCTION = `
Ты — «Питончик» 🐍, дружелюбный, забавный и ободряющий маскот интерактивного курса «Python с нуля» (в стиле Duolingo).
Твоя миссия — объяснять основы языка Python для новичков простым, понятным и увлекательным языком.

Правила общения:
1. НЕ давай сразу готовый код решения целиком, если тебя прямо об этом не попросили. Направляй ученика наводящими вопросами или псевдокодом.
2. Если у ученика ошибка (SyntaxError, IndentationError, NameError, TypeError, IndexError и т.д.):
   - Объясни человеческим языком, что эта ошибка значит на простом жизненном примере.
   - Укажи, на какую строку или символ обратить внимание (например: забыл двоеточие ':', перепутал отступы, не закрыл кавычку).
3. Используй стиль Duolingo: будь позитивным, поддерживающим, используй уместные эмодзи (🐍, 💡, ✨, 🚀, 🎯), форматируй ключевые слова и кусочки кода в обратные кавычки (например: \`print()\`, \`int\`, \`if/else\`).
4. Отвечай на чистом русском языке. Держи ответы структурированными и не слишком длинными.
`;

/**
 * Fallback smart heuristic offline analysis when API key is not yet set
 */
const generateSmartOfflineResponse = (
  prompt: string,
  context?: { code?: string; error?: string; taskTitle?: string }
): string => {
  const code = context?.code || '';
  const error = context?.error || '';

  if (error) {
    if (error.includes('SyntaxError')) {
      if (error.includes("':' expected") || error.includes("expected ':'")) {
        return `🐍 **Ой, кажется, синтаксическая ошибка!**\n\nВ Python после операторов \`if\`, \`for\`, \`while\` или объявления функции \`def\` **всегда нужно ставить двоеточие \`:\`** в конце строки!\n\n💡 *Проверь конец строки с условием или циклом.*`;
      }
      if (error.includes('unterminated string')) {
        return `🐍 **Кавычка потерялась!**\n\nТы открыл строчку кавычкой \`"\` или \`'\`, но где-то забыл её закрыть. Проверь текст в скобках \`print(...)\`!`;
      }
      return `🐍 **Синтаксическая ошибка (SyntaxError)!**\n\nPython не смог прочитать одну из строк. Частые причины:\n- Забытая скобка \`)\` в конце \`print()\`\n- Забытое двоеточие \`:\` в конце строки \`if\` или \`for\`\n- Опечатка в ключевом слове!`;
    }

    if (error.includes('IndentationError')) {
      return `🐍 **Опаньки! Ошибка отступов (IndentationError)!**\n\nВ Python отступы (4 пробела или Tab) показывают, какой код находится внутри условия, цикла или функции.\n\n💡 *Убедись, что строка под \`if\` или \`for\` сдвинута вправо на 4 пробела!*`;
    }

    if (error.includes('NameError')) {
      return `🐍 **Неизвестное имя (NameError)!**\n\nPython говорит, что переменная или функция ему не знакома. Проверь:\n1. Нет ли опечатки в названии переменной?\n2. Если это текст, обернул ли ты его в кавычки \`"текст"\`? Без кавычек Python думает, что это имя переменной!`;
    }

    if (error.includes('TypeError')) {
      return `🐍 **Несовместимые типы данных (TypeError)!**\n\nКажется, ты пытаешься сложить число и строку (например, \`5 + "10"\`) или вызвать функцию с неподходящим типом.\n\n💡 *Используй \`str()\` для перевода в текст или \`int()\` для перевода в целое число!*`;
    }
  }

  // Code inspection heuristics
  if (code.includes('print') && !code.includes('print(')) {
    return `🐍 **Подсказка от Питончика:**\n\nВ Python 3 функция \`print\` всегда пишется со круглыми скобками:\n\`\`\`python\nprint("Привет, мир!")\n\`\`\``;
  }

  if (prompt.toLowerCase().includes('ошибк') || prompt.toLowerCase().includes('не работает')) {
    return `🐍 **Питончик на связи!**\n\nЧтобы я помог найти неточность:\n1. Проверь скобки и кавычки — все ли закрыты?\n2. Проверь отступы после двоеточий.\n3. Если у тебя есть свой бесплатный **Gemini API Key**, укажи его по иконке ⚙️ в углу окна, и я смогу делать глубокий ИИ-анализ твоего решения в реальном времени! 🚀`;
  }

  return `🐍 **Привет! Я Питончик — твой ИИ-наставник!** 🚀\n\nЯ могу:\n- 🔍 Найти ошибку в твоём коде\n- 💡 Дать подсказку к текущему уроку\n- 📝 Объяснить сложные темы на простых примерах\n\n*Задай мне любой вопрос по коду или выбери быструю подсказку ниже!*`;
};

/**
 * Call Gemini API or fallback
 */
export async function sendGeminiPrompt(
  prompt: string,
  context?: { code?: string; error?: string; taskTitle?: string; taskDescription?: string }
): Promise<string> {
  const apiKey = getStoredGeminiKey();

  if (!apiKey) {
    // Return friendly offline/mock tutor analysis
    return generateSmartOfflineResponse(prompt, context);
  }

  const userContent = [
    context?.taskTitle ? `Текущее задание: "${context.taskTitle}"` : '',
    context?.taskDescription ? `Описание задачи: ${context.taskDescription}` : '',
    context?.code ? `Код ученика:\n\`\`\`python\n${context.code}\n\`\`\`` : '',
    context?.error ? `Ошибка / вывод консоли:\n${context.error}` : '',
    `Вопрос ученика: ${prompt}`,
  ].filter(Boolean).join('\n\n');

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userContent }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn(`Gemini model ${model} error:`, errData);
        // Try next model if available
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (e) {
      console.warn(`Network error with model ${model}:`, e);
    }
  }

  // Fallback to smart offline if network or quota issue occurred
  return generateSmartOfflineResponse(prompt, context);
}
