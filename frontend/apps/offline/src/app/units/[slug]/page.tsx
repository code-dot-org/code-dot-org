import fs from 'fs/promises';
import {notFound} from 'next/navigation';
import path from 'path';

import {parseUnitData} from '@/app/models/unit';
import Header from '@/components/header';
import Unit from '@/components/unit';

export default async function UnitPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;

  // Load unit data
  const filePath = path.join(
    process.cwd(),
    'data',
    'units',
    `${slug}.script_json`,
  );

  let data = {};
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (_) {
    //If the file doesn't exist or is malformed, return 404
    return notFound();
  }

  const {config, lessonGroups, lessons} = await parseUnitData(data);

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
      <Unit
        unitKey={slug}
        data={config}
        lessonGroups={lessonGroups}
        lessons={lessons}
      />
    </div>
  );
}
