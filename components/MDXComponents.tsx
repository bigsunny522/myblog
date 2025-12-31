import React from 'react';
import { Specs, SpecsItem } from './Specs';
import { BudouxText } from './ui/BudouxText';

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
  if (bg) {
    style.background = `linear-gradient(transparent 75%, ${bg} 75%)`;
  }

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
    className="text-[clamp(1.5rem,5vw,2.5rem)] font-bold mt-12 mb-6 pb-3 border-b-4 border-primary/20 flex flex-col gap-2 leading-tight" 
    {...props}
  >
    <BudouxText>{children}</BudouxText>
  </h1>
);

const H2 = ({ children, id, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  // H2: Left border, large text, nice spacing
  <h2 
    id={id} 
    className="text-[clamp(1.25rem,4vw,1.75rem)] font-bold mt-10 mb-4 pb-2 border-b-2 border-border/50 flex items-center gap-2 group leading-tight" 
    {...props}
  >
    <div className="w-1.5 h-6 bg-primary rounded-full" />
    <BudouxText>{children}</BudouxText>
  </h2>
);

const H3 = ({ children, id, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  // H3: Simple bottom underlined or just larger
  <h3 
    id={id} 
    className="text-[clamp(1.125rem,3vw,1.5rem)] font-bold mt-8 mb-3 flex items-center gap-2 text-foreground/90 leading-tight" 
    {...props}
  >
    <span className="text-primary/60 font-black">#</span>
    <BudouxText>{children}</BudouxText>
  </h3>
);


// Custom Paragraph Component for proper spacing
const P = ({ children, className, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>) => (
  <p className={`mb-6 leading-relaxed text-pretty ${className || ''}`} {...props}>
    <BudouxText>{children}</BudouxText>
  </p>
);

// Custom Anchor Component to handle long URLs
const A = ({ children, className, ...props }: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => (
  <a 
    className={`text-primary hover:underline underline-offset-4 ${className || ''}`} 
    {...props}
  >
    {children}
  </a>
);

// Export the components mapping
export const mdxComponents = {
  Text,
  a: A,
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  Specs,
  SpecsItem,
  // Add other custom components here if needed
};
