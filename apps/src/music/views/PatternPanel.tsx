import classNames from 'classnames';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {TICKS_PER_MEASURE} from '../constants';
import MusicRegistry from '../MusicRegistry';
import {InstrumentEventValue} from '../player/interfaces/InstrumentEvent';
import MusicLibrary from '../player/MusicLibrary';

import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import styles from './patternPanel.module.scss';

// Generate an array containing tick numbers from 1..16.
const arrayOfTicks = Array.from({length: TICKS_PER_MEASURE}, (_, i) => i + 1);

interface PatternPanelProps {
  initValue: InstrumentEventValue;
  onChange: (value: InstrumentEventValue) => void;
}

/*
 * Renders a UI for designing a pattern. This is currently used within a
 * custom Blockly Field {@link FieldPattern}
 */
const PatternPanel: React.FunctionComponent<PatternPanelProps> = ({
  initValue,
  onChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const currentValue: InstrumentEventValue = JSON.parse(
    JSON.stringify(initValue)
  );

  const availableKits = useMemo(
    () => MusicLibrary.getInstance()?.kits || [],
    []
  );

  const currentFolder = useMemo(() => {
    // Default to the first available kit if the current kit is not found in this library.
    return (
      availableKits?.find(kit => kit.id === currentValue.instrument) ||
      availableKits?.[0]
    );
  }, [availableKits, currentValue.instrument]);
  const [currentPreviewTick, setCurrentPreviewTick] = useState(0);

  const toggleEvent = useCallback(
    (tick: number, note: number) => {
      const index = currentValue.events.findIndex(
        event => event.note === note && event.tick === tick
      );
      if (index !== -1) {
        // If found, delete.
        currentValue.events.splice(index, 1);
      } else {
        // Not found, so add.
        currentValue.events.push({tick, note});
        MusicRegistry.player.previewNote(note, currentValue.instrument);
      }

      onChange(currentValue);
    },
    [onChange, currentValue]
  );

  const hasEvent = (note: number, tick: number) => {
    const element = currentValue.events.find(
      event => event.note === note && event.tick === tick
    );
    return !!element;
  };

  const handleFolderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    currentValue.instrument = event.target.value;
    onChange(currentValue);
  };

  const getCellClasses = (note: number, tick: number) => {
    const isSet = hasEvent(note, tick);
    const isHighlighted = !isSet && (tick - 1) % 4 === 0;

    return classNames(
      styles.cell,
      isSet && styles.activeCell,
      isHighlighted && styles.highlightedCell
    );
  };

  const onClear = useCallback(() => {
    currentValue.events = [];
    onChange(currentValue);
  }, [onChange, currentValue]);

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

  useEffect(() => {
    if (!MusicRegistry.player.isInstrumentLoaded(currentValue.instrument)) {
      setIsLoading(true);
      if (MusicRegistry.player.isInstrumentLoading(currentValue.instrument)) {
        // If the instrument is already loading, register a callback and wait for it to finish.
        MusicRegistry.player.registerCallback('InstrumentLoaded', kit => {
          if (kit === currentValue.instrument) {
            setIsLoading(false);
          }
        });
      } else {
        // Otherwise, initiate the load.
        MusicRegistry.player.setupSampler(currentValue.instrument, () =>
          setIsLoading(false)
        );
      }
    }
  }, [currentValue.instrument, setIsLoading]);

  return (
    <div className={styles.patternPanel}>
      <select value={currentValue.instrument} onChange={handleFolderChange}>
        {availableKits.map(folder => (
          <option key={folder.id} value={folder.id}>
            {folder.name}
          </option>
        ))}
      </select>
      <LoadingOverlay show={isLoading} />
      {currentFolder.sounds.map(({name, note}, index) => {
        return (
          <div className={styles.row} key={note}>
            <div className={styles.nameContainer}>
              <span
                className={styles.name}
                onClick={() =>
                  MusicRegistry.player.previewNote(
                    note || index,
                    currentValue.instrument
                  )
                }
              >
                {name}
              </span>
            </div>
            {arrayOfTicks.map(tick => {
              return (
                <div
                  className={classNames(
                    styles.outerCell,
                    tick === currentPreviewTick && styles.outerCellPlaying
                  )}
                  onClick={() => toggleEvent(tick, note || index)}
                  key={tick}
                >
                  <div className={getCellClasses(note || index, tick)} />
                </div>
              );
            })}
          </div>
        );
      })}
      <PreviewControls
        enabled={currentValue.events.length > 0}
        playPreview={startPreview}
        onClickClear={onClear}
        cancelPreviews={stopPreview}
        isPlayingPreview={currentPreviewTick > 0}
      />
    </div>
  );
};

export default PatternPanel;
