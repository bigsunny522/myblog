import React from 'react';
import { GearItem } from '@/lib/gear';
import { BudouxText } from './ui/BudouxText';
import { ExternalLink, ShoppingCart } from 'lucide-react';

interface GearDetailsProps {
  item: GearItem;
}

export function GearDetails({ item }: GearDetailsProps) {
  const hasLinks = item.link_official || item.link_amazon || item.link_rakuten;

  return (
    <div className="flex flex-col md:flex-row h-auto w-full group/gear-details">
      <div className="relative w-full md:w-[40%] bg-secondary h-32 md:h-auto shrink-0 md:min-h-[300px]">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 md:p-8 space-y-3 md:space-y-4 bg-background w-full md:w-[60%] flex flex-col">
        <div>
          <span className="text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider">
            {item.category}
          </span>
          <h2 className="text-[clamp(1.25rem,4vw,1.875rem)] font-bold font-outfit text-foreground leading-tight">
            <BudouxText>{item.name}</BudouxText>
          </h2>
        </div>
        
        <div className="text-muted-foreground leading-snug md:leading-relaxed text-xs md:text-sm break-keep overflow-anywhere text-pretty">
          {item.description.split('\n').map((line, i) => (
             <div key={i} className="min-h-[1.25em]">
               {line ? <BudouxText>{line}</BudouxText> : null}
             </div>
          ))}
        </div>

        <div className="mt-auto space-y-3 md:space-y-4 pt-2 md:pt-4">
          {(item.specs || item.manufacturer) && (
            <div className="bg-secondary/30 rounded-lg p-3 md:p-4">
              <h4 className="font-semibold text-[10px] md:text-xs mb-2 md:mb-3 text-foreground uppercase tracking-wide">Specifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 md:gap-y-2 text-[10px] md:text-xs">
                {item.manufacturer && (
                  <div className="flex justify-between border-b border-border/50 py-1 last:border-0 md:last:border-b">
                    <span className="text-muted-foreground shrink-0 pr-2">Manufacturer</span>
                    <span className="font-medium text-foreground text-right min-w-0 break-words text-pretty"><BudouxText>{item.manufacturer}</BudouxText></span>
                  </div>
                )}
                {item.specs && Object.entries(item.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-border/50 py-1 last:border-0 md:last:border-b">
                    <span className="text-muted-foreground shrink-0 pr-2">{key}</span>
                    {value.startsWith('http') ? (
                      <a 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-primary text-right min-w-0 hover:underline break-all"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="font-medium text-foreground text-right min-w-0 break-words text-pretty"><BudouxText>{value}</BudouxText></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasLinks && (
            <div className="flex flex-col md:flex-row gap-2 pt-2 md:pt-4 border-t border-border/50">
              {item.link_official && (
                <a 
                  href={item.link_official}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:flex-1 flex items-center justify-center gap-2 px-3 py-2 md:py-3 bg-card border border-border hover:border-primary/50 text-foreground rounded-xl transition-all hover:bg-primary/5 group md:min-w-[120px]"
                >
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs font-bold font-outfit whitespace-nowrap">公式ストア</span>
                </a>
              )}
              {item.link_amazon && (
                <a 
                  href={item.link_amazon}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:flex-1 flex items-center justify-center gap-2 px-3 py-2 md:py-3 bg-[#FF9900]/10 border border-[#FF9900]/20 hover:border-[#FF9900]/50 text-[#FF9900] rounded-xl transition-all hover:bg-[#FF9900]/20 md:min-w-[100px]"
                >
                  <ShoppingCart size={14} />
                  <span className="text-xs font-bold font-outfit">Amazon</span>
                </a>
              )}
              {item.link_rakuten && (
                <a 
                  href={item.link_rakuten}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:flex-1 flex items-center justify-center gap-2 px-3 py-2 md:py-3 bg-[#BF0000]/10 border border-[#BF0000]/20 hover:border-[#BF0000]/50 text-[#BF0000] rounded-xl transition-all hover:bg-[#BF0000]/20 md:min-w-[100px]"
                >
                  <ShoppingCart size={14} />
                  <span className="text-xs font-bold font-outfit">Rakuten</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
