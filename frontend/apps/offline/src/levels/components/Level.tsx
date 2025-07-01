'use client';

import React from 'react';

import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {LevelData} from '@/app/models/level';
import type {ActivitySectionData} from '@/app/models/unit';

import ArtistLevel from '../artist';
import CraftLevel from '../craft';
import KarelLevel from '../karel';
import MazeLevel from '../maze';
import PanelsLevel from '../panels';
import SpriteLabLevel from '../spriteLab';
import StandaloneVideoLevel from '../standaloneVideo';
import StarWarsLevel from '../starWars';

const spinnerIcon: FontAwesomeV6IconProps = {
  iconName: 'spinner',
  iconStyle: 'solid',
  animationType: 'spin',
};

export interface LevelProps {
  activitySection?: ActivitySectionData;
  level: LevelData;
}

/**
 * Represents a generic Code.org level (learning activity).
 */
const Level: React.FunctionComponent<LevelProps> = ({
  activitySection,
  level,
}) => (
  <div
    style={{
      flex: '1 1 100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {!level && (
      <FontAwesomeV6Icon {...spinnerIcon} style={{fontSize: '3rem'}} />
    )}
    {level?.type === 'Maze' && <MazeLevel level={level} />}
    {level?.type === 'Karel' && <KarelLevel level={level} />}
    {level?.type === 'Artist' && <ArtistLevel level={level} />}
    {level?.type === 'Craft' && <CraftLevel level={level} />}
    {level?.type === 'GamelabJr' && <SpriteLabLevel level={level} />}
    {level?.type === 'StarWarsGrid' && <StarWarsLevel level={level} />}
    {level?.type === 'StandaloneVideo' && (
      <StandaloneVideoLevel activitySection={activitySection} level={level} />
    )}
    {level?.type === 'Panels' && <PanelsLevel level={level} />}
  </div>
);

export default Level;
