import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useCallback, useMemo, useState} from 'react';

import styles from './vocabulary-flashcards.module.scss';

type VocabularyItem = {id: string; word: string; definition: string};

interface VocabularyFlashcardsProps {
  vocabulary: VocabularyItem[];
}

const VocabularyFlashcards: FC<VocabularyFlashcardsProps> = ({vocabulary}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = useMemo(
    () => vocabulary[currentIndex],
    [currentIndex, vocabulary]
  );

  const goTo = useCallback((nextIndex: number) => {
    setIsFlipped(false);
    setCurrentIndex(nextIndex);
  }, []);

  const goPrev = useCallback(() => {
    goTo((currentIndex - 1 + vocabulary.length) % vocabulary.length);
  }, [currentIndex, vocabulary.length, goTo]);

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % vocabulary.length);
  }, [currentIndex, vocabulary.length, goTo]);

  const flip = useCallback(() => setIsFlipped(f => !f), []);

  if (vocabulary.length === 0) {
    return <p style={{color: '#d4dae1'}}>No vocabulary available.</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <p className={styles.overline}>Flashcards</p>
        <span className={styles.counter}>
          Card {currentIndex + 1} of {vocabulary.length}
        </span>
      </div>

      <div className={styles.cardStack} onClick={flip}>
        <div className={styles.cardBehind2} />
        <div className={styles.cardBehind1} />
        <div className={styles.cardViewport}>
          <div
            className={`${styles.cardInner} ${
              isFlipped ? styles.cardInnerFlipped : ''
            }`}
          >
            <div className={styles.cardFace}>
              <p className={styles.cardLabel}>Term</p>
              <p className={styles.cardWord}>{currentCard.word}</p>
              <p className={styles.flipHint}>Tap to see definition</p>
            </div>
            <div className={`${styles.cardFace} ${styles.cardBack}`}>
              <p className={styles.cardLabel}>Definition</p>
              <p className={styles.cardDefinition}>{currentCard.definition}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={goPrev}
          disabled={vocabulary.length <= 1}
          aria-label="Previous card"
        >
          <FontAwesomeV6Icon iconName="arrow-left" />
        </button>
        <button
          type="button"
          className={styles.flipButton}
          onClick={flip}
          aria-label="Flip card"
        >
          Flip
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={goNext}
          disabled={vocabulary.length <= 1}
          aria-label="Next card"
        >
          <FontAwesomeV6Icon iconName="arrow-right" />
        </button>
      </div>
    </div>
  );
};

export default VocabularyFlashcards;
