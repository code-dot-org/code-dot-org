// Markup shared by every rendering of the sentence.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {Sentence, Word} from './sentences';
import {hueFor} from './wordHues';

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

/** The class that gives a slot's color to whatever wears it. */
export function hueClass(sentence: Sentence, slotId: string): string {
  return styles[`hue_${hueFor(sentence, slotId)}`];
}

/** A word's icon, or its color as a dot, then the word. */
export const WordText: React.FunctionComponent<{word: Word}> = ({word}) => (
  <>
    {word.color ? (
      <span
        className={styles.colorDot}
        style={{backgroundColor: word.color}}
        aria-hidden
      />
    ) : (
      word.icon && (
        <FontAwesomeV6Icon
          iconName={word.icon}
          className={styles.wordIcon}
          aria-hidden
        />
      )
    )}
    {word.text}
  </>
);

interface WordChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  sentence: Sentence;
  slotId: string;
  /** The chip's contents; the word itself by default. */
  children?: React.ReactNode;
}

/** A chosen word in the sentence, in its slot's color. */
export const WordChip: React.FunctionComponent<WordChipProps> = ({
  sentence,
  slotId,
  className,
  children,
  ...rest
}) => (
  <span
    className={classNames(styles.chip, hueClass(sentence, slotId), className)}
    {...rest}
  >
    {children}
  </span>
);
