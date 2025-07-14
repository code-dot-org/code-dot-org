'use client';

import {useContext} from 'react';

import * as FrequencyAnalysisLab from '@code-dot-org/lab-frequency-analysis';

import Header from '@/components/header';
import {ProgressNavigator} from '@/components/header/progress';
import UnitLevel from '@/components/unit/UnitLevel';
import LevelContext from '@/contexts/LevelContext';
import UnitContext from '@/contexts/UnitContext';
import {register} from '@/levels/registry';

export default function UnitLevelPage() {
  const {unit} = useContext(UnitContext);
  const {lessonIndex, levelIndex, level} = useContext(LevelContext);
  const realLessonIndex = (lessonIndex || 1) - 1;
  const realLevelIndex = (levelIndex || 1) - 1;
  console.log(unit, realLessonIndex, level);

  const lesson = unit?.lessons[realLessonIndex];
  const levelInfo = lesson?.levels[realLevelIndex];
  const activitySection =
    levelInfo?.activitySectionIndex !== undefined
      ? lesson?.activitySections[levelInfo.activitySectionIndex]
      : undefined;

  // Register level types
  register(FrequencyAnalysisLab);

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
        {unit && level && (
          <ProgressNavigator
            unit={unit}
            lessonIndex={realLessonIndex}
            levelIndex={realLevelIndex}
          />
        )}
      </Header>
      {unit && level && (
        <UnitLevel activitySection={activitySection} level={level} />
      )}
    </div>
  );
}
