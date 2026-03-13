import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import classNames from 'classnames';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FocusLock from 'react-focus-lock';

import musicI18n from '../../locale';
import MusicRegistry from '../../MusicRegistry';
import {
  InstrumentEventValue,
  ScaleMode,
} from '../../player/interfaces/InstrumentEvent';
import {
  getPitchName,
  convertRelativeToAbsolutePitch,
  convertAbsoluteToRelativePitch,
} from '../../utils/Notes';
import {
  EditorType,
  getDisplayNotes,
  integers,
  getNoteColorInfo,
} from '../../utils/Tunes';
import LoadingOverlay from '../LoadingOverlay';
import PreviewControlsV2 from '../PreviewControlsV2';
import EaseIntoView from '../util/EaseIntoView';

import {getInstruments} from './util';

import styles from './styles.module.scss';

const SHOWING = 'showing';

interface Props {
  initialValue: InstrumentEventValue;
  onChange: (value: InstrumentEventValue) => void;
  editorType: EditorType;
  lengthMeasures: number;
}

/**
 * Instrument grid editor for selecting notes in a pattern.
 * Used in the "play_tune" and "play_pattern" blocks.
 */
const InstrumentGrid: React.FunctionComponent<Props> = ({
  initialValue,
  onChange,
  editorType,
  lengthMeasures,
}) => {
  const instruments = getInstruments(editorType);
  const [currentValue, setCurrentValue] = useState(() => {
    // Convert to absolute when loading.
    const convertedValue = {
      ...initialValue,
      events: initialValue.events.map(event => ({
        ...event,
        note: initialValue.relative
          ? convertRelativeToAbsolutePitch(
              MusicRegistry.player.getKey(),
              event.note
            )
          : event.note,
      })),
    };
    return convertedValue;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPreviewTick, setCurrentPreviewTick] = useState(0);

  const scaleMode = currentValue.scaleMode;
  const key = MusicRegistry.player.getKey();

  useEffect(() => {
    // Convert to relative before saving.
    const convertedValue = {
      ...currentValue,
      events: currentValue.events.map(event => ({
        ...event,
        note: currentValue.relative
          ? convertAbsoluteToRelativePitch(key, event.note)
          : event.note,
      })),
    };
    onChange(convertedValue);
  }, [onChange, currentValue, key]);

  useEffect(() => {
    const instrument = currentValue.instrument;
    if (!MusicRegistry.player.isInstrumentLoaded(instrument)) {
      setIsLoading(true);
      // If the instrument is already loading, register a callback and wait for it to finish.
      if (MusicRegistry.player.isInstrumentLoading(instrument)) {
        MusicRegistry.player.registerCallback(
          'InstrumentLoaded',
          instrumentName => {
            if (instrumentName === instrument) {
              setIsLoading(false);
            }
          }
        );
      } else {
        // Otherwise, initiate the load.
        MusicRegistry.player.setupSampler(instrument, () =>
          setIsLoading(false)
        );
      }
    }
  }, [setIsLoading, currentValue.instrument]);

  const onClickCell = useCallback(
    (note: number, tick: number) => {
      const newEvents = [...currentValue.events];
      const index = newEvents.findIndex(
        event => event.note === note && event.tick === tick
      );

      if (index !== -1) {
        newEvents.splice(index, 1);
      } else {
        newEvents.push({note, tick});
        MusicRegistry.player.previewNote(note, currentValue.instrument);
      }
      setCurrentValue({...currentValue, events: newEvents});
    },
    [currentValue]
  );

  const isSelected = (note: number, tick: number) => {
    return !!currentValue.events.find(
      event => event.note === note && event.tick === tick
    );
  };

  const startPreview = useCallback(() => {
    MusicRegistry.player.previewNotes(
      {...currentValue, relative: false},
      (tick: number) => setCurrentPreviewTick(tick),
      () => setCurrentPreviewTick(0)
    );
  }, [setCurrentPreviewTick, currentValue]);

  const stopPreview = useCallback(() => {
    setCurrentPreviewTick(0);
    MusicRegistry.player.cancelPreviews();
  }, [setCurrentPreviewTick]);

  const allNotes = useMemo(
    () =>
      getDisplayNotes(
        editorType,
        'chromatic',
        currentValue.instrument,
        MusicRegistry.player.getKey()
      ),
    [editorType, currentValue.instrument]
  );

  const displayNotes = useMemo(
    () =>
      getDisplayNotes(
        editorType,
        scaleMode || 'simple',
        currentValue.instrument,
        MusicRegistry.player.getKey()
      ),
    [editorType, scaleMode, currentValue.instrument]
  );

  const ticks = integers(lengthMeasures * 16, 1);

  const numRows = allNotes.length;
  const numCols = ticks.length + 1; // +1 for the label button

  // Because we need allNotes and ticks to be defined to create this grid
  // of refs, this useRef is further down the component body than usual.
  const focusableRefs = useRef<Array<Array<HTMLButtonElement | null>>>(
    Array.from({length: numRows}, () => Array(numCols).fill(null))
  );

  const interfaceMode =
    editorType === 'drums' ? 'drums' : scaleMode || 'simple';

  const getRowInfo = (name: string, note: number) => {
    if (interfaceMode === 'drums') {
      return {style: styles.textLabel, label: name, tabIndex: 0, showing: true};
    }

    const {textColor, keyColor, selectedColor} = getNoteColorInfo(
      interfaceMode,
      displayNotes.findIndex(displayNote => displayNote.note === note)
    );

    const showing = displayNotes.find(displayNote => displayNote.note === note);

    const pitchRowClass = showing
      ? styles.pitchRowShowing
      : styles.pitchRowHidden;

    const tabIndex = showing ? 0 : -1;

    return {
      pitchRowClass,
      style: styles.keyLabel,
      label: getPitchName(note),
      textColor,
      keyColor,
      selectedColor,
      tabIndex,
      showing,
    };
  };

  const [scrollStart, scrollEnd] = useMemo(() => {
    const {cellHeight, rowGap, peekHeight} = styles;
    if (editorType !== 'notes') {
      return [0, 0];
    }

    const notesInOctave = scaleMode === 'chromatic' ? 12 : 7;
    // Scroll so that the middle octave is at the bottom of the editor.
    const firstVisibleRow = notesInOctave;
    // Start scrolling from a few rows beyond.
    const scrollStartRow = firstVisibleRow + 3;
    const cellHeightWithGap = parseInt(cellHeight) + parseInt(rowGap);

    return [
      -(scrollStartRow * cellHeightWithGap),
      -(firstVisibleRow * cellHeightWithGap - parseInt(peekHeight)),
    ];
  }, [editorType, scaleMode]);

  // Because the notes render hidden rows, we end up with empty rows in the
  // 2D array of refs. This function is a helper to find the next non-empty
  // row when a user is navigating with the up/down arrows.
  function findNextNonEmptyRow(startRow: number, direction: number) {
    const numRows = focusableRefs.current.length;
    let row = startRow;
    for (let i = 0; i < numRows; i++) {
      row = (row + direction + numRows) % numRows;
      if (
        focusableRefs.current[row] &&
        focusableRefs.current[row].some(Boolean)
      ) {
        return row;
      }
    }
    return startRow; // fallback if all rows are empty
  }

  // This handles keyboard interactions for the cells. If an instrument is sent
  // in, we are focused on the label, which means we play a preview of the note.
  // Otherwise, we are focused on a selectable cell, which means we call the
  // corresponding click event. Escape exits the grid, moving focus back to the
  // parent container. StopPropagation is called on Tab events to keep the focus
  // from moving beyond the parent container when focus is inside it. Arrows
  // navigate between cells, wrapping within rows and columns.
  const handleKeyDown = (
    event: React.KeyboardEvent,
    note: number,
    tick?: number,
    instrument?: string
  ) => {
    const {key} = event;

    switch (key) {
      case 'Enter': {
        event.stopPropagation();
        event.preventDefault();
        if (tick !== undefined) {
          onClickCell(note, tick);
        } else if (instrument) {
          MusicRegistry.player.previewNote(note, instrument);
        }
        break;
      }
      case 'Escape': {
        event.stopPropagation();
        event.preventDefault();
        // Move focus back to the parent container
        const parentContainer = event.currentTarget.closest('#instrument-grid');
        (parentContainer as HTMLElement | null)?.focus();
        break;
      }
      case 'Tab': {
        event.stopPropagation();
        break;
      }
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();

        // Find the current focus position
        let currentRow = -1;
        let currentCol = -1;
        currentRow = focusableRefs.current.findIndex(row =>
          row.includes(document.activeElement as HTMLButtonElement)
        );
        if (currentRow !== -1) {
          currentCol = focusableRefs.current[currentRow].indexOf(
            document.activeElement as HTMLButtonElement
          );
        }

        // If we couldn't find the current position, do nothing.
        if (currentRow === -1 || currentCol === -1) {
          return;
        }

        const numCols = focusableRefs.current[0]?.length || 0;
        let nextRow = currentRow;
        let nextCol = currentCol;

        if (key === 'ArrowLeft') {
          nextCol = (currentCol - 1 + numCols) % numCols;
        }
        if (key === 'ArrowRight') {
          nextCol = (currentCol + 1) % numCols;
        }

        // Notes render in the opposite up/down direction as drums
        const upArrowDirection = editorType === 'notes' ? 1 : -1;
        const downArrowDirection = editorType === 'notes' ? -1 : 1;

        if (key === 'ArrowUp') {
          nextRow = findNextNonEmptyRow(currentRow, upArrowDirection);
        }
        if (key === 'ArrowDown') {
          nextRow = findNextNonEmptyRow(currentRow, downArrowDirection);
        }

        // Focus the next element if it exists and is not null
        focusableRefs.current[nextRow][nextCol]?.focus();
        break;
      }
      default:
        break;
    }
  };

  return (
    <FocusLock>
      <div className={styles.container} data-theme="Dark">
        <div className={styles.controlRow}>
          <div className={styles.left}>
            <SimpleDropdown
              className={styles.flexAutoWidth}
              items={instruments.map(instrument => ({
                value: instrument.id,
                text: instrument.name,
              }))}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                setCurrentValue({
                  ...currentValue,
                  instrument: event.target.value,
                });
              }}
              size="s"
              name="instrument"
              labelText="Instrument"
              isLabelVisible={false}
              selectedValue={currentValue.instrument}
            />
            <PreviewControlsV2
              enabled={currentValue.events.length > 0 && !isLoading}
              playPreview={startPreview}
              onClickClear={() =>
                setCurrentValue({...currentValue, events: []})
              }
              cancelPreviews={stopPreview}
              isPlayingPreview={currentPreviewTick > 0}
            />
          </div>
          {editorType === 'notes' && (
            <SegmentedButtons
              className={styles.flexAutoWidth}
              buttons={[
                {label: musicI18n.tuneKeyNotes(), value: 'simple'},
                {label: musicI18n.tuneAllNotes(), value: 'chromatic'},
              ]}
              onChange={value => {
                setCurrentValue({
                  ...currentValue,
                  scaleMode: value as ScaleMode,
                });
                MusicRegistry.analyticsReporter.onButtonClicked(
                  'change-tune-scale-mode',
                  {scaleMode: value}
                );
              }}
              selectedButtonValue={scaleMode || 'simple'}
              size="xs"
            />
          )}
        </div>
        <EaseIntoView
          id="instrument-grid"
          doEase={editorType !== 'drums'}
          frames={50}
          scrollStart={scrollStart}
          scrollEnd={scrollEnd}
          className={classNames(styles[`sequence-editor-${interfaceMode}`])}
          ariaLabel="Instrument Grid"
          focusableChildren={focusableRefs.current.flat()}
        >
          {allNotes.map(({note, name}, rowIndex) => {
            const {
              pitchRowClass,
              style,
              label,
              textColor,
              keyColor,
              selectedColor,
              tabIndex,
              showing,
            } = getRowInfo(name, note);

            return (
              <div
                className={classNames(styles.pitchRow, pitchRowClass)}
                key={note}
              >
                <button
                  ref={element =>
                    showing
                      ? (focusableRefs.current[rowIndex][0] = element)
                      : null
                  }
                  type="button"
                  className={`${styles['cell-outer']} ${
                    showing ? SHOWING : ''
                  }`}
                  onClick={() =>
                    MusicRegistry.player.previewNote(
                      note,
                      currentValue.instrument
                    )
                  }
                  onKeyDown={event =>
                    handleKeyDown(
                      event,
                      note,
                      undefined,
                      currentValue.instrument
                    )
                  }
                  tabIndex={tabIndex}
                >
                  <div
                    className={classNames(style, styles.innerCell)}
                    style={{backgroundColor: keyColor, color: textColor}}
                  >
                    {label}
                  </div>
                </button>

                <div className={styles.cellRow}>
                  {ticks.map((tick, colIndex) => (
                    <Fragment key={tick}>
                      <button
                        ref={element =>
                          showing
                            ? (focusableRefs.current[rowIndex][colIndex + 1] =
                                element)
                            : null
                        }
                        type="button"
                        className={`${styles[`cell-outer-${interfaceMode}`]} ${
                          showing ? SHOWING : ''
                        }`}
                        key={tick}
                        onClick={() => onClickCell(note, tick)}
                        tabIndex={tabIndex}
                        onKeyDown={event => handleKeyDown(event, note, tick)}
                      >
                        <div
                          className={classNames(
                            styles.innerCell,
                            isSelected(note, tick) && styles.selected,
                            currentPreviewTick === tick && styles.preview
                          )}
                          style={{
                            backgroundColor: isSelected(note, tick)
                              ? selectedColor
                              : undefined,
                          }}
                        />
                      </button>
                      {
                        tick % 4 === 0 && (
                          <div className={styles.spacer} />
                        ) /* Spacer */
                      }
                    </Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </EaseIntoView>
        <LoadingOverlay show={isLoading} />
      </div>
    </FocusLock>
  );
};

export default InstrumentGrid;
