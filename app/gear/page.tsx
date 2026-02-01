import React from 'react';
import type { Metadata } from 'next';
import { getAllGearItems } from '@/lib/gear-data';
import { GearPageClient } from '@/components/GearPageClient';

export const metadata: Metadata = {
  title: 'My Gear',
  description: 'Zack\'s curated list of gadgets and desk setup gear.',
  openGraph: {
    title: 'My Gear',
    description: 'Zack\'s curated list of gadgets and desk setup gear.',
    url: '/gear',
  },
};

export default function GearPage() {
  const gearItems = getAllGearItems();

  return <GearPageClient items={gearItems} />;
}
