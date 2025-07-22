'use client';

import React from 'react';

import type {LevelData} from '@/app/models/level';
import type {ActivitySectionData} from '@/app/models/unit';

import ArtistLevel from '../artist';
import FrequencyLevel from '../frequency';
import KarelLevel from '../karel';
import MazeLevel from '../maze';
import PanelsLevel from '../panels';
import SpriteLabLevel from '../spriteLab';
import StandaloneVideoLevel from '../standaloneVideo';
import StarWarsLevel from '../starWars';

import Spinner from './Spinner';

import moduleStyles from './level.module.scss';

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
  <div className={moduleStyles.level}>
    {!level && <Spinner />}
    {level?.type === 'Maze' && <MazeLevel level={level} />}
    {level?.type === 'Karel' && <KarelLevel level={level} />}
    {level?.type === 'Artist' && <ArtistLevel level={level} />}
    {level?.type === 'GamelabJr' && <SpriteLabLevel level={level} />}
    {level?.type === 'StarWarsGrid' && <StarWarsLevel level={level} />}
    {level?.type === 'StandaloneVideo' && (
      <StandaloneVideoLevel activitySection={activitySection} level={level} />
    )}
    {level?.type === 'Panels' && <PanelsLevel level={level} />}
    {level?.type === 'FrequencyAnalysis' && <FrequencyLevel level={level} />}
  </div>
);

export default Level;
