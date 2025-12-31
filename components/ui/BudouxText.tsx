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
          <React.Fragment key={i}>
            {segment}
            {i < segments.length - 1 && <wbr />}
          </React.Fragment>
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
      className={cn('break-keep overflow-wrap-anywhere', className)}
      style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}
      {...props}
    >
      {parsedChildren}
    </Component>
  );
};
