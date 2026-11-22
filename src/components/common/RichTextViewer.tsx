import React, { useMemo } from 'react';

interface RichTextViewerProps {
  content: string;
}

function sanitizeHtml(raw: string): string {
  const normalized = raw.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').trim();
  if (!normalized) return '';

  const html = /<[a-z][\s\S]*>/i.test(normalized)
    ? normalized.replace(/\n{2,}/g, '<br /><br />').replace(/\n/g, '<br />')
    : normalized
        .split(/\n{2,}/)
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
