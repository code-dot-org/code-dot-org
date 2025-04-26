import {createContext} from 'react';

export interface LevelContent {
  hintsShown: number;
  setHintsShown: (value: number) => void;
}

const LevelContext = createContext<LevelContent>({
  hintsShown: 0,
  setHintsShown: (_: number) => {},
});

export default LevelContext;
