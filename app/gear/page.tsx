import React from 'react';
import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';
import { getAllGearItems } from '@/lib/gear-data';
import { GearPageClient } from '@/components/GearPageClient';

const siteImage = `${getBaseUrl()}/images/main/skyblue.png`;

export const metadata: Metadata = {
  alternates: { canonical: '/gear' },
  title: 'My Gear',
  description: '運営者が実際に使っているガジェットとデスク環境の一覧です。',
  openGraph: {
    title: 'My Gear | ざっくらぼ',
    description: '運営者が実際に使っているガジェットとデスク環境の一覧です。',
    url: '/gear',
    siteName: 'ざっくらぼ',
    type: 'website',
    images: [{ url: siteImage, width: 1200, height: 630, alt: 'ざっくらぼ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Gear | ざっくらぼ',
    description: '運営者が実際に使っているガジェットとデスク環境の一覧です。',
    images: [siteImage],
  },
};

export default function GearPage() {
  const gearItems = getAllGearItems();

  return <GearPageClient items={gearItems} />;
}
