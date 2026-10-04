// Markup shared by every rendering of the sentence.

import React from 'react';

import styles from './word-menus.module.scss';

/** The sentence's pieces with the full stop glued to the last one, so a
    line never ends with a chip and starts with a lone period. */
export function withPeriod(pieces: React.ReactNode[]): React.ReactNode {
  const last = pieces[pieces.length - 1];
  return (
    <>
      {pieces.slice(0, -1)}
      <span className={styles.keepTogether}>{last}.</span>
    </>
  );
}
