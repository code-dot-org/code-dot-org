import {createContext, useContext} from 'react';

import BackpackClientApi from './BackpackClientApi';

export interface BackpackContextType {
  primaryApi: BackpackClientApi;
  secondaryApis?: {[key: string]: BackpackClientApi};
}

export const BackpackAPIContext = createContext<BackpackContextType | null>(
  null
);

export const useBackpackAPIContext = () => {
  return useContext(BackpackAPIContext);
};
