import {notFound} from 'next/navigation';
import {ReactNode} from 'react';

import {loadUnit, Unit} from '@/app/models/unit';
import UnitProvider from '@/providers/UnitProvider';

export default async function UnitLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;

  // Load unit data
  let unit: Unit | undefined;
  try {
    unit = await loadUnit(slug);
  } catch (_) {
    // If the file doesn't exist or is malformed, return 404
    return notFound();
  }

  return <UnitProvider unit={unit}>{children}</UnitProvider>;
}
