import {createContext, useContext} from 'react';

import BackpackClientApi from './BackpackClientApi';

export type BackpackContextType = BackpackClientApi;

export const BackpackAPIContext = createContext<BackpackContextType | null>(
  null
);

export const useBackpackAPIContext = () => {
  const context = useContext(BackpackAPIContext);
  if (context === null) {
    throw new Error('Backpack API Context has not been provided!');
  }
  return context;
};
