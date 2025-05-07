import {createContext} from 'react';

import {LevelData} from '@/app/models/level';

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

export default LevelContext;
