import React from 'react';
import { Specs, SpecsItem } from './Specs';

// Custom Text Component for color and highlighting
const Text = ({ 
  children, 
  color, 
  bg, 
  className 
}: { 
  children: React.ReactNode, 
  color?: string, 
  bg?: string, 
  className?: string 
}) => {
  const style: React.CSSProperties = {};
  if (color) style.color = color;
  if (bg) style.backgroundColor = bg;

  // Map simple color names to Tailwind colors if desired, OR just use style. 
  // For simplicity allowing standard CSS colors and Tailwind classes.

  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
};

// Custom Heading Components to preserve IDs for TOC
const H1 = ({ children, id, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  // H1: Very prominent, double underline or background
  <h1 
    id={id} 
    className="text-3xl md:text-4xl font-bold mt-12 mb-6 pb-3 border-b-4 border-primary/20 flex flex-col gap-2" 
    {...props}
  >
    {children}
  </h1>
);

const H2 = ({ children, id, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  // H2: Left border, large text, nice spacing
  <h2 
    id={id} 
    className="text-2xl font-bold mt-10 mb-4 pb-2 border-b-2 border-border/50 flex items-center gap-2 group" 
    {...props}
  >
    <div className="w-1.5 h-6 bg-primary rounded-full" />
    {children}
  </h2>
);

const H3 = ({ children, id, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  // H3: Simple bottom underlined or just larger
  <h3 
    id={id} 
    className="text-xl font-bold mt-8 mb-3 flex items-center gap-2 text-foreground/90" 
    {...props}
  >
    <span className="text-primary/60 font-black">#</span>
    {children}
  </h3>
);


// Custom Paragraph Component for proper spacing
const P = ({ children, className, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>) => (
  <p className={`mb-6 leading-relaxed text-pretty ${className || ''}`} {...props}>
    {children}
  </p>
);

// Export the components mapping
export const mdxComponents = {
  Text,
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  Specs,
  SpecsItem,
  // Add other custom components here if needed
};
