import React from 'react';
import { cn } from '@/lib/utils';

type DividerType = 'wave' | 'tilt' | 'curve' | 'triangle';
type DividerPosition = 'top' | 'bottom';

interface SectionDividerProps {
  type?: DividerType;
  position?: DividerPosition;
  className?: string;
  fill?: string;
  height?: string;
  flip?: boolean;
}

export const SectionDivider = ({
  type = 'wave',
  position = 'bottom',
  className,
  fill = 'fill-background',
  height = 'h-16 md:h-24',
  flip = false,
}: SectionDividerProps) => {
  const getPath = () => {
    switch (type) {
      case 'wave':
        return "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,101.3C960,117,1056,139,1152,138.7C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z";
      case 'tilt':
        return "M0,320L1440,0L1440,320L0,320Z";
      case 'curve':
        return "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z";
      case 'triangle':
        return "M0,320L720,64L1440,320L0,320Z";
      default:
        return "";
    }
  };

  const viewBox = type === 'wave' || type === 'curve' ? "0 0 1440 320" : 
                 type === 'tilt' ? "0 0 1440 320" :
                 type === 'triangle' ? "0 0 1440 320" : "0 0 1440 320";

  return (
    <div 
      className={cn(
        "absolute left-0 w-full overflow-hidden leading-[0]",
        position === 'top' ? 'top-0 -translate-y-full' : 'bottom-0 translate-y-full', // Slightly revised to overlay or sit outside
        position === 'top' ? 'top-0' : 'bottom-0', 
        height,
        className
      )}
      style={{ 
        transform: position === 'top' 
          ? `rotate(${flip ? 180 : 0}deg) translateY(1px)` // Overlap downwards to close gap
          : `rotate(${flip ? 0 : 180}deg) translateY(-1px)`, // Overlap upwards to close gap
        zIndex: 20
      }}
    >
      <svg 
        className={cn("relative block w-[calc(100%+1.3px)] h-full", fill)}
        viewBox={viewBox} 
        preserveAspectRatio="none"
      >
        <path 
          d={getPath()} 
        />
      </svg>
    </div>
  );
};
