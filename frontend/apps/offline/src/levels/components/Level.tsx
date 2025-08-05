'use client';

import dynamic from 'next/dynamic';
import React, {useMemo} from 'react';

import type {LevelData} from '@/app/models/level';
import type {ActivitySectionData} from '@/app/models/unit';

import Spinner from './Spinner';

/**
 * A map of level types and their implementing packages.
 */
const levelMap = {
  /** Navigation karels that use a small colorful grid */
  Maze: dynamic(() => import('@code-dot-org/lab-maze'), {ssr: false, loading: () => <Spinner />}),
  /** Cipher analysis exhibiting the weaknesses of symmetric encryption */
  FrequencyAnalysis: dynamic(() => import('@code-dot-org/lab-frequency-analysis'), {ssr: false, loading: () => <Spinner />}),
};

import moduleStyles from './level.module.scss';

export interface LevelProps {
  activitySection?: ActivitySectionData;
  level: LevelData;
}

/**
 * Represents a generic Code.org level (learning activity).
 */
const Level: React.FunctionComponent<LevelProps> = ({level}) => {
  const Renderer = useMemo(() => (level?.type in levelMap) ? levelMap[level.type] : undefined, [level]);

  return (
    <div className={moduleStyles.level}>
      {!level && <Spinner />}
      {(level && Renderer) && (
        <Renderer
          levelData={level}
        />
      )}
      {level && !(level.type in levelMap) && (
        <div>
          No level renderer registered for '<code>{level.type}</code>'.
        </div>
      )}
    </div>
  );
};

export default Level;
