// Markup shared by every rendering of the sentence.

import React from 'react';

import styles from './word-menus.module.scss';

/** The pieces with the full stop kept on the last one's line. */
export function withPeriod(pieces: React.ReactNode[]): React.ReactNode {
  const last = pieces[pieces.length - 1];
  return (
    <>
      {pieces.slice(0, -1)}
      <span className={styles.keepTogether}>{last}.</span>
    </>
  );
}
