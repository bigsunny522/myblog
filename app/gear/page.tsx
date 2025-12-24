import React from 'react';
import { getAllGearItems } from '@/lib/gear-data';
import { GearPageClient } from '@/components/GearPageClient';

export default function GearPage() {
  const gearItems = getAllGearItems();

  return <GearPageClient items={gearItems} />;
}
