import {notFound} from 'next/navigation';
import {ReactNode} from 'react';

import {loadLevel, Level} from '@/app/models/level';
import {loadUnit, Unit} from '@/app/models/unit';
import LevelProvider from '@/providers/LevelProvider';

export default async function LevelLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{slug: string; lessonIndex: string; levelIndex: string}>;
}) {
  const {slug, lessonIndex, levelIndex} = await params;

  // Load unit data
  let unit: Unit | undefined;
  try {
    unit = await loadUnit(slug);
  } catch (_) {
    console.log(_);
    // If the file doesn't exist or is malformed, return 404
    return notFound();
  }

  const realLessonIndex = parseInt(lessonIndex) - 1;
  const realLevelIndex = parseInt(levelIndex) - 1;
  const levelShim = unit?.lessons?.[realLessonIndex]?.levels?.[realLevelIndex];
  const levelKey = levelShim.levelKeys[0];

  // Load level data
  let level: Level | undefined;
  try {
    level = await loadLevel(levelKey);
  } catch (_) {
    console.log(_);
    // If the file doesn't exist or is malformed, return 404
    return notFound();
  }

  console.log('LAYOUT', level);

  return (
    <LevelProvider
      level={level}
      lessonIndex={parseInt(lessonIndex)}
      levelIndex={parseInt(levelIndex)}
    >
      {children}
    </LevelProvider>
  );
}
