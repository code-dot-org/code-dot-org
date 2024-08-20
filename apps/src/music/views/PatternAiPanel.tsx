import classNames from 'classnames';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

const aiBotImages = [
  require(`@cdo/static/music/ai/ai-bot-0.png`),
  require(`@cdo/static/music/ai/ai-bot-1.png`),
  require(`@cdo/static/music/ai/ai-bot-2.png`),
  require(`@cdo/static/music/ai/ai-bot-3.png`),
];

const aiBotImageThinking = require(`@cdo/static/music/ai/ai-bot-thinking.png`);

const arrowImage = require(`@cdo/static/music/music-callout-arrow.png`);

import {generatePattern} from '../ai/patternAi';
import {PatternEventValue} from '../player/interfaces/PatternEvent';
import MusicLibrary, {SoundData} from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';

import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import styles from './patternAiPanel.module.scss';

// Generate an array containing tick numbers from 1..32.
const arrayOfTicks = Array.from({length: 32}, (_, i) => i + 1);

interface PatternAiPanelProps {
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

type UserTaskType = 'none' | 'generated' | 'drawnDrums';
type GenerateStateType = 'none' | 'generating' | 'readyToPreview';

/*
 * Renders a UI for designing a pattern. This is currently used within a
 * custom Blockly Field {@link FieldPattern}
 */
const PatternAiPanel: React.FunctionComponent<PatternAiPanelProps> = ({
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

  const [userTask, setUserTask] = useState<UserTaskType>('none');
  const [generateState, setGenerateState] = useState<GenerateStateType>('none');

  useEffect(() => {
    if (currentValue.events.some(event => event.tick >= 9)) {
      setUserTask('generated');
    } else if (currentValue.events.length >= 4) {
      if (userTask === 'none') {
        setUserTask('drawnDrums');
      }
    }
  }, [currentValue.events, userTask]);

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
    const isSeed = tick < 9;
    const isHighlighted = (tick - 1) % 4 === 0;
    const isActive = hasEvent(sound, tick);
    const isPlaying = isActive && tick === currentPreviewTick;

    return classNames(
      styles.cell,
      isSeed && isActive
        ? styles.cellSeedActive
        : isSeed && isHighlighted
        ? styles.cellSeedHighlighted
        : isSeed
        ? styles.cellSeedDefault
        : userTask !== 'generated'
        ? styles.cellGeneratedInvisible
        : !isSeed && isActive
        ? styles.cellGeneratedActive
        : !isSeed && isHighlighted
        ? styles.cellGeneratedHighlighted
        : styles.cellGeneratedDefault,
      isPlaying && styles.cellPlaying
    );
  };

  const onClear = useCallback(() => {
    currentValue.events = [];
    onChange(currentValue);
  }, [onChange, currentValue]);

  const startPreview = useCallback(
    (value: PatternEventValue) => {
      previewPattern(
        value,
        (tick: number) => setCurrentPreviewTick(tick),
        () => {
          setCurrentPreviewTick(0);
        }
      );
    },
    [previewPattern, setCurrentPreviewTick]
  );

  const stopPreview = useCallback(() => {
    cancelPreviews();
  }, [cancelPreviews]);

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
    const seedEvents = currentValue.events.filter(event => event.tick <= 8);
    generatePattern(seedEvents, 8, 32 - 8, aiTemperature, newEvents => {
      currentValue.events = newEvents;
      onChange(currentValue);

      if (currentPreviewTick === 0) {
        startPreview(currentValue);
        setGenerateState('none');
      } else {
        // If a preview is already playing, we can stop the current one, and wait for
        // it to cleanly complete, before beginning the next one.
        stopPreview();
        setGenerateState('readyToPreview');
      }
    });
    setGenerateState('generating');
  }, [
    currentValue,
    onChange,
    aiTemperature,
    stopPreview,
    startPreview,
    currentPreviewTick,
  ]);

  useEffect(() => {
    if (currentPreviewTick === 0 && generateState === 'readyToPreview') {
      startPreview(currentValue);
      setGenerateState('none');
    }
  }, [currentPreviewTick, generateState, currentValue, startPreview]);

  const aiTemperatureMin = 0.5;
  const aiTemperatureMax = 2;

  const aiBotImageIndex = Math.min(
    Math.floor(
      ((aiTemperature - aiTemperatureMin) /
        (aiTemperatureMax - aiTemperatureMin)) *
        aiBotImages.length
    ),
    aiBotImages.length - 1
  );
  const aiBotImage = aiBotImages[aiBotImageIndex];

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

      <div className={styles.body}>
        {userTask === 'none' && (
          <div className={styles.helpContainer}>
            <div className={classNames(styles.help, styles.helpDrawDrums)}>
              Click to set up the start of your drums.
            </div>
            <div
              className={classNames(
                styles.arrowContainer,
                styles.arrowContainerDrawDrums
              )}
            >
              <div
                id="callout-arrow"
                className={classNames(styles.arrow, styles.arrowLeft)}
              >
                <img src={arrowImage} alt="" />
              </div>
            </div>
          </div>
        )}
        {userTask === 'drawnDrums' && (
          <div className={styles.helpContainer}>
            <div className={classNames(styles.help, styles.helpGenerate)}>
              Click on A.I. and it will generate more drums based on what you
              started.
            </div>
            <div
              className={classNames(
                styles.arrowContainer,
                styles.arrowContainerGenerate
              )}
            >
              <div
                id="callout-arrow"
                className={classNames(styles.arrow, styles.arrowRight)}
              >
                <img src={arrowImage} alt="" />
              </div>
            </div>
          </div>
        )}

        <div className={styles.leftArea}>
          {currentFolder.sounds.map((sound, index) => {
            return (
              <div className={styles.row} key={sound.src}>
                <div className={styles.nameContainer}>
                  <span
                    className={styles.name}
                    onClick={() =>
                      previewSound(`${currentValue.kit}/${sound.src}`)
                    }
                  >
                    {sound.name}
                  </span>
                </div>
                {arrayOfTicks
                  .filter(
                    tick =>
                      (userTask === 'generated' && generateState === 'none') ||
                      tick < 9
                  )
                  .map(tick => {
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
        </div>

        <div className={styles.rightArea}>
          <div
            className={classNames(
              styles.botArea,
              ['drawnDrums', 'generated'].includes(userTask) &&
                styles.botAreaVisible
            )}
          >
            <img
              src={
                generateState === 'generating' ? aiBotImageThinking : aiBotImage
              }
              className={classNames(
                styles.aiBot,
                generateState === 'generating' && styles.aiBotGenerating
              )}
              onClick={handleAiClick}
              alt=""
              draggable={false}
            />
            <div>
              <input
                type="range"
                min={aiTemperatureMin}
                max={aiTemperatureMax}
                step={0.1}
                value={aiTemperature}
                onChange={event => {
                  setAiTemperature(event.target.valueAsNumber);
                }}
                className={styles.temperatureInput}
              />
              <div className={styles.temperatureText}>{aiTemperature}</div>
            </div>
          </div>
        </div>
      </div>

      <PreviewControls
        enabled={currentValue.events.length > 0}
        playPreview={() => startPreview(currentValue)}
        onClickClear={onClear}
        cancelPreviews={stopPreview}
        isPlayingPreview={currentPreviewTick > 0}
      />
    </div>
  );
};

export default PatternAiPanel;
