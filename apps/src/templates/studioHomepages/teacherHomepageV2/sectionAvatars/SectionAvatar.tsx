import React from 'react';

import {COLORS, EMOJIS, COLOR_LABELS, EMOJI_LABELS} from './avatarConstants';

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
      aria-label={`${COLOR_LABELS[color]}, ${EMOJI_LABELS[emoji]}`}
      title={`${COLOR_LABELS[color]}, ${EMOJI_LABELS[emoji]}`}
      role="img"
    >
      {EMOJIS[emoji]}
    </div>
  );
};

export default SectionAvatar;
