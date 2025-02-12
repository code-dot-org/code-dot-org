import classNames from 'classnames';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';

import MusicRegistry from '../../MusicRegistry';
import {InstrumentEventValue} from '../../player/interfaces/InstrumentEvent';
import {getPitchName, isBlackKey} from '../../utils/Notes';
import LoadingOverlay from '../LoadingOverlay';
import PreviewControlsV2 from '../PreviewControlsV2';

import {useInitialScroll} from './useInitialScroll';
import {getDisplayNotes, getInstruments, integers} from './util';

import styles from './styles.module.scss';

interface Props {
  initialValue: InstrumentEventValue;
  onChange: (value: InstrumentEventValue) => void;
  editorType: EditorType;
  lengthMeasures: number;
}

export type EditorType = 'drums' | 'notes';
export type ScaleMode = 'simple' | 'chromatic';

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
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPreviewTick, setCurrentPreviewTick] = useState(0);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('simple');

  useEffect(() => {
    onChange(currentValue);
  }, [onChange, currentValue]);

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
      currentValue,
      (tick: number) => setCurrentPreviewTick(tick),
      () => setCurrentPreviewTick(0)
    );
  }, [setCurrentPreviewTick, currentValue]);

  const stopPreview = useCallback(() => {
    setCurrentPreviewTick(0);
    MusicRegistry.player.cancelPreviews();
  }, [setCurrentPreviewTick]);

  const displayNotes = useMemo(
    () =>
      getDisplayNotes(
        editorType,
        scaleMode,
        currentValue.instrument,
        MusicRegistry.player.getKey()
      ).sort((a, b) => b.note - a.note), // Sort descending
    [editorType, scaleMode, currentValue.instrument]
  );

  const ticks = integers(lengthMeasures * 16, 1);

  const scrollRef = useRef<HTMLDivElement>(null);
  useInitialScroll(scrollRef, editorType, scaleMode, displayNotes.length);

  const RowLabel = (props: {name: string; note: number; i: number}) => {
    return (
      <button
        type="button"
        className={classNames(
          editorType === 'drums'
            ? styles.textLabel
            : scaleMode === 'chromatic'
            ? styles.keyLabel
            : styles.label,
          isBlackKey(props.note) && styles.blackKey
        )}
        onClick={() =>
          MusicRegistry.player.previewNote(props.note, currentValue.instrument)
        }
      >
        {editorType === 'drums'
          ? props.name
          : scaleMode === 'chromatic'
          ? getPitchName(props.note)
          : ((displayNotes.length - props.i - 1) % 7) + 1}
      </button>
    );
  };

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
              {
                label: 'Best Notes',
                value: 'simple',
              },
              {
                label: 'All Notes',
                value: 'chromatic',
              },
            ]}
            onChange={value => setScaleMode(value as ScaleMode)}
            selectedButtonValue={scaleMode}
            size="xs"
          />
        )}
      </div>
      <div
        className={classNames(
          styles[
            `sequence-editor-${
              editorType === 'drums'
                ? 'drums'
                : scaleMode === 'simple'
                ? 'simple'
                : 'chromatic'
            }`
          ]
        )}
        ref={scrollRef}
      >
        {displayNotes.map(({note, name}, i) => (
          <div className={styles.pitchRow} key={note}>
            <RowLabel name={name} note={note} i={i} />
            <div className={styles.cellRow}>
              {ticks.map(tick => (
                <Fragment key={tick}>
                  <button
                    type="button"
                    className={classNames(
                      editorType === 'drums'
                        ? styles['cell-drums']
                        : styles[`cell-${scaleMode}`],
                      isSelected(note, tick) && styles.activeCell,
                      currentPreviewTick === tick && styles.previewCell
                    )}
                    key={tick}
                    onClick={() => onClickCell(note, tick)}
                  />
                  {tick % 4 === 0 && <div /> /* Spacer */}
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      <LoadingOverlay show={isLoading} />
    </div>
  );
};

export default InstrumentGrid;
