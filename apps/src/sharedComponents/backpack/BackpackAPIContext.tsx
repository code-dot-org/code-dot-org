import {createContext, useContext} from 'react';

import BackpackClientApi from './BackpackClientApi';

// If a lab supports the backpack, it at a minimum needs a primary api
// (generally, the API for that lab type). Some labs (Web Lab 2, for example)
// also support importing files from other backpacks. The secondaryApi object is a map
// from lab type (such as Sketch Lab) to the backpack api for that lab.
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
