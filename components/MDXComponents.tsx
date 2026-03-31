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

const H4 = ({ children, id, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  <h4
    id={id}
    className={cn("text-base font-bold mt-6 mb-2 pl-3 border-l-2 border-primary/40 text-foreground leading-tight", props.className)}
    {...props}
  >
    {children}
  </h4>
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

const FeaturePoint = ({ number, title, children }: {
  number: number;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-background border border-border rounded-xl p-5 md:p-6 mb-4">
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-3.5 bg-primary rounded-full shrink-0" />
        <div className="text-sm font-black text-primary font-outfit tracking-widest leading-none">
          POINT {String(number).padStart(2, '0')}
        </div>
      </div>
      <div className="text-lg md:text-xl font-bold text-foreground pl-3">{title}</div>
    </div>
    <div className="flex flex-col md:flex-row gap-4 items-start text-muted-foreground text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

const colClasses: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };
const ImageGrid = ({ children, columns = 2 }: { children: React.ReactNode; columns?: number }) => (
  <div className={cn('grid grid-cols-1 gap-4 my-8', colClasses[columns] ?? 'md:grid-cols-2')}>
    {children}
  </div>
);

const BuyLinks = ({ children, image, title, description }: {
  children: React.ReactNode;
  image?: string;
  title?: string;
  description?: string;
}) => {
  if (image || title) {
    return (
      <div className="my-8 p-6 bg-primary/10 rounded-2xl border border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {image && (
            <div className="shrink-0 w-32 h-32 bg-white rounded-xl overflow-hidden shadow-sm flex items-center justify-center p-2">
              <img src={image} alt={title || ''} className="w-full h-full object-contain" />
            </div>
          )}
          <div className="flex-1 space-y-2 text-center md:text-left">
            {title && <div className="font-bold text-lg font-outfit">{title}</div>}
            {description && <div className="text-sm text-muted-foreground">{description}</div>}
          </div>
          <div className="flex flex-col w-full md:w-auto gap-2 min-w-[200px]">
            {children}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="my-8 p-6 bg-primary/10 rounded-2xl border border-primary/20">
      <p className="text-sm font-semibold text-muted-foreground mb-3">購入・詳細をチェック</p>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
};

const BuyLink = ({ type, href, children }: { type: 'amazon' | 'rakuten' | 'official'; href: string; children: React.ReactNode }) => {
  const styles: Record<string, string> = {
    amazon: 'bg-[#FF9900]/10 border-[#FF9900]/20 hover:border-[#FF9900]/50 text-[#FF9900] hover:bg-[#FF9900]/20',
    rakuten: 'bg-[#BF0000]/10 border-[#BF0000]/20 hover:border-[#BF0000]/50 text-[#BF0000] hover:bg-[#BF0000]/20',
    official: 'bg-card border-border hover:border-primary/50 text-foreground hover:bg-primary/5',
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center justify-center px-4 py-3 border rounded-xl transition-all no-underline font-bold',
        styles[type] ?? styles.official
      )}
    >
      {children}
    </a>
  );
};

const ReviewSummary = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">{children}</div>
);

const ReviewPoints = ({ type, children }: { type: 'good' | 'con'; children: React.ReactNode }) => {
  const isGood = type === 'good';
  return (
    <div className="my-4">
      <div className={cn('pl-4 border-l-4 mb-4', isGood ? 'border-primary/50' : 'border-red-500/50')}>
        <h3 className="text-xl font-bold text-foreground m-0">{isGood ? 'GOOD' : '気になる点'}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

const ReviewPoint = ({ type, title, children }: { type: 'good' | 'con'; title: string; children: React.ReactNode }) => {
  const isGood = type === 'good';
  return (
    <div className={cn(
      'flex items-start p-4 rounded-xl border transition-colors',
      isGood
        ? 'border-primary/20 bg-primary/5 hover:bg-primary/10'
        : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
    )}>
      <div className="text-sm leading-relaxed">
        <strong className="block text-foreground mb-1 text-base">{title}</strong>
        <span className="text-muted-foreground">{children}</span>
      </div>
    </div>
  );
};

const U = ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <span
    style={{
      background: 'linear-gradient(transparent 60%, #7BABFF80 60%, #7BABFF80 90%, transparent 90%)',
    }}
    {...props}
  >
    {children}
  </span>
);

const CouponBox = ({ children }: { children: React.ReactNode }) => (
  <div className="relative my-8 rounded-2xl overflow-hidden border-2 border-dashed border-amber-400/70 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 dark:border-amber-500/60">
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/0 via-amber-400/50 to-amber-400/0" />
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/0 via-amber-400/50 to-amber-400/0" />
    <div className="px-6 py-5 [&_div.mb-3]:mb-1 [&_div.mb-3]:indent-0 [&_div.mb-3:last-child]:mb-0">
      {children}
    </div>
  </div>
);

const Blockquote = ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <div
    className="relative my-8 rounded-2xl overflow-hidden border-2 border-dashed border-amber-400/70 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 dark:border-amber-500/60"
    {...props}
  >
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/0 via-amber-400/50 to-amber-400/0" />
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/0 via-amber-400/50 to-amber-400/0" />
    <div className="px-6 py-5 [&_div.mb-3]:mb-1 [&_div.mb-3]:indent-0 [&_div.mb-3:last-child]:mb-0">
      {children}
    </div>
  </div>
);

// Export the components mapping
export const mdxComponents = {
  Text,
  a: A,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  u: U,
  blockquote: Blockquote,
  CouponBox,
  img: (props: any) => {
    const { alt, ...rest } = props;
    const sizeMatch = (alt as string | undefined)?.match(/\|(small|medium|large|(\d+(?:\.\d+)?)%)$/i);
    let maxWidth: string | undefined;
    if (sizeMatch) {
      const token = sizeMatch[1].toLowerCase();
      if (token === 'small') maxWidth = '33%';
      else if (token === 'medium') maxWidth = '50%';
      else if (token === 'large') maxWidth = '75%';
      else maxWidth = token; // e.g. "50%"
    }
    const cleanAlt = alt ? (alt as string).replace(/\|(small|medium|large|\d+(?:\.\d+)?%)$/i, '').trim() : alt;
    return <ImageModal {...rest} alt={cleanAlt} maxWidth={maxWidth} />;
  }, // Use functional wrapper to ensure props are passed correctly
  ImageModal, // Named component for direct JSX use in MDX: <ImageModal src="..." />
  Specs,
  SpecsItem,
  BuyLinks,
  BuyLink,
  ReviewSummary,
  ReviewPoints,
  ReviewPoint,
  FeaturePoint,
  ImageGrid,
};
