import classNames from 'classnames';
import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useContext,
  MutableRefObject,
} from 'react';
import Draggable from 'react-draggable';

import Typography from '@code-dot-org/component-library/typography';

import LabFrequencyAnalysisContext from '../contexts/LabFrequencyAnalysisContext';
import {FrequencyData} from '../types';

import Spinner from './Spinner';

import moduleStyles from './frequencyLevel.module.scss';

/**
 * The different properties that the Letters component can be assigned.
 */
export interface LettersProps {
  frequencyData: MutableRefObject<FrequencyData>;
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

export interface LetterProps {
  isSource: boolean;
  itemSourcePositions: MutableRefObject<{[key: string]: number}>;
  itemSourceVisibility: MutableRefObject<{[key: string]: boolean}>;
  letter: string;
  i: number;
  handleUpdate: () => void;
  onUpdate?: () => void;
}

const Letter: React.FunctionComponent<LetterProps> = ({
  isSource,
  itemSourcePositions,
  itemSourceVisibility,
  letter,
  i,
  onUpdate,
  handleUpdate,
}) => {
  const nodeRef = useRef<HTMLElement | null>(null);
  const {selected, setSelected, mapLetter, swapMapping, clearMapping} =
    useContext(LabFrequencyAnalysisContext);

  const handleClick = useCallback(() => {
    if (selected) {
      swapMapping(selected, letter);

      setSelected(undefined);
      handleUpdate();
      if (onUpdate) {
        onUpdate();
      }
    } else {
      setSelected(isSource ? letter : letter);
    }
  }, [selected, setSelected, letter, handleUpdate, onUpdate, isSource]);

  return (
    <Draggable
      key={`letter-${i}`}
      position={{
        x: 0,
        y: 0,
      }}
      nodeRef={nodeRef}
      onStart={() => {
        handleClick();

        if (nodeRef.current) {
          nodeRef.current.style.zIndex = '999';
        }
      }}
      onDrag={(_, info) => {
        // If we achieve a solid drag distance, cancel the selection
        if (
          Math.pow(Math.abs(info.x), 2) + Math.pow(Math.abs(info.y), 2) >
          10
        ) {
          setSelected(undefined);
        }
      }}
      onStop={event => {
        if (nodeRef.current) {
          nodeRef.current.style.top = '';
          nodeRef.current.style.transform = '';
          nodeRef.current.style.zIndex = '';

          // Determine if there is a letter underneath us
          const x = (event instanceof TouchEvent)
            ? event.changedTouches?.[0]?.pageX
            : (event as MouseEvent).pageX;
          const y = (event instanceof TouchEvent)
            ? event.changedTouches?.[0]?.pageY
            : (event as MouseEvent).pageY;
          const baseEl =
            !isNaN(x) && !isNaN(y)
              ? window.document.elementFromPoint(x, y)
              : undefined;

          const el = (baseEl && baseEl.classList.contains('letter')) ? baseEl : baseEl?.parentNode as (HTMLElement | undefined);

          // Determine what the letter is we have dragged ourselves to and
          // what type it is and act accordingly
          if (el && el.classList.contains('letter')) {
            // We dragged ourselves onto another source letter when true
            const sourceLetter = el.classList.contains('source');

            // We dragged ourselves onto the source 'space' of letters (the bottom row)
            // when true
            const targetIsSource = el.hasAttribute('data-is-source');

            const targetLetter = el.getAttribute('data-letter') || '';

            if (sourceLetter) {
              // We want to swap mappings in this case
              swapMapping(targetLetter, letter);
            } else if (targetIsSource) {
              // We have moved over the blank in our unassigned row
              // This means we clear this mapping
              clearMapping(letter);
            } else {
              // This is a blank letter, we just 'set' it
              mapLetter(targetLetter, letter);
            }

            handleUpdate();
            if (onUpdate) {
              onUpdate();
            }
          }
        }
      }}
    >
      <span
        className={classNames(
          'letter',
          'source',
          selected === letter ? moduleStyles.selected : undefined,
          moduleStyles.letter,
          moduleStyles.interactive,
          moduleStyles.source,
        )}
        data-is-source={isSource}
        data-is-interactive
        ref={nodeRef}
        data-letter={letter}
        data-notranslate
        style={{
          left: itemSourcePositions.current[letter],
          display: itemSourceVisibility.current[letter] ? '' : 'none',
        }}
      >
        <Typography
          semanticTag="span"
          visualAppearance="body-two"
        >
          {letter}
        </Typography>
      </span>
    </Draggable>
  );
};

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
  const itemSourcePositions = useRef<{[key: string]: number}>({});
  const itemSourceVisibility = useRef<{[key: string]: boolean}>({});
  const {selected, setSelected} = useContext(LabFrequencyAnalysisContext);
  const [visible, setVisible] = useState<boolean>(false);

