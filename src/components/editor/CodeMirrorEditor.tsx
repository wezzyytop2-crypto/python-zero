import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from '../../hooks/useTheme';

interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  placeholder?: string;
}

export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  minHeight = '180px',
  maxHeight,
  className = '',
  placeholder = '# Напишите код на Python здесь...',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors shadow-xs ${className}`}>
      <CodeMirror
        value={value}
        height="100%"
        minHeight={minHeight}
        maxHeight={maxHeight}
        theme={theme === 'dark' ? oneDark : 'light'}
        extensions={[python()]}
        readOnly={readOnly}
        editable={!readOnly}
        placeholder={placeholder}
        onChange={(val) => {
          if (onChange) onChange(val);
        }}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
};
