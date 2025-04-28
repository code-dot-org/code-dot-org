import {notFound} from 'next/navigation';

import {loadUnit, parseUnitData} from '@/app/models/unit';
import Header from '@/components/header';
import Unit from '@/components/unit';

export default async function UnitViewPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;

  // Load unit data
  let data = {};
  try {
    data = await loadUnit(slug);
  } catch (_) {
    // If the file doesn't exist or is malformed, return 404
    return notFound();
  }

  const unit = await parseUnitData(data);

  return (
    <div
      id="root"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Header />
      <Unit unitKey={slug} unit={unit} />
    </div>
  );
}