  const handleUpdate = useCallback(() => {
    if (!visible) {
      // Show the letters now that we have rendered something
      // This same function will be called on the next render
      // so that the letter spans are actually there to move around
      setVisible(true);
    } else if (ref.current) {
      const letterElement = ref.current.querySelector('span.letter');
      const letterWidth = letterElement?.getBoundingClientRect().width || 0;

      const {cipher, positions} = frequencyData.current;

      const letters = isSource
        ? frequencyData.current.sourceLetters
        : frequencyData.current.letters;

      itemPositions.current = {};
      itemSourcePositions.current = {};

      for (const letter of frequencyData.current.alphabetical) {
        const index = letters.findIndex(item => item === letter);
        const left = (positions[index] || 0) + 2 - letterWidth / 2.0;
        itemPositions.current[letter] = left;
      }

      frequencyData.current.alphabetical.forEach((letter, i) => {
        // For the source letter:
        //
        // Find the index of the mapped letter. For the source letters, this is
        // just the index if the letter is not in the cipher. This is affect by
        // sourceLetters. If it is in the cipher, we make the source letter
        // invisible since it is in the middle row instead.
        //
        // For that middle row (the committed cipher letters), we mark it as
        // visible only when it exists in the cipher.
        const mappedIndex = letters.findIndex(
          mapped => cipher.has(mapped) && cipher.get(mapped) === letter,
        );

        const encryptedIndex = isSource
          ? mappedIndex !== -1
            ? -1
            : letters.indexOf(letter)
          : mappedIndex;

        const left =
          (positions[encryptedIndex === -1 ? i : encryptedIndex] || 0) +
          2 -
          letterWidth / 2.0;

        const visible = encryptedIndex !== -1 ? true : false;

        itemSourcePositions.current[letter] = left;
        itemSourceVisibility.current[letter] = visible;
      });

      // Position each letter element under the bar according to the positions array
      (Array.from(ref.current.querySelectorAll('span.letter')) as HTMLElement[]).forEach(
        (span, i) => {
          const letter = frequencyData.current.alphabetical[i];
          const left = itemPositions.current[letter];
          span.style.left = `${left}px`;
        },
      );

      if (interactive) {
        (Array.from(ref.current.querySelectorAll('span.source')) as HTMLElement[]).forEach(
          (span, i) => {
            const letter = frequencyData.current.alphabetical[i];
            const left = itemSourcePositions.current[letter];
            const display = itemSourceVisibility.current[letter]
              ? 'block'
              : 'none';

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
  }, [visible, ref, isSource]);

  // In order to get an immediate signal that the positions of the bars have changed
  // due to a resize, we assign a reference to the update callback to the parent
  // component. It will call this to let us know to update our own layout.
  useEffect(() => {
    if (setUpdater) {
      // Set the outgoing reference to our updater method
      setUpdater(handleUpdate);
    }
  }, [ref, handleUpdate, setUpdater]);

  useEffect(() => {
    if (visible) {
      handleUpdate();
    }
  }, [visible, handleUpdate]);

  const {alphabetical: letters} = frequencyData.current;

  const handleClick = useCallback(
    (letter: string) => {
      const {cipher, alphabetical: letters} = frequencyData.current;

      if (interactive && selected) {
        const mapped = letters.find(
          mapped => cipher.has(mapped) && cipher.get(mapped) === selected,
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
    },
    [interactive, selected, setSelected, handleUpdate, onUpdate, frequencyData],
  );

  return useMemo(
    () => (
      <div
        className={classNames(moduleStyles.animate, moduleStyles.letters)}
        ref={ref}
      >
        {/* Just have a spinner appear on the middle row */}
        {!visible && interactive && !isSource && <Spinner />}
        {visible && (
          <>
            <Typography
              semanticTag="span"
              visualAppearance="body-four"
              className={classNames('caption', moduleStyles.caption)}
            >
              {caption}
            </Typography>
            {/* The space is empty if it is the source and the cipher for that letter is
             * used, or if it is the cipher space (not the source) then it is empty when
             * there is no assigned letter in the cipher.
             *
             * The base letter showing the space where the letter can be placed
             */}
            {letters.map((letter, i) => (
              <span
                key={`base-letter-${i}`}
                className={classNames(
                  'letter',
                  moduleStyles.letter,
                  moduleStyles.empty,
                  interactive
                    ? moduleStyles.interactive
                    : moduleStyles.uninteractive,
                )}
                data-letter={letter}
                data-is-source={isSource}
                data-is-interactive={interactive}
                data-notranslate
                style={{
                  left: itemPositions.current[letter],
                }}
                onClick={handleClick.bind(null, letter)}
              >
                <Typography
                  semanticTag="span"
                  visualAppearance="body-two"
                >
                  {letter}
                </Typography>
              </span>
            ))}
            {interactive &&
              letters.map((letter, i) => (
                <Letter
                  letter={letter}
                  i={i}
                  key={`interactive-letter-${letter}`}
                  itemSourcePositions={itemSourcePositions}
                  itemSourceVisibility={itemSourceVisibility}
                  isSource={!!isSource}
                  onUpdate={onUpdate}
                  handleUpdate={handleUpdate}
                />
              ))}
          </>
        )}
      </div>
    ),
    [caption, selected, visible],
  );
};

export default Letters;
