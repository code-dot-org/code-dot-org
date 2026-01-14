import {createContext, useContext} from 'react';

import BackpackClientApi from './BackpackClientApi';

export type BackpackContextType = BackpackClientApi;

export const BackpackAPIContext = createContext<BackpackContextType | null>(
  null
);

export const useBackpackAPIContext = () => {
  return useContext(BackpackAPIContext);
};
