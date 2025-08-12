import {createContext} from 'react';

import {Level} from '@code-dot-org/models/levels';

export interface LevelContent {
  level?: Level;
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
