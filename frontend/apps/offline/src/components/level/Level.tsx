'use client';

import React from 'react';

import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import LevelProvider from '@/providers/LevelProvider';

import MazeLevel from './mazeLevel';
import StandaloneVideoLevel from './standaloneVideoLevel';

const spinnerIcon: FontAwesomeV6IconProps = {
  iconName: 'spinner',
  iconStyle: 'solid',
  animationType: 'spin',
};

export interface LevelProps {
  levelData: object;
}

/**
 * Represents a generic Code.org level (learning activity).
 */
const Level: React.FunctionComponent<LevelProps> = ({levelData}) => (
  <LevelProvider>
    <div
      style={{
        flex: '1 1 100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!levelData && (
        <FontAwesomeV6Icon {...spinnerIcon} style={{fontSize: '3rem'}} />
      )}
      {levelData?.type === 'Maze' && <MazeLevel levelData={levelData} />}
      {levelData?.type === 'StandaloneVideo' && (
        <StandaloneVideoLevel levelData={levelData} />
      )}
    </div>
  </LevelProvider>
);

export default Level;
