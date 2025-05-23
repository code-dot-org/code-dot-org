import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import classNames from 'classnames';
import React from 'react';

import {COLORS, EMOJIS} from './avatarConstants';

import styles from './section-avatars.module.scss';

interface SectonAvatarProps {
  color: number;
  emoji: number;
  size: ComponentSizeXSToL;
}

const SectionAvatar: React.FC<SectonAvatarProps> = ({color, emoji, size}) => {
  return (
    <div
      className={classNames(
        styles.sectionAvatar,
        styles[`sectionAvatar-${size}`]
      )}
      style={{backgroundColor: COLORS[color]}}
    >
      {EMOJIS[emoji]}
    </div>
  );
};

export default SectionAvatar;
