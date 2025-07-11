import classNames from 'classnames';
import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react';

import Typography from '@code-dot-org/component-library/typography';

import FrequencyLevelContext from '../contexts/FrequencyLevelContext';
import {FrequencyData} from '../types';

import moduleStyles from './frequencyLevel.module.scss';

/**
 * The different properties that the Letters component can be assigned.
 */
export interface LettersProps {
  frequencyData: FrequencyData;
  /** Whether or not the letters can be dragged */
  interactive?: boolean;
  /**
   * Whether or not this represents the available letters. When false,
   * and interactive is true, this represents the current cipher. When
   * letters are dragged from the source Letters component to this one,
   * they become activated in the cipher.
   */
  isSource?: boolean;
  /** The caption for these letters serving as a labelled description */
  caption: string;
  /**
   * A reference to pass-back a callback function to be called when the Graph layout is rendered.
   */
  setUpdater: (updater: () => void) => void;
  /** Callback for when the cipher data changes */
  onUpdate?: () => void;
}

/**
 * Represents the set of letters for the cipher widget.
 *
 * These generally appear under the bar graphs showing the frequency for which
 * the letters appear. These letters may be interactable and may either
 * represent the source letters (these are the unassigned letters) or they
 * represent the current state of the cipher.
 */
const Letters: React.FunctionComponent<LettersProps> = ({
  frequencyData,
  setUpdater,
  interactive,
  isSource,
  caption,
  onUpdate,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const itemPositions = useRef<{[key: string]: number}>({});
  const itemSourcePositions = useRef<number[]>({});
  const {selected, setSelected} = useContext(FrequencyLevelContext);

  console.log('letters', frequencyData.current.letters);

  const handleUpdate = useCallback(() => {
    if (ref.current) {
      const captionElement = ref.current.querySelector('span.caption');
      const letterElement = ref.current.querySelector('span.letter');
      const letterWidth = letterElement?.getBoundingClientRect().width || 0;

      const {cipher, positions} = frequencyData.current;

      const letters = isSource
        ? frequencyData.current.sourceLetters
        : frequencyData.current.letters;

      itemPositions.current = {};
      itemSourcePositions.current = {};

      // Position the caption that comes before the letter elements
      if (captionElement) {
        const letter = letters[0];
        const index = letters.findIndex(item => item === letter);
        const width = captionElement.getBoundingClientRect().width;
        console.log('caption position', letter, index, width);
        captionElement.style.left = `${(positions[index] || 0) - 10 - width - letterWidth / 2.0}px`;
      }

      // Position each letter element under the bar according to the positions array
      Array.from(ref.current.querySelectorAll('span.letter')).forEach(
        (span, i) => {
          const letter = frequencyData.current.alphabetical[i];
          const index = letters.findIndex(item => item === letter);
          if (!interactive) {
            console.log(letter, index, positions[index]);
          }
          const left = (positions[index] || 0) + 2 - letterWidth / 2.0;
          itemPositions.current[letter] = left;
          span.style.left = `${left}px`;
        },
      );

      if (interactive) {
        Array.from(ref.current.querySelectorAll('span.source')).forEach(
          (span, i) => {
            const letter = frequencyData.current.alphabetical[i];
            // For the source letter
            // Find the index of the mapped letter. For the source letters, this is
            // just the index if the letter is not in the cipher. If it is in the
            // cipher, we make the source letter invisible since it is in the middle
            // row instead.
            //
            // For that middle row (the committed cipher letters), we mark it as
            // visible only when it exists in the cipher.
            const mappedIndex = letters.findIndex(
              mapped => cipher.has(mapped) && cipher.get(mapped) === letter,
            );
            const encryptedIndex = isSource
              ? mappedIndex !== -1
                ? -1
                : i
              : mappedIndex;
            const left =
              (positions[encryptedIndex === -1 ? i : encryptedIndex] || 0) +
              2 -
              letterWidth / 2.0;
            const display = encryptedIndex !== -1 ? 'block' : 'none';
            itemSourcePositions.current[letter] = left;
            if (span.style.display !== display && display !== 'none') {
              // If we are turning this on, turn off the CSS animation momentarily
              span.style.transitionDuration = '0s';
              window.requestAnimationFrame(() => {
                span.style.transitionDuration = '';
              });
            }
            span.style.left = `${left}px`;
            span.style.display = display;
          },
        );
      }
    }
  }, [ref, isSource]);

  // In order to get an immediate signal that the positions of the bars have changed
  // due to a resize, we assign a reference to the update callback to the parent
  // component. It will call this to let us know to update our own layout.
  useEffect(() => {
    if (setUpdater) {
      // Set the outgoing reference to our updater method
      setUpdater(handleUpdate);
    }
  }, [handleUpdate, setUpdater]);

  const {cipher} = frequencyData.current;

  const letters = frequencyData.current.alphabetical;

  return useMemo(
    () => (
      <div className={moduleStyles.letters} ref={ref}>
        <Typography
          semanticTag="span"
          visualAppearance="body-four"
          className={classNames('caption', moduleStyles.caption)}
        >
          {caption}
        </Typography>
        {letters.map((letter, i) => {
          // The space is empty if it is the source and the cipher for that letter is
          // used, or if it is the cipher space (not the source) then it is empty when
          // there is no assigned letter in the cipher.

          // The base letter showing the space where the letter can be placed
          return (
            <Typography
              className={classNames(
                'letter',
                moduleStyles.letter,
                moduleStyles.empty,
                interactive
                  ? moduleStyles.interactive
                  : moduleStyles.uninteractive,
              )}
              semanticTag="span"
              visualAppearance="body-two"
              key={`base-letter-${i}`}
              data-letter={letter}
              data-notranslate
              style={{
                left: itemPositions.current[letter],
              }}
              onClick={() => {
                if (interactive && selected) {
                  const mapped = letters.find(
                    mapped =>
                      cipher.has(mapped) && cipher.get(mapped) === selected,
                  );
                  if (mapped) {
                    cipher.delete(mapped);
                    cipher.delete(mapped.toLowerCase());
                  }
                  if (!isSource) {
                    // Set the cipher
                    cipher.set(letter, selected);
                    cipher.set(letter.toLowerCase(), selected.toLowerCase());
                  }
                  setSelected(undefined);
                  handleUpdate();
                  if (onUpdate) {
                    onUpdate();
                  }
                }
              }}
            >
              {letter}
            </Typography>
          );
        })}
        {interactive &&
          letters.map((letter, i) => {
            //const mapped = letters.find(mapped => cipher.has(mapped) && cipher.get(mapped) === letter);

            // The filled in letter
            return (
              <Typography
                className={classNames(
                  'source',
                  selected === letter ? moduleStyles.selected : undefined,
                  moduleStyles.letter,
                  moduleStyles.interactive,
                  moduleStyles.source,
                )}
                semanticTag="span"
                visualAppearance="body-two"
                key={`letter-${i}`}
                data-letter={letter}
                data-notranslate
                style={{
                  left: itemSourcePositions.current[letter],
                  display: 'none',
                }}
                onClick={() => {
                  if (selected) {
                    // Swap them
                    const mapped = letters.find(
                      mapped =>
                        cipher.has(mapped) && cipher.get(mapped) === selected,
                    );
                    const mappedTo = letters.find(
                      mapped =>
                        cipher.has(mapped) && cipher.get(mapped) === letter,
                    );
                    if (mapped) {
                      // Swap mapped letters
                      cipher.set(mapped, letter);
                      cipher.set(mapped.toLowerCase(), letter.toLowerCase());
                    }

                    if (mappedTo) {
                      cipher.set(mappedTo, selected);
                      cipher.set(
                        mappedTo.toLowerCase(),
                        selected.toLowerCase(),
                      );
                    }

                    setSelected(undefined);
                    handleUpdate();
                    if (onUpdate) {
                      onUpdate();
                    }
                  } else {
                    setSelected(isSource ? letter : letter);
                  }
                }}
              >
                {letter}
              </Typography>
            );
          })}
      </div>
    ),
    [caption, selected],
  );
};

export default Letters;
