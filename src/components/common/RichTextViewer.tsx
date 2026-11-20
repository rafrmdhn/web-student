import React, { useMemo } from 'react';

interface RichTextViewerProps {
  content: string;
}

function sanitizeHtml(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const html = /<[a-z][\s\S]*>/i.test(trimmed)
    ? trimmed
    : trimmed
        .split('\n\n')
        .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
        .join('');

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, iframe, object, embed').forEach((node) => node.remove());
  doc.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const val = attr.value.trim().toLowerCase();
      if (name.startsWith('on') || val.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({ content }) => {
  const safeHtml = useMemo(() => sanitizeHtml(content), [content]);

  return (
    <div
      className="rich-content max-w-[68ch]"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};
