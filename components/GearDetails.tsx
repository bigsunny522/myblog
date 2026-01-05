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
    <div className="flex flex-col md:flex-row h-full md:h-[500px]">
      <div className="relative w-full md:w-1/2 bg-secondary h-64 md:h-full shrink-0">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 md:p-8 space-y-4 bg-background w-full md:w-1/2 overflow-y-auto max-h-[60vh] md:max-h-full flex flex-col">
        <div>
          <span className="text-primary text-xs font-bold uppercase tracking-wider">
            {item.category}
          </span>
          <h2 className="text-[clamp(1.5rem,4vw,1.875rem)] font-bold font-outfit mt-1 text-foreground leading-tight">
            <BudouxText>{item.name}</BudouxText>
          </h2>
        </div>
        
        <BudouxText as="p" className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">
          {item.description}
        </BudouxText>

        <div className="mt-auto space-y-4">
          {item.specs && (
            <div className="bg-secondary/30 rounded-lg p-4">
              <h4 className="font-semibold text-xs mb-3 text-foreground uppercase tracking-wide">Specifications</h4>
              <div className="grid grid-cols-1 gap-x-8 gap-y-2 text-xs">
                {Object.entries(item.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-border/50 py-1 last:border-0">
                    <span className="text-muted-foreground">{key}</span>
                    {value.startsWith('http') ? (
                      <a 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-primary text-right truncate max-w-[150px] md:max-w-[200px] hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="font-medium text-foreground text-right truncate max-w-[150px] md:max-w-[200px]"><BudouxText>{value}</BudouxText></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasLinks && (
            <div className="grid grid-cols-1 gap-3 pt-4 border-t border-border/50">
              {item.link_official && (
                <a 
                  href={item.link_official}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-card border border-border hover:border-primary/50 text-foreground rounded-xl transition-all hover:bg-primary/5 group"
                >
                  <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-bold font-outfit">Official Site</span>
                </a>
              )}
              {item.link_amazon && (
                <a 
                  href={item.link_amazon}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#FF9900]/10 border border-[#FF9900]/20 hover:border-[#FF9900]/50 text-[#FF9900] rounded-xl transition-all hover:bg-[#FF9900]/20"
                >
                  <ShoppingCart size={16} />
                  <span className="text-sm font-bold font-outfit">Amazon</span>
                </a>
              )}
              {item.link_rakuten && (
                <a 
                  href={item.link_rakuten}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#BF0000]/10 border border-[#BF0000]/20 hover:border-[#BF0000]/50 text-[#BF0000] rounded-xl transition-all hover:bg-[#BF0000]/20"
                >
                  <ShoppingCart size={16} />
                  <span className="text-sm font-bold font-outfit">Rakuten</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
