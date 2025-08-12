'use client';

import React from 'react';

import type {ActivitySection} from '@code-dot-org/models/activitySections';
import type {Level as LevelData} from '@code-dot-org/models/levels';

import Level from '@/levels';

export interface UnitLevelProps {
  activitySection?: ActivitySection;
  level: LevelData;
}

const UnitLevel: React.FunctionComponent<UnitLevelProps> = ({
  activitySection,
  level,
}) => <Level activitySection={activitySection} level={level} />;

export default UnitLevel;
