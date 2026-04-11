"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BudouxText } from './ui/BudouxText';

type SpecsItemData = { label: string; value: string };

export const Specs = ({
  children,
  items: itemsProp,
}: {
  children?: React.ReactNode;
  items?: SpecsItemData[];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // TinaCMS テンプレート経由（items プロップ）と既存 MDX children の両方に対応
  const items = itemsProp
    ? itemsProp.map((item, i) => (
        <SpecsItem key={i} label={item.label}>{item.value}</SpecsItem>
      ))
    : React.Children.toArray(children);
  const SHOWN_ITEMS_COUNT = 5;

  const hasMoreItems = items.length > SHOWN_ITEMS_COUNT;

  return (
    <div className="my-6 w-full overflow-hidden rounded-lg border border-primary/20 border-l-4 bg-card text-card-foreground shadow-sm transition-all duration-300">
      <dl className="divide-y divide-primary/10">
        {items.map((child, index) => {
          // 5番目以降は、展開されていない場合はスマホで隠す（PCは常に表示）
          const isHidden = index >= SHOWN_ITEMS_COUNT && !isExpanded;
          return (
            <div key={index} className={isHidden ? "hidden md:block" : "block"}>
              {child}
            </div>
          );
        })}
      </dl>
      
      {hasMoreItems && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 text-sm font-medium text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors flex items-center justify-center gap-2 md:hidden border-t border-primary/10"
        >
          {isExpanded ? (
            <>
              閉じる <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              もっと見る <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export const SpecsItem = ({ 
  label, 
  children 
}: { 
  label: string; 
  children: React.ReactNode; 
}) => {
  return (
    <div className="flex flex-col sm:flex-row">
      <dt className="flex items-center px-3 py-2 text-xs sm:text-sm font-bold text-foreground bg-primary/5 sm:w-1/3 sm:px-4">
        <BudouxText>{label}</BudouxText>
      </dt>
      <dd className="px-3 py-2 text-xs sm:text-sm text-foreground sm:w-2/3 sm:px-4 sm:py-2 leading-relaxed">
        <BudouxText>{children}</BudouxText>
      </dd>
    </div>
  );
};
