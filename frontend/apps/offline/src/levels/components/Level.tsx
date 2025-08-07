'use client';

import dynamic from 'next/dynamic';
import React, {useMemo} from 'react';

import type {ActivitySectionData} from '@code-dot-org/models/activitySections';
import type {LevelData} from '@code-dot-org/models/levels';

import Spinner from './Spinner';

/**
 * A map of level types and their implementing packages.
 */
const levelMap: {
  [key: string]: React.ComponentType<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    levelData: LevelData<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }>;
} = {
  /** Navigation karels that use a small colorful grid */
  Maze: dynamic(() => import('@code-dot-org/lab-maze'), {ssr: false, loading: () => <Spinner />}),
  /** Cipher analysis exhibiting the weaknesses of symmetric encryption */
  FrequencyAnalysis: dynamic(() => import('@code-dot-org/lab-frequency-analysis'), {ssr: false, loading: () => <Spinner />}),
  /** A turtle karel that can draw shapes and lines based on code */
  Artist: dynamic(() => import('@code-dot-org/lab-artist'), {ssr: false, loading: () => <Spinner />}),
  /** Collector levels which are maze levels where there is an added element of collecting as you go */
  Karel: dynamic(() => import('@code-dot-org/lab-karel'), {ssr: false, loading: () => <Spinner />}),
  /** Video player */
  StandaloneVideo: dynamic(() => import('@code-dot-org/lab-standalone-video'), {ssr: false, loading: () => <Spinner />}),
  /** Minecraft levels */
  Craft: dynamic(() => import('@code-dot-org/lab-craft'), {ssr: false, loading: () => <Spinner />}),
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
