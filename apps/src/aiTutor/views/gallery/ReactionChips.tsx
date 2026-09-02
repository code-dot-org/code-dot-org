import {Reaction} from '@code-dot-org/lesson-deep-dive';
import React, {FC} from 'react';

import styles from './challenge-gallery.module.scss';

// Reaction names mapped to native emoji glyphs.
const EMOJI_GLYPHS: Record<string, string> = {
  clap: '👏',
  fire: '🔥',
  party: '🎉',
  smile: '😄',
  heart: '❤️',
  trophy: '🏆',
};

interface ReactionChipsProps {
  reactions: Reaction[];
}

// The row of emoji reaction chips on a gallery card. Renders nothing when
// there are no reactions.
const ReactionChips: FC<ReactionChipsProps> = ({reactions}) => {
  if (reactions.length === 0) {
    return null;
  }
  return (
    <div className={styles.reactions}>
      {reactions.map(reaction => (
        <span key={reaction.emoji} className={styles.chip}>
          <span aria-hidden="true">
            {EMOJI_GLYPHS[reaction.emoji] || reaction.emoji}
          </span>
          <span className={styles.count}>{reaction.count}</span>
        </span>
      ))}
    </div>
  );
};

export default ReactionChips;
