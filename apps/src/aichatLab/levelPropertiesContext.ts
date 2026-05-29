import {createContext, useContext} from 'react';

import {AichatLevelProperties} from './types';

export const LevelPropertiesContext =
  createContext<AichatLevelProperties | null>(null);

export const useLevelProperties = () => {
  const context = useContext(LevelPropertiesContext);
  if (context === null) {
    throw new Error('Level properties have not been provided!');
  }
  return context;
};
