import React, { useEffect, useRef } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function ensureHtmlContent(raw: string): string {
  const normalized = raw.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').trim();
  if (!normalized) return '';
  if (/<[a-z][\s\S]*>/i.test(normalized)) {
    return normalized.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br />');
  }
  return normalized
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis isi materi di sini seperti di dokumen Word...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>('');

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const normalized = ensureHtmlContent(value);
    if (normalized !== lastHtmlRef.current && el.innerHTML !== normalized) {
      el.innerHTML = normalized;
      lastHtmlRef.current = normalized;
    }
  }, [value]);

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastHtmlRef.current = html;
    onChange(html);
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const toolbarGroups: Array<
    Array<{
      label: string;
      icon: React.ReactNode;
      action: () => void;
    }>
  > = [
    [
      { label: 'Urungkan (Undo)', icon: <Undo2 className="h-4 w-4" />, action: () => runCommand('undo') },
      { label: 'Ulangi (Redo)', icon: <Redo2 className="h-4 w-4" />, action: () => runCommand('redo') },
    ],
    [
      {
        label: 'Paragraf Normal',
        icon: <Pilcrow className="h-4 w-4" />,
        action: () => runCommand('formatBlock', 'P'),
      },
      {
        label: 'Judul Bagian (H2)',
        icon: <Heading2 className="h-4 w-4" />,
        action: () => runCommand('formatBlock', 'H2'),
      },
      {
        label: 'Subjudul (H3)',
        icon: <Heading3 className="h-4 w-4" />,
        action: () => runCommand('formatBlock', 'H3'),
      },
    ],
    [
      { label: 'Tebal (Bold)', icon: <Bold className="h-4 w-4" />, action: () => runCommand('bold') },
      { label: 'Miring (Italic)', icon: <Italic className="h-4 w-4" />, action: () => runCommand('italic') },
      {
        label: 'Garis Bawah (Underline)',
        icon: <Underline className="h-4 w-4" />,
        action: () => runCommand('underline'),
      },
      {
        label: 'Coret (Strikethrough)',
        icon: <Strikethrough className="h-4 w-4" />,
        action: () => runCommand('strikeThrough'),
      },
    ],
    [
      {
        label: 'Rata Kiri',
        icon: <AlignLeft className="h-4 w-4" />,
        action: () => runCommand('justifyLeft'),
      },
      {
        label: 'Rata Tengah',
        icon: <AlignCenter className="h-4 w-4" />,
        action: () => runCommand('justifyCenter'),
      },
      {
        label: 'Rata Kanan',
        icon: <AlignRight className="h-4 w-4" />,
        action: () => runCommand('justifyRight'),
      },
      {
        label: 'Rata Kiri-Kanan',
        icon: <AlignJustify className="h-4 w-4" />,
        action: () => runCommand('justifyFull'),
      },
    ],
    [
      {
        label: 'Daftar Poin',
        icon: <List className="h-4 w-4" />,
        action: () => runCommand('insertUnorderedList'),
      },
      {
        label: 'Daftar Bernomor',
        icon: <ListOrdered className="h-4 w-4" />,
        action: () => runCommand('insertOrderedList'),
      },
      {
        label: 'Kutipan',
        icon: <Quote className="h-4 w-4" />,
        action: () => runCommand('formatBlock', 'BLOCKQUOTE'),
      },
      {
        label: 'Hapus Format',
        icon: <RemoveFormatting className="h-4 w-4" />,
        action: () => runCommand('removeFormat'),
      },
    ],
  ];

  const isEmpty = stripHtml(value).length === 0;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper">
      {/* Word-like Toolbar */}
      <div
        role="toolbar"
        aria-label="Alat format teks materi"
        className="flex flex-wrap items-center gap-1 border-b border-line bg-subtle px-2.5 py-2"
      >
        {toolbarGroups.map((group, gIdx) => (
          <React.Fragment key={gIdx}>
            {gIdx > 0 && <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />}
            {group.map((btn) => (
              <button
                key={btn.label}
                type="button"
                title={btn.label}
                aria-label={btn.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={btn.action}
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink transition-colors hover:bg-paper hover:text-accent"
              >
                {btn.icon}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Document Editable Area */}
      <div className="relative bg-paper">
        {isEmpty && (
          <p className="pointer-events-none absolute left-4 top-3.5 text-sm text-ink-muted/70">
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          className="rich-content min-h-[240px] max-h-[380px] overflow-y-auto px-4 py-3.5 focus:outline-none"
        />
      </div>
    </div>
  );
};
