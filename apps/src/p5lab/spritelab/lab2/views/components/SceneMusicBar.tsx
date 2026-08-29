import React from 'react';

import MusicProjectBar from '@cdo/apps/music/views/MusicProjectBar';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface SceneMusicBarProps {
  title: string;
  isLoading: boolean;
}

/** The song a playing game is using, shown in the tab bar. */
const SceneMusicBar: React.FunctionComponent<SceneMusicBarProps> = ({
  title,
  isLoading,
}) => (
  <MusicProjectBar
    title={title}
    isLoading={isLoading}
    className={moduleStyles.musicBar}
  />
);

export default SceneMusicBar;
