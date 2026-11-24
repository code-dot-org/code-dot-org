import {Button as MuiButton, IconButton} from '@mui/material';
import {type FC, useCallback, useMemo, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './vocabulary-flashcards.module.scss';

export type VocabularyItem = {id: string; word: string; definition: string};

interface VocabularyFlashcardsProps {
  vocabulary: VocabularyItem[];
}

const VocabularyFlashcards: FC<VocabularyFlashcardsProps> = ({vocabulary}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const currentCard = useMemo(
    () => vocabulary[currentIndex],
    [currentIndex, vocabulary],
  );

  const goTo = useCallback(
    (nextIndex: number) => {
      setIsFlipped(false);
      setCurrentIndex(nextIndex);
      setAnnouncement(
        `Card ${nextIndex + 1} of ${vocabulary.length}: ${vocabulary[nextIndex].word}`,
      );
    },
    [vocabulary],
  );

  const goPrev = useCallback(() => {
    goTo((currentIndex - 1 + vocabulary.length) % vocabulary.length);
  }, [currentIndex, vocabulary.length, goTo]);

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % vocabulary.length);
  }, [currentIndex, vocabulary.length, goTo]);

  const flip = useCallback(() => {
    const flipped = !isFlipped;
    setIsFlipped(flipped);
    setAnnouncement(
      flipped
        ? `Definition: ${currentCard.definition}`
        : `Term: ${currentCard.word}`,
    );
  }, [isFlipped, currentCard]);

  if (vocabulary.length === 0) {
    return <p className={styles.emptyState}>No vocabulary available.</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <p className={styles.overline}>Flashcards</p>
        <span className={styles.counter}>
          Card {currentIndex + 1} of {vocabulary.length}
        </span>
      </div>

      {/* The "Flip card" button also flips the card, and it accepts the
          keyboard. A button element here would change the DOM. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={styles.cardStack} onClick={flip}>
        <div className={styles.cardBehind2} />
        <div className={styles.cardBehind1} />
        <div className={styles.cardViewport}>
          <div
            className={`${styles.cardInner} ${
              isFlipped ? styles.cardInnerFlipped : ''
            }`}
          >
            {/* backface-visibility hides the far face from sight only. */}
            <div className={styles.cardFace} aria-hidden={isFlipped}>
              <p className={styles.cardLabel}>Term</p>
              <p className={styles.cardWord}>{currentCard.word}</p>
              <p className={styles.flipHint}>Tap to see definition</p>
            </div>
            <div
              className={`${styles.cardFace} ${styles.cardBack}`}
              aria-hidden={!isFlipped}
            >
              <p className={styles.cardLabel}>Definition</p>
              <p className={styles.cardDefinition}>{currentCard.definition}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.visuallyHidden} role="status">
        {announcement}
      </div>

      <div className={styles.controls}>
        <IconButton
          variant="outlined"
          color="secondary"
          size="medium"
          onClick={goPrev}
          disabled={vocabulary.length <= 1}
          aria-label="Previous card"
        >
          <FontAwesomeV6Icon iconName="arrow-left" />
        </IconButton>
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          className={styles.flipButton}
          onClick={flip}
          aria-label="Flip card"
        >
          Flip
        </MuiButton>
        <IconButton
          variant="outlined"
          color="secondary"
          size="medium"
          onClick={goNext}
          disabled={vocabulary.length <= 1}
          aria-label="Next card"
        >
          <FontAwesomeV6Icon iconName="arrow-right" />
        </IconButton>
      </div>
    </div>
  );
};

export default VocabularyFlashcards;
