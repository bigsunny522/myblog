'use client';

import { loadDefaultJapaneseParser } from 'budoux';
import React, { HTMLAttributes, ReactNode, useMemo } from 'react';
import { cn } from '@/lib/utils';

const parser = loadDefaultJapaneseParser();

type BudouxTextProps = HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  className?: string;
  children: ReactNode;
};

export const BudouxText = ({
  as: Component = 'span',
  className,
  children,
  ...props
}: BudouxTextProps) => {
  const parsedChildren = useMemo(() => {
    const processNode = (node: ReactNode): ReactNode => {
      if (typeof node === 'string') {
        if (!node.trim()) return node;
        const segments = parser.parse(node);
        return segments.map((segment, i) => (
          <span 
            key={`${segment}-${i}`} 
            className="inline-block"
          >
            {segment}
          </span>
        ));
      }

      if (Array.isArray(node)) {
         return React.Children.map(node, processNode);
      }
      
      if (React.isValidElement(node)) {
        const element = node as React.ReactElement<any>;
        // Process children of the element if they exist
        if (element.props.children) {
            return React.cloneElement(element, {
                ...element.props,
                children: processNode(element.props.children)
            });
        }
        return node;
      }
      
      return node;
    };
    
    return processNode(children);

  }, [children]);

  return (
    <Component
      className={cn('break-normal break-words', className)}
      suppressHydrationWarning
      {...props}
    >
      {parsedChildren}
    </Component>
  );
};
