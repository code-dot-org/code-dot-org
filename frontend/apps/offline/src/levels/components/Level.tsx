import React from 'react';

import type {LevelData} from '@/app/models/level';
import type {ActivitySectionData} from '@/app/models/unit';

import levelRegistry from '../registry';

import Spinner from './Spinner';

import moduleStyles from './level.module.scss';

export interface LevelProps {
  activitySection?: ActivitySectionData;
  level: LevelData;
}

/**
 * Represents a generic Code.org level (learning activity).
 */
const Level: React.FunctionComponent<LevelProps> = ({level}) => (
  <div className={moduleStyles.level}>
    {!level && <Spinner />}
    {level && level.type in levelRegistry && (
      <>
        {React.createElement(levelRegistry[level.type].default, {
          levelData: level.data,
        })}
      </>
    )}
    {level && !(level.type in levelRegistry) && (
      <div>
        No level rendererd registered for '<code>{level.type}</code>'.
      </div>
    )}
  </div>
);

export default Level;
