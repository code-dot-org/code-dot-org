'use client';

import React, {PropsWithChildren, useState} from 'react';

import type {LevelData} from '@/app/models/level';
import LevelContext from '@/contexts/LevelContext';

export interface LevelProviderProps extends PropsWithChildren {
  level?: LevelData;
  levelIndex?: number;
  lessonIndex?: number;
}

/**
 * This keeps track of the current level data.
 */
const LevelProvider: React.FunctionComponent<LevelProviderProps> = ({
  level,
  levelIndex,
  lessonIndex,
  children,
}) => {
  // Hints can be revealed by incrementing the hint shown count
  const [hintsShown, setHintsShown] = useState<number>(0);

  return (
    <LevelContext.Provider
      value={{
        level,
        levelIndex,
        lessonIndex,
        hintsShown,
        setHintsShown,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};

export default LevelProvider;
