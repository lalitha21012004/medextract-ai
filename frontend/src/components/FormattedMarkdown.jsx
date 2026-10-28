import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function FormattedMarkdown({ content }) {
  return (
    <ReactMarkdown
      components={{
        h3: ({ node, ...props }) => (
          <h3 className="text-sm font-bold text-slate-900 mt-3 mb-1.5 border-b border-slate-100 pb-1" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-2" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1 my-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-5 text-xs sm:text-sm text-slate-700 space-y-1 my-2" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-relaxed" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-semibold text-slate-900 bg-blue-50/70 px-1 py-0.5 rounded text-blue-950" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-slate-600 font-serif" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}