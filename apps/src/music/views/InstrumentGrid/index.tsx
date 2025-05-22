import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import classNames from 'classnames';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import MusicRegistry from '../../MusicRegistry';
import {
  InstrumentEventValue,
  ScaleMode,
} from '../../player/interfaces/InstrumentEvent';
import {
  getPitchName,
  isBlackKey,
  convertRelativeToAbsolutePitch,
  convertAbsoluteToRelativePitch,
} from '../../utils/Notes';
import LoadingOverlay from '../LoadingOverlay';
import PreviewControlsV2 from '../PreviewControlsV2';
import EaseIntoView from '../util/EaseIntoView';

import {getDisplayNotes, getInstruments, integers} from './util';

import styles from './styles.module.scss';

interface Props {
  initialValue: InstrumentEventValue;
  onChange: (value: InstrumentEventValue) => void;
  editorType: EditorType;
  lengthMeasures: number;
}

export type EditorType = 'drums' | 'notes';

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
      ).sort((a, b) => b.note - a.note), // Sort descending
    [editorType, currentValue.instrument]
  );

  const displayNotes = useMemo(
    () =>
      getDisplayNotes(
        editorType,
        scaleMode || 'simple',
        currentValue.instrument,
        MusicRegistry.player.getKey()
      ).sort((a, b) => b.note - a.note), // Sort descending
    [editorType, scaleMode, currentValue.instrument]
  );

  const ticks = integers(lengthMeasures * 16, 1);

  const interfaceMode =
    editorType === 'drums' ? 'drums' : scaleMode || 'simple';

  const colorsSimple = styles.colorsSimple.split(',');
  const colorsSimpleDarker = styles.colorsSimpleDarker.split(',');

  const getRowInfo = (name: string, note: number) => {
    if (interfaceMode === 'drums') {
      return {style: styles.textLabel, label: name};
    }

    let color = undefined,
      backgroundColor = undefined,
      selectedBackgroundColor = undefined;

    if (interfaceMode === 'simple') {
      const displayNoteIndex = displayNotes.findIndex(
        displayNote => displayNote.note === note
      );
      if (displayNoteIndex !== -1) {
        color = 'white';
        selectedBackgroundColor =
          colorsSimple[(21 - displayNoteIndex) % colorsSimple.length];
        backgroundColor =
          colorsSimpleDarker[
            (21 - displayNoteIndex) % colorsSimpleDarker.length
          ];
      }
    }

    if (backgroundColor === undefined) {
      backgroundColor = isBlackKey(note) ? styles.black : styles.white;
      color = isBlackKey(note) ? styles.white : styles.black;
    }

    if (selectedBackgroundColor === undefined) {
      selectedBackgroundColor = styles.selectedColor;
    }

    const pitchRowClass = displayNotes.find(
      displayNote => displayNote.note === note
    )
      ? styles.pitchRowShowing
      : styles.pitchRowHidden;

    return {
      pitchRowClass,
      style: styles.keyLabel,
      label: getPitchName(note),
      backgroundColor,
      color,
      selectedBackgroundColor,
    };
  };

  const [scrollStart, scrollEnd] = useMemo(() => {
    const {cellHeight, rowGap, displayRows, peekHeight} = styles;
    if (editorType !== 'notes') {
      return [0, 0];
    }

    const notesInOctave = scaleMode === 'chromatic' ? 12 : 7;
    // Scroll so that the middle octave is at the bottom of the editor.
    const topVisibleRow =
      displayNotes.length - notesInOctave - parseInt(displayRows);
    // Start scrolling a few rows below
    const scrollStartRow = topVisibleRow + 3;
    const cellHeightWithGap = parseInt(cellHeight) + parseInt(rowGap);

    return [
      scrollStartRow * cellHeightWithGap,
      topVisibleRow * cellHeightWithGap - parseInt(peekHeight),
    ];
  }, [displayNotes.length, editorType, scaleMode]);

  return (
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
            onClickClear={() => setCurrentValue({...currentValue, events: []})}
            cancelPreviews={stopPreview}
            isPlayingPreview={currentPreviewTick > 0}
          />
        </div>
        {editorType === 'notes' && (
          <SegmentedButtons
            className={styles.flexAutoWidth}
            buttons={[
              {label: 'Best Notes', value: 'simple'},
              {label: 'All Notes', value: 'chromatic'},
            ]}
            onChange={value =>
              setCurrentValue({...currentValue, scaleMode: value as ScaleMode})
            }
            selectedButtonValue={scaleMode || 'simple'}
            size="xs"
          />
        )}
      </div>
      <EaseIntoView
        doEase={editorType !== 'drums'}
        frames={50}
        scrollStart={scrollStart}
        scrollEnd={scrollEnd}
        className={classNames(styles[`sequence-editor-${interfaceMode}`])}
      >
        {allNotes.map(({note, name}, i) => {
          const {
            pitchRowClass,
            style,
            label,
            backgroundColor,
            color,
            selectedBackgroundColor,
          } = getRowInfo(name, note);

          return (
            <div
              className={classNames(styles.pitchRow, pitchRowClass)}
              key={note}
            >
              <button
                type="button"
                className={styles['cell-outer']}
                onClick={() =>
                  MusicRegistry.player.previewNote(
                    note,
                    currentValue.instrument
                  )
                }
              >
                <div
                  className={classNames(style, styles.innerCell)}
                  style={{backgroundColor, color}}
                >
                  {label.replace('#', '♯')}
                </div>
              </button>

              <div className={styles.cellRow}>
                {ticks.map(tick => (
                  <Fragment key={tick}>
                    <button
                      type="button"
                      className={styles[`cell-outer-${interfaceMode}`]}
                      key={tick}
                      onClick={() => onClickCell(note, tick)}
                    >
                      <div
                        className={classNames(
                          styles.innerCell,
                          isSelected(note, tick) && styles.selected,
                          currentPreviewTick === tick && styles.preview
                        )}
                        style={{
                          backgroundColor: isSelected(note, tick)
                            ? selectedBackgroundColor
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
  );
};

export default InstrumentGrid;
