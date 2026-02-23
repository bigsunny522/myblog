import React from 'react';
import { Specs, SpecsItem } from './Specs';

import { cn } from '@/lib/utils';

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
    // Marker style: thick underline (starts at 60%, ends at 90% to avoid line spacing)
    style.background = `linear-gradient(transparent 60%, ${bg}80 60%, ${bg}80 90%, transparent 90%)`;
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
    className={cn("text-[clamp(1.5rem,5vw,2.5rem)] font-bold mt-12 mb-6 pb-3 border-b-4 border-primary/20 flex flex-col gap-2 leading-tight", props.className)} 
    {...props}
  >
    {children}
  </h1>
);

const H2 = ({ children, id, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  // H2: Left border, large text, nice spacing
  <h2 
    id={id} 
    className={cn("text-[clamp(1.35rem,4.5vw,2rem)] font-bold mt-10 mb-4 pb-2 border-b-2 border-border/50 flex items-center gap-2 group leading-tight", props.className)} 
    {...props}
  >
    <span className="w-1.5 h-7 bg-primary rounded-full shrink-0" />
    {children}
  </h2>
);

const H3 = ({ children, id, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  // H3: Simple bottom underlined or just larger
  <h3 
    id={id} 
    className={cn("text-[clamp(1rem,2.5vw,1.25rem)] font-bold mt-8 mb-3 flex items-center gap-2 text-foreground/90 leading-tight", props.className)} 
    {...props}
  >
    <span className="text-primary/60 font-black">#</span>
    {children}
  </h3>
);


// Custom Paragraph Component for proper spacing
const P = ({ children, className, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div className={cn("mb-3 indent-[1em] leading-relaxed text-pretty", className)} {...props}>
    {children}
  </div>
);

// Custom Anchor Component to handle long URLs
const A = ({ children, className, ...props }: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => (
  <a 
    className={cn("text-primary hover:underline underline-offset-4", className)} 
    {...props}
  >
    {children}
  </a>
);

// Custom List Components
const UL = ({ children, className, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => (
  <ul className={cn("list-disc list-outside pl-6 mb-6 space-y-2 marker:text-primary/80", className)} {...props}>
    {children}
  </ul>
);

const OL = ({ children, className, ...props }: React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>) => (
  <ol className={cn("list-decimal list-outside pl-6 mb-6 space-y-2 marker:text-primary/80 font-bold", className)} {...props}>
    {children}
  </ol>
);

const LI = ({ children, className, ...props }: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>) => {
  const childArray = React.Children.toArray(children);
  
  // Check pattern: [Strong/B/strong element, String starting with ": " or "：", ...]
  // Note: MDX/React might wrap strong in a certain way, usually it's a direct child object.
  const isKeyValue = childArray.length >= 2 &&
    React.isValidElement(childArray[0]) &&
    (childArray[0].type === 'strong' || childArray[0].type === 'b') &&
    typeof childArray[1] === 'string' &&
    (childArray[1].startsWith(':') || childArray[1].startsWith('：'));

  if (isKeyValue) {
    const keyNode = childArray[0];
    const secondChild = childArray[1] as string;
    // Extract separator (colon + spaces)
    const separatorMatch = secondChild.match(/^([:：]\s*)/);
    const separator = separatorMatch ? separatorMatch[0] : '';
    
    // The rest of the string in the second child
    const valuePart1 = secondChild.substring(separator.length);
    // All subsequent children
    const restChildren = childArray.slice(2);

    return (
      <li className={cn("leading-relaxed pl-1", className)} {...props}>
        <div className="flex items-start">
          <span className="shrink-0 mr-2 text-foreground font-bold">
            {keyNode}{separator.trim()}
          </span>
          <span className="font-normal text-foreground min-w-0">
             {[valuePart1, ...restChildren]}
          </span>
        </div>
      </li>
    );
  }

  return (
    <li className={cn("leading-relaxed pl-1", className)} {...props}>
      <span className="font-normal text-foreground">
        {children}
      </span>
    </li>
  );
};

import { ImageModal } from '@/components/ImageModal';

// Export the components mapping
export const mdxComponents = {
  Text,
  a: A,
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  img: (props: any) => <ImageModal {...props} />, // Use functional wrapper to ensure props are passed correctly
  ImageModal, // Named component for direct JSX use in MDX: <ImageModal src="..." />
  Specs,
  SpecsItem,
  // Add other custom components here if needed
};
