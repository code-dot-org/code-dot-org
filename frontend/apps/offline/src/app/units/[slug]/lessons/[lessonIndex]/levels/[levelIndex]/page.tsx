import {notFound} from 'next/navigation';

import {loadLevel, parseLevelData} from '@/app/models/level';
import {loadUnit, parseUnitData} from '@/app/models/unit';
import Header from '@/components/header';
import Progress from '@/components/progress';
import UnitLevel from '@/components/unit/UnitLevel';

export default async function UnitLevelPage({
  params,
}: {
  params: Promise<{slug: string; lessonIndex: string; levelIndex: string}>;
}) {
  const {slug, lessonIndex, levelIndex} = await params;

  // Load unit data
  let data = {};
  try {
    data = await loadUnit(slug);
  } catch (_) {
    // If the file doesn't exist or is malformed, return 404
    return notFound();
  }

  const unit = parseUnitData(data);

  const realLessonIndex = parseInt(lessonIndex) - 1;
  const realLevelIndex = parseInt(levelIndex) - 1;
  const level = unit?.lessons?.[realLessonIndex]?.levels?.[realLevelIndex];
  const levelKey = level.levelKeys[0];

  // Parse level data
  let rawLevelData = {};
  try {
    rawLevelData = await loadLevel(levelKey);
  } catch (_) {
    // If the file doesn't exist or is malformed, return 404
    return notFound();
  }

  const levelData = await parseLevelData(levelKey, rawLevelData);

  return (
    <div
      id="root"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Header inLevel>
        <Progress
          unit={unit}
          unitKey={slug}
          lessonIndex={realLessonIndex}
          levelIndex={realLevelIndex}
        />
      </Header>
      <UnitLevel levelData={levelData} />
    </div>
  );
}
