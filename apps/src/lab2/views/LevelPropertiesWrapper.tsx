import React, {createContext} from 'react';

import useRequiredContext from '@cdo/apps/util/hooks/useRequiredContext';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {LevelProperties} from '../types';

interface LevelPropertiesWrapperProps {
  levelPropertiesMap: {[levelId: string]: LevelProperties};
  children: React.ReactNode;
}

type LevelPropertiesContextType = {
  levelProperties: LevelProperties;
  levelPropertiesMap: {[levelId: string]: LevelProperties};
};
const LevelPropertiesContext = createContext<LevelPropertiesContextType | null>(
  null
);
/** Provides the current level's level properties and the map of all level properties. */
export const useLevelProperties = () =>
  useRequiredContext(LevelPropertiesContext, 'LevelPropertiesContext');

const LevelPropertiesWrapper: React.FC<LevelPropertiesWrapperProps> = ({
  levelPropertiesMap,
  children,
}) => {
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const levelProperties = currentLevelId
    ? levelPropertiesMap[currentLevelId]
    : null;

  if (!levelProperties) {
    throw new Error('Invalid state: no level ID or missing level properties');
  }

  return (
    <LevelPropertiesContext.Provider
      value={{levelProperties, levelPropertiesMap}}
    >
      {children}
    </LevelPropertiesContext.Provider>
  );
};

export default LevelPropertiesWrapper;
