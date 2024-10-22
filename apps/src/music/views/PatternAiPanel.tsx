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

const arrowImage = require(`@cdo/static/music/music-callout-arrow.png`);

import {Button} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {useInterval} from '@cdo/apps/util/useInterval';

import {generatePattern} from '../ai/patternAi';
import appConfig from '../appConfig';
import musicI18n from '../locale';
import MusicRegistry from '../MusicRegistry';
import {InstrumentEventValue} from '../player/interfaces/InstrumentEvent';
import MusicLibrary from '../player/MusicLibrary';

import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import styles from './patternAiPanel.module.scss';

const numEvents = 32;
const numSeedEvents = 8;

// Generate an array containing tick numbers from 1..numEvents.
const arrayOfTicks = Array.from({length: numEvents}, (_, i) => i + 1);

type UserCompletedTaskType =
  | 'none'
  | 'drawnDrums'
  | 'changedTemperature'
  | 'generated';

type GenerateStateType = 'none' | 'generating' | 'error';

const defaultAiTemperature = 8;

interface HelpProps {
  userCompletedTask: UserCompletedTaskType;
  generateState: GenerateStateType;
  eventsLength: number;
}

const Help: React.FunctionComponent<HelpProps> = ({
  userCompletedTask,
  generateState,
  eventsLength,
}) => {
  const clickDrumsText = [
    musicI18n.patternAiClickDrums(),
    musicI18n.patternAiClickDrums3(),
    musicI18n.patternAiClickDrums2(),
    musicI18n.patternAiClickDrums1(),
  ][eventsLength];

  return (
    <div>
      {userCompletedTask === 'none' && (
        <div className={styles.helpContainer}>
          <div className={classNames(styles.help, styles.helpDrawDrums)}>
            {clickDrumsText}
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
      {userCompletedTask === 'drawnDrums' &&
        MusicRegistry.showAiTemperatureExplanation && (
          <div className={styles.helpContainer}>
            <div className={classNames(styles.help, styles.helpTemperature)}>
              {musicI18n.patternAiTemperature()}
            </div>
            <div
              className={classNames(
                styles.arrowContainer,
                styles.arrowContainerTemperature
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
      {(userCompletedTask === 'changedTemperature' ||
        (userCompletedTask === 'drawnDrums' &&
          !MusicRegistry.showAiTemperatureExplanation)) && (
        <div className={styles.helpContainer}>
          <div className={classNames(styles.help, styles.helpGenerate)}>
            {userCompletedTask === 'changedTemperature'
              ? musicI18n.patternAiGenerateTemperature()
              : musicI18n.patternAiGenerate()}
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
      {generateState === 'generating' && (
        <div className={styles.helpContainer}>
          <div className={classNames(styles.help, styles.helpGenerating)}>
            {musicI18n.patternAiGenerating()}
          </div>
        </div>
      )}
      {generateState === 'error' && (
        <div className={styles.helpContainer}>
          <div
            className={classNames(
              styles.help,
              styles.helpError,
              styles.errorMessage
            )}
          >
            {musicI18n.patternAiGenerateError()}
          </div>
        </div>
      )}
    </div>
  );
};

interface PatternAiPanelProps {
  initValue: InstrumentEventValue;
  onChange: (value: InstrumentEventValue) => void;
}

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
  const currentValue: InstrumentEventValue = JSON.parse(
    JSON.stringify(initValue)
  );

  const [aiTemperature, setAiTemperature] = useState(defaultAiTemperature);

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

  const getOuterCellClasses = (tick: number) => {
    return classNames(
      styles.outerCell,
      tick === currentPreviewTick &&
        generateState === 'none' &&
        styles.outerCellPlaying,
      generateState === 'generating' &&
        tick === generatingScanStep &&
        styles.outerCellScanning,
      generateState === 'generating' &&
        tick !== generatingScanStep &&
        styles.outerCellSlowFade,
      tick % 4 === 0 && styles.outerCellFourth
    );
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

  // Report analytics when the panel first opens.
  useEffect(() => {
    MusicRegistry.analyticsReporter.onOpenPatternAiPanel();
  }, []);

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
    if (
      generateState === 'generating' ||
      currentValue.events.some(event => event.tick >= 9)
    ) {
      setUserCompletedTask('generated');
    } else if (
      MusicRegistry.showAiTemperatureExplanation &&
      aiTemperature !== defaultAiTemperature
    ) {
      if (userCompletedTask === 'drawnDrums') {
        setUserCompletedTask('changedTemperature');
      }
    } else if (currentValue.events.length >= 4) {
      if (userCompletedTask === 'none') {
        setUserCompletedTask('drawnDrums');
      }
    }
  }, [generateState, currentValue.events, userCompletedTask, aiTemperature]);

  const startPreview = useCallback(
    (value: InstrumentEventValue) => {
      MusicRegistry.player.previewNotes(
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
    const startTime = Date.now();
    generatePattern(
      seedEvents,
      numSeedEvents,
      numEvents - numSeedEvents,
      aiTemperature / 10,
      newEvents => {
        const elapsedTime = Date.now() - startTime;
        const delayDuration = Number(appConfig.getValue('ai-delay')) || 2500;
        const remainingDelayDuration = Math.max(delayDuration - elapsedTime, 0);
        delay(remainingDelayDuration).then(() => {
          currentValue.events = newEvents;
          onChange(currentValue);
          setGenerateState('none');
          playPreview();
        });
      },
      onError
    );
    setGenerateState('generating');
    setGeneratingScanStep(0);
  }, [currentValue, onChange, aiTemperature, stopPreview, playPreview]);

  const [generatingScanStep, setGeneratingScanStep] = useState(0);
  useInterval(() => {
    if (generateState === 'generating' && generatingScanStep <= 8) {
      setGeneratingScanStep(generatingScanStep + 1);
    }
  }, 100);

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
      <LoadingOverlay
        show={isLoading || generateState === 'generating'}
        delayAppearance={generateState === 'generating'}
      />

      <div className={styles.body}>
        <Help
          userCompletedTask={userCompletedTask}
          generateState={generateState}
          eventsLength={currentValue.events.length}
        />

        <div className={styles.leftArea}>
          <div className={styles.topRow}>
            <select
              value={currentValue.instrument}
              onChange={handleFolderChange}
              className={styles.select}
            >
              {availableKits.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>

            <PreviewControls
              enabled={currentValue.events.length > 0}
              playPreview={playPreview}
              onClickClear={onClear}
              cancelPreviews={stopPreview}
              isPlayingPreview={currentPreviewTick > 0}
            />
          </div>

          <div className={styles.patternArea}>
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
                          className={getOuterCellClasses(tick)}
                          onClick={() => toggleEvent(tick, index)}
                          key={tick}
                        >
                          <div
                            className={getCellClasses(note || index, tick)}
                          />
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.rightArea}>
          <div
            className={classNames(
              styles.botArea,
              MusicRegistry.hideAiTemperature && styles.botAreaGap,
              ['drawnDrums', 'changedTemperature', 'generated'].includes(
                userCompletedTask
              ) && styles.botAreaVisible
            )}
          >
            <img
              src={aiBotImage}
              className={classNames(
                styles.aiBot,
                generateState === 'generating' && styles.aiBotGenerating
              )}
              alt=""
              draggable={false}
            />
            {!MusicRegistry.hideAiTemperature && (
              <div>
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
              color="white"
              size="s"
              className={styles.button}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternAiPanel;
