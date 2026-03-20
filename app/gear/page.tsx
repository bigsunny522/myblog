import React from 'react';
import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';
import { getAllGearItems } from '@/lib/gear-data';
import { GearPageClient } from '@/components/GearPageClient';

const siteImage = `${getBaseUrl()}/images/main/skyblue.png`;

export const metadata: Metadata = {
  title: 'My Gear',
  description: 'Zack\'s curated list of gadgets and desk setup gear.',
  openGraph: {
    title: 'My Gear | ざっくらぼ',
    description: 'Zack\'s curated list of gadgets and desk setup gear.',
    url: '/gear',
    siteName: 'ざっくらぼ',
    type: 'website',
    images: [{ url: siteImage, width: 1200, height: 630, alt: 'ざっくらぼ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Gear | ざっくらぼ',
    description: 'Zack\'s curated list of gadgets and desk setup gear.',
    images: [siteImage],
  },
};

export default function GearPage() {
  const gearItems = getAllGearItems();

  return <GearPageClient items={gearItems} />;
}
