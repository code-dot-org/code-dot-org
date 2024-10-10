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

import {Button} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import {generatePattern} from '../ai/patternAi';
import appConfig from '../appConfig';
import musicI18n from '../locale';
import MusicRegistry from '../MusicRegistry';
import {PatternEventValue} from '../player/interfaces/PatternEvent';
import MusicLibrary from '../player/MusicLibrary';

import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import styles from './patternAiPanel.module.scss';

const numEvents = 32;
const numSeedEvents = 8;

// Generate an array containing tick numbers from 1..numEvents.
const arrayOfTicks = Array.from({length: numEvents}, (_, i) => i + 1);

interface PatternAiPanelProps {
  initValue: PatternEventValue;
  onChange: (value: PatternEventValue) => void;
}

type UserCompletedTaskType = 'none' | 'generated' | 'drawnDrums';
type GenerateStateType = 'none' | 'generating' | 'error';

/*
 * Renders a UI for designing a pattern, with AI generation. This is currently
 * used within a custom Blockly Field {@link FieldPatternAi}
 */
const PatternAiPanel: React.FunctionComponent<PatternAiPanelProps> = ({
  initValue,
  onChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const currentValue: PatternEventValue = JSON.parse(JSON.stringify(initValue));

  const [aiTemperature, setAiTemperature] = useState(10);

  const availableKits = useMemo(() => {
    return MusicLibrary.getInstance()?.kits || [];
  }, []);

  const [userCompletedTask, setUserCompletedTask] =
    useState<UserCompletedTaskType>('none');
  const [generateState, setGenerateState] = useState<GenerateStateType>('none');

  const currentFolder = useMemo(() => {
    // Default to the first available kit if the current kit is not found in this library.
    return (
      availableKits.find(kit => kit.id === currentValue.instrument) ||
      availableKits[0]
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
    const isSeed = tick < 9;
    const isHighlighted = (tick - 1) % 4 === 0;
    const isActive = hasEvent(note, tick);
    const isPlaying = isActive && tick === currentPreviewTick;

    return classNames(
      styles.cell,
      isSeed && isActive
        ? styles.cellSeedActive
        : isSeed && isHighlighted
        ? styles.cellSeedHighlighted
        : isSeed
        ? styles.cellSeedDefault
        : userCompletedTask !== 'generated'
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

  // Tracks the tasks completed by the user.
  useEffect(() => {
    if (currentValue.events.some(event => event.tick >= 9)) {
      setUserCompletedTask('generated');
    } else if (currentValue.events.length >= 4) {
      if (userCompletedTask === 'none') {
        setUserCompletedTask('drawnDrums');
      }
    }
  }, [currentValue.events, userCompletedTask]);

  const startPreview = useCallback(
    (value: PatternEventValue) => {
      MusicRegistry.player.previewPattern(
        value,
        (tick: number) => {
          setCurrentPreviewTick(tick);
        },
        () => {
          setCurrentPreviewTick(0);
        }
      );
    },
    [setCurrentPreviewTick]
  );

  const stopPreview = useCallback(() => {
    MusicRegistry.player.cancelPreviews();
    setCurrentPreviewTick(0);
  }, []);

  const playPreview = useCallback(() => {
    startPreview(currentValue);
  }, [startPreview, currentValue]);

  const delay = (time: number) => {
    return new Promise(res => {
      setTimeout(res, time);
    });
  };

  const handleAiClick = useCallback(async () => {
    stopPreview();
    const seedEvents = currentValue.events.filter(
      event => event.tick <= numSeedEvents
    );
    const onError = (e: Error) => {
      console.error(e);
      setGenerateState('error');
    };
    generatePattern(
      seedEvents,
      numSeedEvents,
      numEvents - numSeedEvents,
      aiTemperature / 10,
      newEvents => {
        const delayDuration = Number(appConfig.getValue('ai-delay')) || 0;
        delay(delayDuration).then(() => {
          currentValue.events = newEvents;
          onChange(currentValue);
          setGenerateState('none');
          playPreview();
        });
      },
      onError
    );
    setGenerateState('generating');
  }, [currentValue, onChange, aiTemperature, stopPreview, playPreview]);

  const aiTemperatureMin = 5;
  const aiTemperatureMax = 20;

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
      <select value={currentValue.instrument} onChange={handleFolderChange}>
        {availableKits.map(folder => (
          <option key={folder.id} value={folder.id}>
            {folder.name}
          </option>
        ))}
      </select>

      <LoadingOverlay
        show={isLoading || generateState === 'generating'}
        delayAppearance={generateState === 'generating'}
      />

      <div className={styles.body}>
        {userCompletedTask === 'none' && (
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
        {userCompletedTask === 'drawnDrums' && (
          <div className={styles.helpContainer}>
            <div
              className={classNames(
                styles.help,
                styles.helpGenerate,
                generateState === 'error' && styles.helpGenerateError
              )}
            >
              Click this button and A.I. will generate more drums based on what
              you started.
              {generateState === 'error' && (
                <div className={styles.errorMessage}>
                  <br />
                  Something went wrong. Try again.
                </div>
              )}
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
        {userCompletedTask === 'generated' && generateState === 'error' && (
          <div className={styles.helpContainer}>
            <div
              className={classNames(
                styles.help,
                styles.helpError,
                styles.errorMessage
              )}
            >
              Something went wrong. Try again.
            </div>
          </div>
        )}

        <div className={styles.leftArea}>
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
                {arrayOfTicks
                  .filter(
                    tick =>
                      (userCompletedTask === 'generated' &&
                        generateState === 'none') ||
                      tick < 9
                  )
                  .map(tick => {
                    return (
                      <div
                        className={classNames(
                          styles.outerCell,
                          tick === currentPreviewTick &&
                            generateState === 'none' &&
                            styles.outerCellPlaying
                        )}
                        onClick={() => toggleEvent(tick, index)}
                        key={tick}
                      >
                        <div className={getCellClasses(note || index, tick)} />
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
              MusicRegistry.hideAiTemperature && styles.botAreaGap,
              ['drawnDrums', 'generated'].includes(userCompletedTask) &&
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
              alt=""
              draggable={false}
            />
            {!MusicRegistry.hideAiTemperature && (
              <div>
                <div className={styles.temperatureText}>{aiTemperature}</div>
                <div className={styles.temperatureRow}>
                  <div
                    className={styles.temperatureButton}
                    onClick={() => {
                      if (aiTemperature - 1 >= aiTemperatureMin) {
                        setAiTemperature(aiTemperature - 1);
                      }
                    }}
                  >
                    <FontAwesomeV6Icon iconName={'minus'} iconStyle="solid" />
                  </div>
                  <input
                    type="range"
                    min={aiTemperatureMin}
                    max={aiTemperatureMax}
                    step={1}
                    value={aiTemperature}
                    onChange={event => {
                      setAiTemperature(event.target.valueAsNumber);
                    }}
                    className={styles.temperatureInput}
                  />
                  <div
                    className={styles.temperatureButton}
                    onClick={() => {
                      if (aiTemperature + 1 <= aiTemperatureMax) {
                        setAiTemperature(aiTemperature + 1);
                      }
                    }}
                  >
                    <FontAwesomeV6Icon iconName={'plus'} iconStyle="solid" />
                  </div>
                </div>
              </div>
            )}
            <Button
              ariaLabel={musicI18n.generate()}
              text={musicI18n.generate()}
              onClick={handleAiClick}
              disabled={generateState === 'generating'}
              type="primary"
              size="s"
              className={styles.button}
            />
          </div>
        </div>
      </div>

      <PreviewControls
        enabled={currentValue.events.length > 0}
        playPreview={playPreview}
        onClickClear={onClear}
        cancelPreviews={stopPreview}
        isPlayingPreview={currentPreviewTick > 0}
      />
    </div>
  );
};

export default PatternAiPanel;
