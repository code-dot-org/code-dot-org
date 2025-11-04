import {createContext, useContext} from 'react';

import {BubbleChoiceLevelProperties} from '../../types';

export const ParentLevelPropertiesContext =
  createContext<BubbleChoiceLevelProperties | null>(null);

export function useParentLevelProperties() {
  return useContext(ParentLevelPropertiesContext);
}
