import React from 'react';

export const Specs = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="my-8 w-full overflow-hidden rounded-lg border border-primary/20 border-l-4 bg-card text-card-foreground shadow-sm">
      <dl className="divide-y divide-primary/10">
        {children}
      </dl>
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
      <dt className="flex items-center px-4 py-3 text-sm font-bold text-foreground bg-primary/5 sm:w-1/3 sm:px-6">
        {label}
      </dt>
      <dd className="px-4 py-3 text-sm text-foreground sm:w-2/3 sm:px-6 sm:py-4 leading-relaxed">
        {children}
      </dd>
    </div>
  );
};
