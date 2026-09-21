export interface OutputDiff {
  hasDifference: boolean;
  explanation: string;
  expectedNormalized: string;
  actualNormalized: string;
  differenceType: 'exact_match' | 'trailing_whitespace' | 'case_mismatch' | 'punctuation_mismatch' | 'content_mismatch';
}

export function computeOutputDiff(expected: string, actual: string): OutputDiff {
  const expTrimmed = expected.trim();
  const actTrimmed = actual.trim();

  // Exact match
  if (expected === actual) {
    return {
      hasDifference: false,
      explanation: 'Вывод полностью совпадает с ожидаемым.',
      expectedNormalized: expected,
      actualNormalized: actual,
      differenceType: 'exact_match',
    };
  }

  // Exact match ignoring trailing spaces/newlines
  if (expTrimmed === actTrimmed) {
    return {
      hasDifference: true,
      explanation: 'Текст правильный, но есть лишние или недостающие пробелы/переносы строк в начале или конце.',
      expectedNormalized: expected,
      actualNormalized: actual,
      differenceType: 'trailing_whitespace',
    };
  }

  // Case mismatch (e.g. "Привет" vs "привет")
  if (expTrimmed.toLowerCase() === actTrimmed.toLowerCase()) {
    return {
      hasDifference: true,
      explanation: 'Разница в регистре букв (заглавные и строчные буквы). Проверьте заглавные буквы.',
      expectedNormalized: expTrimmed,
      actualNormalized: actTrimmed,
      differenceType: 'case_mismatch',
    };
  }

  // Punctuation difference (e.g. missing exclamation mark or period)
  const expNoPunct = expTrimmed.replace(/[.,!?:;]/g, '');
  const actNoPunct = actTrimmed.replace(/[.,!?:;]/g, '');
  if (expNoPunct === actNoPunct) {
    return {
      hasDifference: true,
      explanation: 'Разница в знаках препинания (проверьте точки, запятые или восклицательные знаки).',
      expectedNormalized: expTrimmed,
      actualNormalized: actTrimmed,
      differenceType: 'punctuation_mismatch',
    };
  }

  return {
    hasDifference: true,
    explanation: 'Фактический вывод отличается от ожидаемого результата.',
    expectedNormalized: expTrimmed,
    actualNormalized: actTrimmed,
    differenceType: 'content_mismatch',
  };
}
