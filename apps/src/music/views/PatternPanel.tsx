import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import classNames from 'classnames';
import styles from './patternPanel.module.scss';
import PreviewControls from './PreviewControls';
import MusicLibrary, {SoundData} from '../player/MusicLibrary';
import {PatternEventValue} from '../player/interfaces/PatternEvent';
import LoadingOverlay from './LoadingOverlay';
import {LoadFinishedCallback} from '../types';

// Generate an array containing tick numbers from 1..16.
const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);

interface PatternPanelProps {
  bpm: number;
  library: MusicLibrary;
  initValue: PatternEventValue;
  onChange: (value: PatternEventValue) => void;
  previewSound: (path: string) => void;
  previewPattern: (pattern: PatternEventValue, onStop: () => void) => void;
  cancelPreviews: () => void;
  setupSampler: (kit: string, onLoadFinished?: LoadFinishedCallback) => void;
  isInstrumentLoading: (kit: string) => boolean;
  isInstrumentLoaded: (kit: string) => boolean;
  registerInstrumentLoadCallback: (callback: (kit: string) => void) => void;
}

/*
 * Renders a UI for designing a pattern. This is currently used within a
 * custom Blockly Field {@link FieldPattern}
 */
const PatternPanel: React.FunctionComponent<PatternPanelProps> = ({
  bpm,
  library,
  initValue,
  onChange,
  previewSound,
  previewPattern,
  cancelPreviews,
  setupSampler,
  isInstrumentLoading,
  isInstrumentLoaded,
  registerInstrumentLoadCallback,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const currentValue: PatternEventValue = JSON.parse(JSON.stringify(initValue));

  const availableKits = useMemo(() => {
    return library.libraryJson.kits;
  }, [library.libraryJson.kits]);

  const currentFolder = useMemo(() => {
    // Default to the first available kit if the current kit is not found in this library.
    return (
      availableKits.find(kit => kit.id === currentValue.kit) || availableKits[0]
    );
  }, [availableKits, currentValue.kit]);
  const [currentPreviewTick, setCurrentPreviewTick] = useState(0);

  const toggleEvent = useCallback(
    (sound: SoundData, tick: number, note: number) => {
      const index = currentValue.events.findIndex(
        event => event.src === sound.src && event.tick === tick
      );
      if (index !== -1) {
        // If found, delete.
        currentValue.events.splice(index, 1);
      } else {
        // Not found, so add.
        currentValue.events.push({src: sound.src, tick, note});
        previewSound(`${currentValue.kit}/${sound.src}`);
      }

      onChange(currentValue);
    },
    [onChange, previewSound, currentValue]
  );

  const hasEvent = (sound: SoundData, tick: number) => {
    const element = currentValue.events.find(
      event => event.src === sound.src && event.tick === tick
    );
    return !!element;
  };

  const handleFolderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    currentValue.kit = event.target.value;
    onChange(currentValue);
  };

  const getCellClasses = (sound: SoundData, tick: number) => {
    const isSet = hasEvent(sound, tick);
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
    setCurrentPreviewTick(1);
    const intervalId = setInterval(
      () => setCurrentPreviewTick(tick => tick + 1),
      // Tick forward every 16th note, i.e. 4 times per beat.
      (60 / bpm / 4) * 1000
    );
    previewPattern(currentValue, () => {
      clearInterval(intervalId);
      setCurrentPreviewTick(0);
    });
  }, [previewPattern, bpm, setCurrentPreviewTick, currentValue]);

  useEffect(() => {
    if (!isInstrumentLoaded(currentValue.kit)) {
      setIsLoading(true);
      if (isInstrumentLoading(currentValue.kit)) {
        // If the instrument is already loading, register a callback and wait for it to finish.
        registerInstrumentLoadCallback(kit => {
          if (kit === currentValue.kit) {
            setIsLoading(false);
          }
        });
      } else {
        // Otherwise, initiate the load.
        setupSampler(currentValue.kit, () => setIsLoading(false));
      }
    }
  }, [
    setupSampler,
    isInstrumentLoading,
    isInstrumentLoaded,
    currentValue.kit,
    setIsLoading,
    registerInstrumentLoadCallback,
  ]);

  return (
    <div className={styles.patternPanel}>
      <select value={currentValue.kit} onChange={handleFolderChange}>
        {availableKits.map(folder => (
          <option key={folder.id} value={folder.id}>
            {folder.name}
          </option>
        ))}
      </select>
      <LoadingOverlay show={isLoading} />
      {currentFolder.sounds.map((sound, index) => {
        return (
          <div className={styles.row} key={sound.src}>
            <div className={styles.nameContainer}>
              <span
                className={styles.name}
                onClick={() => previewSound(`${currentValue.kit}/${sound.src}`)}
              >
                {sound.name}
              </span>
            </div>
            {arrayOfTicks.map(tick => {
              return (
                <div
                  className={classNames(
                    styles.outerCell,
                    tick === currentPreviewTick && styles.outerCellPlaying
                  )}
                  onClick={() => toggleEvent(sound, tick, index)}
                  key={tick}
                >
                  <div className={getCellClasses(sound, tick)} />
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
        cancelPreviews={cancelPreviews}
      />
    </div>
  );
};

export default PatternPanel;
