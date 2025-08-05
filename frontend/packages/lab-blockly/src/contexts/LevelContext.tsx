'use client';

import React, {PropsWithChildren, useState, createContext} from 'react';

import type {LevelData} from '@code-dot-org/models/levels';

export interface LevelContent {
  level?: LevelData;
  lessonIndex?: number;
  levelIndex?: number;
  hintsShown: number;
  setHintsShown: (value: number) => void;
}

const LevelContext = createContext<LevelContent>({
  hintsShown: 0,
  setHintsShown: (_: number) => {},
});

export interface LevelProviderProps extends PropsWithChildren {
  level?: LevelData;
  levelIndex?: number;
  lessonIndex?: number;
}

/**
 * This keeps track of the current level data.
 */
export const LevelProvider: React.FunctionComponent<LevelProviderProps> = ({
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

export default LevelContext;
