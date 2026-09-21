export interface FriendlyError {
  type: string;
  originalMessage: string;
  friendlyTitle: string;
  friendlyDescription: string;
  tips: string[];
  lineNumber?: number;
}

export function parsePythonError(traceback: string): FriendlyError {
  // Extract line number if present: File "<exec>", line 3 or File "<string>", line 2
  const lineMatch = traceback.match(/File\s+["'][^"']+["'],\s+line\s+(\d+)/);
  const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

  // Extract error type and message: e.g. "NameError: name 'Print' is not defined"
  const lines = traceback.trim().split('\n');
  const lastLine = lines[lines.length - 1] || '';
  const errorMatch = lastLine.match(/^([A-Za-z0-9_]+Error|[A-Za-z0-9_]+Exception):\s*(.*)$/);

  const errorType = errorMatch ? errorMatch[1] : 'PythonError';
  const originalMessage = errorMatch ? errorMatch[2] : lastLine;

  let friendlyTitle = `Ошибка выполнения: ${errorType}`;
  let friendlyDescription = 'Программа завершилась с ошибкой. Компьютер не смог выполнить одну из команд.';
  let tips: string[] = ['Внимательно прочитайте текст программы и проверьте строку, где возникла ошибка.'];

  // 1. SyntaxError
  if (errorType === 'SyntaxError') {
    friendlyTitle = 'Синтаксическая ошибка (SyntaxError)';
    friendlyDescription = 'Компьютер не понял написанный код, так как нарушены правила грамматики языка Python.';

    if (originalMessage.includes('unterminated string literal') || originalMessage.includes('EOL while scanning string literal')) {
      friendlyTitle = 'Незакрытая строка (SyntaxError)';
      friendlyDescription = 'Вы открыли кавычку для текста, но забыли закрыть её до конца строки.';
      tips = [
        'Проверьте, есть ли закрывающая кавычка у всех строк.',
        'Используйте одинаковые кавычки: если открыли двойную ", то и закрывать нужно двойной ".',
        'Пример: print("Привет!") — кавычка стоит и в начале, и в конце текста.'
      ];
    } else if (originalMessage.includes('expected') && originalMessage.includes(':')) {
      friendlyTitle = 'Пропущено двоеточие (SyntaxError)';
      friendlyDescription = 'После условий if/elif/else и циклов for/while обязательно должно стоять двоеточие :';
      tips = [
        'Поставьте двоеточие : в самом конце строки с if, else, for или def.',
        'Пример: if x > 5:'
      ];
    } else {
      tips = [
        'Проверьте, все ли открытые скобки () были закрыты.',
        'Убедитесь, что все строки заключены в кавычки.',
        'Проверьте правильность знаков препинания (запятые, двоеточия).'
      ];
    }
  }

  // 2. NameError
  else if (errorType === 'NameError') {
    friendlyTitle = 'Неизвестное имя (NameError)';

    const nameMatch = originalMessage.match(/name '([^']+)' is not defined/);
    const varName = nameMatch ? nameMatch[1] : '';

    if (varName === 'Print' || varName === 'PRINT') {
      friendlyTitle = 'Опечатка в регистре print (NameError)';
      friendlyDescription = `Вы написали команду «${varName}» с большой буквы. В Python регистр букв имеет строгое значение!`;
      tips = [
        'Замените Print на print (все буквы маленькие).',
        'Компьютер воспринимает Print и print как две совершенно разные вещи.'
      ];
    } else if (varName) {
      friendlyDescription = `Компьютер встретил имя «${varName}», но не знает, что это такое. Переменная с таким именем не была создана.`;
      tips = [
        `Вы объявили переменную ${varName} выше в коде? Проверьте порядок команд.`,
        'Возможно, вы хотели вывести текст, но забыли взять его в кавычки? (например: print("слово"), а не print(слово)).',
        `Проверьте опечатки: возможно, вы случайно перепутали букву в имени «${varName}».`
      ];
    } else {
      tips = [
        'Убедитесь, что переменная была создана до того, как вы попытались её использовать.',
        'Если вы хотели вывести обычный текст, заключите его в кавычки.'
      ];
    }
  }

  // 3. IndentationError
  else if (errorType === 'IndentationError') {
    friendlyTitle = 'Ошибка отступов (IndentationError)';
    friendlyDescription = 'В языке Python отступы определяют структуру программы (что находится внутри условий или циклов). Сейчас отступы расставлены неравномерно.';
    tips = [
      'Стандартный отступ в Python — 4 пробела (или одна клавиша Tab).',
      'Не смешивайте клавишу Tab и пробелы в одном файле.',
      'После двоеточия : на следующей строке обязательно должен быть отступ вправо.'
    ];
  }

  // 4. TypeError
  else if (errorType === 'TypeError') {
    friendlyTitle = 'Несовместимость типов данных (TypeError)';
    friendlyDescription = 'Вы пытаетесь выполнить действие над типами данных, которые не подходят друг другу (например, сложить число и текст).';

    if (originalMessage.includes('can only concatenate str') || originalMessage.includes('unsupported operand type(s) for +')) {
      tips = [
        'Нельзя складывать строку и число через знак + (например: "Возраст: " + 16).',
        'Решение 1: выводите их через запятую в print("Возраст:", 16).',
        'Решение 2: преобразуйте число в строку с помощью функции str(16).'
      ];
    } else {
      tips = [
        'Проверьте типы значений: текст (str), целое число (int) или дробное (float).',
        'Используйте явное преобразование типов: int(), float(), str().'
      ];
    }
  }

  // 5. ZeroDivisionError
  else if (errorType === 'ZeroDivisionError') {
    friendlyTitle = 'Деление на ноль (ZeroDivisionError)';
    friendlyDescription = 'Программа попыталась разделить число на 0. В математике и в Python делить на ноль строго запрещено.';
    tips = [
      'Проверьте делитель: возможно, переменная приняла значение 0 неожиданно для вас.',
      'Добавьте условие if divider != 0:, чтобы предотвратить деление на ноль.'
    ];
  }

  // 6. ValueError
  else if (errorType === 'ValueError') {
    friendlyTitle = 'Неподходящее значение (ValueError)';
    friendlyDescription = 'Функция получила значение правильного типа, но с неподходящим содержимым.';

    if (originalMessage.includes('invalid literal for int()')) {
      tips = [
        'Функция int() может преобразовать только строку из чистых цифр (например, "123").',
        'Если строка содержит буквы или пробелы, преобразование падает с ошибкой.'
      ];
    } else {
      tips = [
        'Проверьте, какие данные передаются в функцию.',
        'Убедитесь, что формат входных данных соответствует ожиданиям.'
      ];
    }
  }

  // 7. IndexError
  else if (errorType === 'IndexError') {
    friendlyTitle = 'Индекс вне диапазона (IndexError)';
    friendlyDescription = 'Вы обратились к элементу списка или строки по номеру (индексу), которого не существует.';
    tips = [
      'Помните, что нумерация элементов в Python начинается с 0, а не с 1.',
      'Если в списке 3 элемента, их индексы: 0, 1 и 2. Индекс 3 вызовет ошибку.',
      'Проверьте длину списка с помощью функции len(my_list).'
    ];
  }

  // 8. TimeoutError (кастомный от раннера)
  else if (errorType === 'TimeoutError') {
    friendlyTitle = 'Превышено время выполнения (Таймаут 5 сек)';
    friendlyDescription = 'Программа выполнялась более 5 секунд и была принудительно остановлена. Чаще всего это происходит из-за бесконечного цикла.';
    tips = [
      'Проверьте циклы while: меняется ли переменная в условии цикла?',
      'Убедитесь, что условие выхода из цикла while рано или поздно станет False.',
      'Если вы случайно запустили бесконечный цикл while True:, добавьте команду break.'
    ];
  }

  return {
    type: errorType,
    originalMessage,
    friendlyTitle,
    friendlyDescription,
    tips,
    lineNumber,
  };
}
