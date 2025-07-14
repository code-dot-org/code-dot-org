'use client';

import React from 'react';

import type {LevelData} from '@/app/models/level';
import type {ActivitySectionData} from '@/app/models/unit';
import Level from '@/levels';

export interface UnitLevelProps {
  activitySection?: ActivitySectionData;
  level: LevelData;
}

const UnitLevel: React.FunctionComponent<UnitLevelProps> = ({
  activitySection,
  level,
}) => <Level activitySection={activitySection} level={level} />;

export default UnitLevel;
