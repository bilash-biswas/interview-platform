'use client';

import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRenderProps {
  text: string;
}

const MathRender: React.FC<MathRenderProps> = ({ text }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Split text by $$ to find equations
      // Example: "Calculate $$\int x dx$$" -> ["Calculate ", "\int x dx", ""]
      const parts = text.split('$$');

      containerRef.current.innerHTML = '';

      parts.forEach((part, index) => {
        if (index % 2 === 1) {
          // Inside $$ ... $$ -> Render with KaTeX
          const span = document.createElement('span');
          try {
            katex.render(part, span, {
              throwOnError: false,
              displayMode: true, // or false depending on preference
            });
            containerRef.current?.appendChild(span);
          } catch (e) {
            containerRef.current?.appendChild(document.createTextNode(`$$${part}$$`));
          }
        } else {
          // Regular text
          containerRef.current?.appendChild(document.createTextNode(part));
        }
      });
    }
  }, [text]);

  return <span ref={containerRef} className="math-content" />;
};

export default MathRender;
