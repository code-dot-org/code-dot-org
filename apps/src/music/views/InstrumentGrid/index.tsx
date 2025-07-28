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

  const interfaceMode =
    editorType === 'drums' ? 'drums' : scaleMode || 'simple';

  const getRowInfo = (name: string, note: number) => {
    if (interfaceMode === 'drums') {
      return {style: styles.textLabel, label: name};
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
          doEase={editorType !== 'drums'}
          frames={50}
          scrollStart={scrollStart}
          scrollEnd={scrollEnd}
          className={classNames(styles[`sequence-editor-${interfaceMode}`])}
          ariaLabel="Instrument Grid"
        >
          {allNotes.map(({note, name}) => {
            const {
              pitchRowClass,
              style,
              label,
              textColor,
              keyColor,
              selectedColor,
              tabIndex,
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
                  {ticks.map(tick => (
                    <Fragment key={tick}>
                      <button
                        type="button"
                        className={styles[`cell-outer-${interfaceMode}`]}
                        key={tick}
                        onClick={() => onClickCell(note, tick)}
                        tabIndex={tabIndex}
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
