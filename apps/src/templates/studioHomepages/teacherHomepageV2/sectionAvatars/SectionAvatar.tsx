import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import classNames from 'classnames';
import React from 'react';

import {COLORS, EMOJIS, COLOR_LABELS, EMOJI_LABELS} from './avatarConstants';

import styles from './section-avatars.module.scss';

interface SectonAvatarProps {
  color: number;
  emoji: number;
  size: ComponentSizeXSToL;
}

const SectionAvatar: React.FC<SectonAvatarProps> = ({color, emoji, size}) => {
  const safeColor = color >= 0 && color < COLORS.length ? color : 0;
  const safeEmoji = emoji >= 0 && emoji < EMOJIS.length ? emoji : 0;
  return (
    <div
      className={classNames(
        styles.sectionAvatar,
        styles[`sectionAvatar-${size}`]
      )}
      style={{backgroundColor: COLORS[safeColor]}}
      aria-label={`${COLOR_LABELS[safeColor]}, ${EMOJI_LABELS[safeEmoji]}`}
      title={`${COLOR_LABELS[safeColor]} ${EMOJI_LABELS[safeEmoji]}`}
      role="img"
    >
      {EMOJIS[safeEmoji]}
    </div>
  );
};

export default SectionAvatar;
