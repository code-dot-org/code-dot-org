import React from 'react';

import {COLORS, EMOJIS} from './avatarConstants';

import styles from './section-avatars.module.scss';

interface SectonAvatarProps {
  color: number;
  emoji: number;
  size: 's' | 'l' | 'xl';
}

const SectionAvatar: React.FC<SectonAvatarProps> = ({color, emoji, size}) => {
  return (
    <div
      className={
        size === 's'
          ? styles.sectionAvatarSmall
          : size === 'l'
          ? styles.sectionAvatarLarge
          : styles.sectionAvatarXL
      }
      style={{backgroundColor: COLORS[color]}}
    >
      {EMOJIS[emoji]}
    </div>
  );
};

export default SectionAvatar;
