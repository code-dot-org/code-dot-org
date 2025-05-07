'use client';

import {useContext} from 'react';

import Header from '@/components/header';
import {ProgressNavigator} from '@/components/header/progress';
import UnitLevel from '@/components/unit/UnitLevel';
import LevelContext from '@/contexts/LevelContext';
import UnitContext from '@/contexts/UnitContext';

export default function UnitLevelPage() {
  const {unit} = useContext(UnitContext);
  const {lessonIndex, levelIndex, level} = useContext(LevelContext);
  const realLessonIndex = parseInt(lessonIndex) - 1;
  const realLevelIndex = parseInt(levelIndex) - 1;

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
        <ProgressNavigator
          unit={unit}
          unitKey={unit.key}
          lessonIndex={realLessonIndex}
          levelIndex={realLevelIndex}
        />
      </Header>
      <UnitLevel levelData={level} />
    </div>
  );
}
