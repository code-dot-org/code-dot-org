import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

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
  <div className={moduleStyles.musicBar}>
    <FontAwesomeV6Icon
      iconStyle="solid"
      iconName={isLoading ? 'spinner' : 'music'}
      animationType={isLoading ? 'spin' : undefined}
    />
    <span className={moduleStyles.musicBarTitle}>{title}</span>
  </div>
);

export default SceneMusicBar;
