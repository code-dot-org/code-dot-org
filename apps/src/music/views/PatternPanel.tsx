import classNames from 'classnames';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import aiBot from '@cdo/static/ai-bot.png';

import {generatePattern} from '../ai/patternAi';
import {PatternEventValue} from '../player/interfaces/PatternEvent';
import MusicLibrary, {SoundData} from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';

import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import styles from './patternPanel.module.scss';

// Generate an array containing tick numbers from 1..16.
const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);

interface PatternPanelProps {
  library: MusicLibrary;
  initValue: PatternEventValue;
  onChange: (value: PatternEventValue) => void;
  previewSound: MusicPlayer['previewSound'];
  previewPattern: MusicPlayer['previewPattern'];
  cancelPreviews: MusicPlayer['cancelPreviews'];
  setupSampler: MusicPlayer['setupSampler'];
  isInstrumentLoading: MusicPlayer['isInstrumentLoading'];
  isInstrumentLoaded: MusicPlayer['isInstrumentLoaded'];
  registerInstrumentLoadCallback: (callback: (kit: string) => void) => void;
}

/*
 * Renders a UI for designing a pattern. This is currently used within a
 * custom Blockly Field {@link FieldPattern}
 */
const PatternPanel: React.FunctionComponent<PatternPanelProps> = ({
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

  const [aiTemperature, setAiTemperature] = useState(1);

  const availableKits = useMemo(() => {
    return library.kits;
  }, [library.kits]);

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
      isSet && tick < 5 && styles.activeCellEarly,
      isSet && tick >= 5 && styles.activeCell,
      isHighlighted && styles.highlightedCell
    );
  };

  const onClear = useCallback(() => {
    currentValue.events = [];
    onChange(currentValue);
  }, [onChange, currentValue]);

  const startPreview = useCallback(() => {
    previewPattern(
      currentValue,
      (tick: number) => setCurrentPreviewTick(tick),
      () => setCurrentPreviewTick(0)
    );
  }, [previewPattern, setCurrentPreviewTick, currentValue]);

  const stopPreview = useCallback(() => {
    setCurrentPreviewTick(0);
    cancelPreviews();
  }, [setCurrentPreviewTick, cancelPreviews]);

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

  const handleAiClick = useCallback(async () => {
    const seedEvents = currentValue.events.filter(event => event.tick < 4);
    generatePattern(seedEvents, 28 - 16, aiTemperature, newEvents => {
      const newValue: PatternEventValue = {
        kit: currentValue.kit,
        events: newEvents,
      };
      onChange(newValue);
    });
  }, [currentValue, onChange, aiTemperature]);

  return (
    <div className={styles.patternPanel}>
      <select value={currentValue.kit} onChange={handleFolderChange}>
        {availableKits.map(folder => (
          <option key={folder.id} value={folder.id}>
            {folder.name}
          </option>
        ))}
      </select>
      <div
        style={{
          float: 'right',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={aiTemperature}
          onChange={event => {
            setAiTemperature(event.target.valueAsNumber);
          }}
          style={{width: 100, height: 5}}
        />
        <div
          style={{
            width: 20,
            marginLeft: 5,
            marginRight: 15,
            textAlign: 'right',
          }}
        >
          {aiTemperature}
        </div>
        <img src={aiBot} alt="" style={{width: 20}} onClick={handleAiClick} />
      </div>

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
        cancelPreviews={stopPreview}
        isPlayingPreview={currentPreviewTick > 0}
      />
    </div>
  );
};

export default PatternPanel;
