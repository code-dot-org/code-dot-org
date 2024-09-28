import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import Toggle from '@cdo/apps/componentLibrary/toggle/Toggle';
import {
  BodyFourText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';

import MusicRegistry from '../MusicRegistry';
import {InstrumentEventValue} from '../player/interfaces/TuneEvent';
import MusicLibrary from '../player/MusicLibrary';
import {
  getNoteName,
  getNotesInKey,
  getPitchName,
  isBlackKey,
  Key,
} from '../utils/Notes';

import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import styles from './instrument-grid.module.scss';

const START_OCTAVE = 4;
const TOTAL_OCTAVES = 3;
const DISPLAY_OCTAVES = 1;

interface SequenceEditorProps {
  initialValue: InstrumentEventValue;
  onChange: (value: InstrumentEventValue) => void;
  editorType: EditorType;
  lengthMeasures: number;
}

type EditorType = 'drums' | 'notes';
type ScaleMode = 'simple' | 'chromatic';

const SequenceEditor: React.FunctionComponent<SequenceEditorProps> = ({
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
  const [showingAdvancedControls, setShowingAdvancedControls] = useState(false);
  const [currentOctaveOffset, setCurrentOctaveOffset] = useState(1);

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
    MusicRegistry.player.previewTune(
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
        currentOctaveOffset + START_OCTAVE,
        editorType,
        scaleMode,
        currentValue.instrument,
        MusicRegistry.player.getKey()
      ),
    [currentOctaveOffset, editorType, scaleMode, currentValue.instrument]
  );

  displayNotes.sort((a, b) => b.note - a.note);

  const ticks =
    editorType === 'notes' && scaleMode === 'simple'
      ? integers(lengthMeasures * 8, 1).map(i => i * 2 - 1)
      : integers(lengthMeasures * 16, 1);

  return (
    <div className={styles.container}>
      <div className={styles.controlRow}>
        <SimpleDropdown
          items={instruments.map(instrument => ({
            value: instrument.id,
            text: instrument.name,
          }))}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            setCurrentValue({...currentValue, instrument: event.target.value});
          }}
          size="s"
          name="instrument"
          labelText="Instrument"
          isLabelVisible={false}
          selectedValue={currentValue.instrument}
        />
        {editorType === 'notes' && (
          <div className={styles.advancedToggleContainer}>
            <BodyFourText className={styles.toggleLabel}>
              More Controls
            </BodyFourText>
            <Toggle
              id="advanced-toggle"
              checked={showingAdvancedControls}
              onChange={event =>
                setShowingAdvancedControls(event.target.checked)
              }
              name="advanced"
              size="xs"
            />
          </div>
        )}
      </div>
      <div
        className={classNames(
          styles.advancedControlsDrawer,
          showingAdvancedControls && styles.show
        )}
      >
        <BodyThreeText className={styles.controlLabel}>Mode:</BodyThreeText>
        <SegmentedButtons
          buttons={[
            {
              label: 'Simple',
              value: 'simple',
            },
            {
              label: 'Chromatic',
              value: 'chromatic',
            },
          ]}
          onChange={value => setScaleMode(value as ScaleMode)}
          selectedButtonValue={scaleMode}
          size="xs"
        />
      </div>
      <div className={styles.middleArea}>
        <div className={styles.sequenceEditor}>
          {displayNotes.map(({note, name}) => {
            return (
              <div className={styles.pitchRow} key={note}>
                {editorType === 'drums' && (
                  <div className={styles.label}>{name}</div>
                )}
                {editorType === 'notes' && scaleMode === 'chromatic' && (
                  <KeyLabel note={note} />
                )}
                <div className={styles.cellRow}>
                  {ticks.map(tick => {
                    return (
                      <>
                        <div
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
                      </>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {editorType === 'notes' && showingAdvancedControls && (
          <PageSwitcher
            currentPage={currentOctaveOffset}
            totalPages={TOTAL_OCTAVES}
            onChange={page => setCurrentOctaveOffset(page)}
          />
        )}
      </div>
      <PreviewControls
        enabled={currentValue.events.length > 0 && !isLoading}
        playPreview={startPreview}
        onClickClear={() => setCurrentValue({...currentValue, events: []})}
        cancelPreviews={stopPreview}
        isPlayingPreview={currentPreviewTick > 0}
      />
      <LoadingOverlay show={isLoading} />
    </div>
  );
};

const integers = (length: number, start: number = 0) =>
  Array.from({length}, (_, i) => i + start);

function getDisplayNotes(
  startOctave: number,
  editorType: EditorType,
  scaleMode: ScaleMode,
  instrument: string,
  rootKey: Key
) {
  if (editorType === 'drums') {
    const kitFolder = MusicLibrary.getInstance()?.kits.find(
      kit => kit.id === instrument
    );
    return (
      kitFolder?.sounds.map((sound, i) => ({name: sound.name, note: i})) || []
    );
  }
  let noteValues;
  if (scaleMode === 'chromatic') {
    noteValues = integers(DISPLAY_OCTAVES * 12, startOctave * 12);
  } else {
    noteValues = getNotesInKey(rootKey, startOctave, DISPLAY_OCTAVES);
  }

  return noteValues.map(note => ({note, name: getNoteName(note)}));
}

function getInstruments(editorType: EditorType) {
  if (editorType === 'drums') {
    return MusicLibrary.getInstance()?.kits || [];
  }
  return MusicLibrary.getInstance()?.instruments || [];
}

const PageSwitcher: React.FunctionComponent<{
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}> = ({currentPage, totalPages, onChange}) => {
  return (
    <div className={styles.pageSwitcher}>
      <button
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={styles.changePageButton}
      >
        <FontAwesomeV6Icon iconName="caret-up" />
      </button>
      {integers(totalPages)
        .map(i => {
          return (
            <button
              type="button"
              className={classNames(
                styles.pageButton,
                currentPage === i && styles.selected
              )}
              onClick={() => onChange(i)}
              key={i}
            />
          );
        })
        .reverse()}
      <button
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={styles.changePageButton}
      >
        <FontAwesomeV6Icon iconName="caret-down" />
      </button>
    </div>
  );
};

const KeyLabel: React.FunctionComponent<{note: number}> = ({note}) => {
  return (
    <div
      className={classNames(
        styles.keyLabel,
        isBlackKey(note) && styles.blackKey
      )}
    >
      {getPitchName(note)}
    </div>
  );
};

export default SequenceEditor;
