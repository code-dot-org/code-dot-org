import React, {FC} from 'react';

import {Reaction} from './types';

import styles from './reaction-chips.module.scss';

// Native glyphs stand in for the design's custom emoji SVGs until the
// reactions backend exists (the Figma exports are hosted on expiring URLs,
// so they cannot be committed by reference).
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
// there are no reactions — which, with no reactions backend yet, is always.
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
