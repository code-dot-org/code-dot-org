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

const aiBotGeneratingImages = [
  require(`@cdo/static/music/ai/ai-bot-generating-0.png`),
  require(`@cdo/static/music/ai/ai-bot-generating-1.png`),
  require(`@cdo/static/music/ai/ai-bot-generating-2.png`),
];

const arrowImage = require(`@cdo/static/music/music-callout-arrow.png`);

import {Button} from '@cdo/apps/componentLibrary/button';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Slider from '@cdo/apps/componentLibrary/slider/Slider';
import {useInterval} from '@cdo/apps/util/useInterval';

import {generatePattern} from '../ai/patternAi';
import appConfig from '../appConfig';
import {PATTERN_AI_NUM_EVENTS, PATTERN_AI_NUM_SEED_EVENTS} from '../constants';
import musicI18n from '../locale';
import MusicRegistry from '../MusicRegistry';
import {InstrumentEventValue} from '../player/interfaces/InstrumentEvent';
import MusicLibrary from '../player/MusicLibrary';

import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import styles from './patternAiPanel.module.scss';

// Generate an array containing tick numbers from 1..PATTERN_AI_NUM_EVENTS.
const arrayOfTicks = Array.from(
  {length: PATTERN_AI_NUM_EVENTS},
  (_, i) => i + 1
);

type UserCompletedTaskType =
  | 'none'
  | 'drawnDrums'
  | 'changedTemperature'
  | 'generated';

type GenerateStateType = 'none' | 'generating' | 'error';

const defaultAiTemperature = 8;

// When generating, generatingScanStep goes from 1 upwards.  The first
// PATTERN_AI_NUM_SEED_EVENTS of these values lights up a seed column, and the
// remainder give a little delay before the generating help text is shown.
const numberScanStepsBeforeHelpText = PATTERN_AI_NUM_SEED_EVENTS + 9;

interface HelpProps {
  userCompletedTask: UserCompletedTaskType;
  generateState: GenerateStateType;
  generatingScanStep: number;
  eventsLength: number;
  isPlaying: boolean;
  shouldShowGenerateAgainHelp: boolean;
}

const Help: React.FunctionComponent<HelpProps> = ({
  userCompletedTask,
  generateState,
  generatingScanStep,
  eventsLength,
  isPlaying,
  shouldShowGenerateAgainHelp,
}) => {
  const clickDrumsTexts = [
    musicI18n.patternAiClickDrums(),
    musicI18n.patternAiClickDrums3(),
    musicI18n.patternAiClickDrums2(),
    musicI18n.patternAiClickDrums1(),
  ];

  const clickDrumsText =
    eventsLength < clickDrumsTexts.length && clickDrumsTexts[eventsLength];

  return (
    <>
      {userCompletedTask === 'none' && clickDrumsText && (
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
          <div
            className={classNames(
              styles.help,
              MusicRegistry.hideAiTemperature
                ? styles.helpGenerateNoTemperature
                : styles.helpGenerate
            )}
          >
            {userCompletedTask === 'changedTemperature'
              ? musicI18n.patternAiGenerateTemperature()
              : musicI18n.patternAiGenerate()}
          </div>
          <div
            className={classNames(
              styles.arrowContainer,
              MusicRegistry.hideAiTemperature
                ? styles.arrowContainerGenerateNoTemperature
                : styles.arrowContainerGenerate
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
      {generateState === 'generating' &&
        generatingScanStep > numberScanStepsBeforeHelpText && (
          <div className={styles.helpContainer}>
            <div className={classNames(styles.help, styles.helpGenerating)}>
              {musicI18n.patternAiGenerating()}
            </div>
            <div className={styles.generatingSpinner}>
              <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
            </div>
          </div>
        )}
      {generateState === 'none' &&
        MusicRegistry.showAiGenerateAgainHelp &&
        userCompletedTask === 'generated' &&
        !isPlaying &&
        shouldShowGenerateAgainHelp && (
          <div className={styles.helpContainer}>
            <div
              className={classNames(
                styles.help,
                MusicRegistry.hideAiTemperature
                  ? styles.helpGenerateAgainNoTemperature
                  : styles.helpGenerateAgain
              )}
            >
              {musicI18n.patternAiGenerateAgain()}
            </div>
            <div
              className={classNames(
                styles.arrowContainer,
                MusicRegistry.hideAiTemperature
                  ? styles.arrowContainerGenerateAgainNoTemperature
                  : styles.arrowContainerGenerateAgain
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
    </>
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

  const hasGeneratedEvents = currentValue.events.some(
    event => event.tick > PATTERN_AI_NUM_SEED_EVENTS
  );

  // Count generates so that we can show the "generate again" help after
  // the first generate, but not beyond that.
  // If the panel starts with generated events, presume that the user
  // has already generated twice, so that we won't show that help.
  const [generateCount, setGenerateCount] = useState(
    hasGeneratedEvents ? 2 : 0
  );

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

  const previewNote = useCallback(
    (note: number) => {
      // Don't preview the note if we're previewing the whole pattern
      if (currentPreviewTick > 0) {
        return;
      }

      MusicRegistry.player.previewNote(note, currentValue.instrument);
    },
    [currentValue.instrument, currentPreviewTick]
  );

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
        previewNote(note);
      }

      onChange(currentValue);
    },
    [onChange, currentValue, previewNote]
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
    const isLastColumnShowing =
      ((userCompletedTask === 'none' ||
        userCompletedTask === 'drawnDrums' ||
        generateState === 'generating') &&
        tick === PATTERN_AI_NUM_SEED_EVENTS) ||
      tick === PATTERN_AI_NUM_EVENTS;

    return classNames(
      styles.outerCell,
      tick % 4 === 0 && !isLastColumnShowing && styles.outerCellFourth
    );
  };

  const getInnerCellClasses = (tick: number) => {
    return classNames(
      styles.innerCell,
      tick === currentPreviewTick &&
        generateState === 'none' &&
        styles.innerCellPlaying,
      generateState === 'generating' &&
        tick === generatingScanStep &&
        styles.innerCellScanning,
      generateState === 'generating' &&
        tick !== generatingScanStep &&
        styles.innerCellSlowFade
    );
  };

  const getCellClasses = (note: number, tick: number) => {
    const isSeed = tick <= PATTERN_AI_NUM_SEED_EVENTS;
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
    if (generateState === 'generating' || hasGeneratedEvents) {
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
  }, [
    hasGeneratedEvents,
    generateState,
    currentValue.events,
    userCompletedTask,
    aiTemperature,
  ]);

  const stopPreview = useCallback(() => {
    MusicRegistry.player.cancelPreviews();
    setCurrentPreviewTick(0);
  }, []);

  const startPreview = useCallback(
    (value: InstrumentEventValue) => {
      setCurrentPreviewTick(1);
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

  const playPreview = useCallback(() => {
    startPreview(currentValue);
  }, [startPreview, currentValue]);

  // Report analytics when the panel first opens.
  useEffect(() => {
    MusicRegistry.analyticsReporter.onOpenPatternAiPanel();

    // On unmount.
    return () => {
      stopPreview();
    };
  }, [stopPreview]);

  const delay = (time: number) => {
    return new Promise(res => {
      setTimeout(res, time);
    });
  };

  const handleAiClick = useCallback(async () => {
    const seedEvents = currentValue.events.filter(
      event => event.tick <= PATTERN_AI_NUM_SEED_EVENTS
    );

    const onError = (e: Error) => {
      console.error(e);
      setGenerateState('error');
    };

    stopPreview();

    currentValue.events = currentValue.events.filter(
      event => event.tick <= PATTERN_AI_NUM_SEED_EVENTS
    );
    onChange(currentValue);

    const startTime = Date.now();
    generatePattern(
      seedEvents,
      PATTERN_AI_NUM_SEED_EVENTS,
      PATTERN_AI_NUM_EVENTS - PATTERN_AI_NUM_SEED_EVENTS,
      aiTemperature / 10,
      newEvents => {
        const elapsedTime = Date.now() - startTime;
        const delayDuration = Number(appConfig.getValue('ai-delay')) || 3500;
        const remainingDelayDuration = Math.max(delayDuration - elapsedTime, 0);
        delay(remainingDelayDuration).then(() => {
          // Make a copy of the value object so that we don't overwrite Blockly's
          // data, which we just sent to it above.
          const newValue: InstrumentEventValue = JSON.parse(
            JSON.stringify(currentValue)
          );
          newValue.events = newEvents;

          onChange(newValue);
          setGenerateState('none');
          startPreview(newValue);
        });
      },
      onError
    );
    setGenerateState('generating');
    setGeneratingScanStep(1);
    setGenerateCount(generateCount + 1);
  }, [
    currentValue,
    onChange,
    aiTemperature,
    stopPreview,
    generateCount,
    startPreview,
  ]);

  const [generatingScanStep, setGeneratingScanStep] = useState(0);
  useInterval(() => {
    if (generateState === 'generating') {
      setGeneratingScanStep(generatingScanStep + 1);
    }
  }, 100);

  const aiTemperatureMin = 5;
  const aiTemperatureMax = 20;

  const getAiBotImage = () => {
    if (
      generateState === 'generating' &&
      generatingScanStep > numberScanStepsBeforeHelpText
    ) {
      const aiBotGeneratingImageIndex =
        Math.floor(generatingScanStep / 2) % aiBotGeneratingImages.length;
      return aiBotGeneratingImages[aiBotGeneratingImageIndex];
    } else {
      const aiBotImageIndex = Math.min(
        Math.floor(
          ((aiTemperature - aiTemperatureMin) /
            (aiTemperatureMax - aiTemperatureMin)) *
            aiBotImages.length
        ),
        aiBotImages.length - 1
      );
      return aiBotImages[aiBotImageIndex];
    }
  };

  const aiBotImage = getAiBotImage();

  return (
    <div className={styles.patternPanel} dir="ltr">
      <LoadingOverlay show={isLoading} />

      <div
        className={classNames(
          styles.body,
          generateState === 'generating' && styles.bodyGenerating
        )}
      >
        <Help
          userCompletedTask={userCompletedTask}
          generateState={generateState}
          generatingScanStep={generatingScanStep}
          eventsLength={currentValue.events.length}
          isPlaying={!!currentPreviewTick}
          shouldShowGenerateAgainHelp={generateCount === 1}
        />

        <div className={styles.leftArea}>
          <div className={styles.topRow}>
            <SimpleDropdown
              name="instrument-dropdown"
              labelText=""
              isLabelVisible={false}
              selectedValue={currentValue.instrument}
              onChange={handleFolderChange}
              size="s"
              items={availableKits.map(folder => ({
                value: folder.id,
                text: folder.name,
              }))}
            />

            <div className={styles.previewControls}>
              <PreviewControls
                enabled={currentValue.events.length > 0}
                playPreview={playPreview}
                onClickClear={onClear}
                cancelPreviews={stopPreview}
                isPlayingPreview={currentPreviewTick > 0}
              />
            </div>
          </div>

          <div className={styles.editArea}>
            <div className={styles.drumArea}>
              {currentFolder.sounds.map(({name, note}, index) => {
                return (
                  <div className={styles.row} key={note}>
                    <div className={styles.nameContainer}>
                      <span
                        className={styles.name}
                        onClick={() => previewNote(note || index)}
                      >
                        {name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.patternArea}>
              {currentFolder.sounds.map(({name, note}, index) => {
                return (
                  <div className={styles.row} key={note}>
                    {arrayOfTicks
                      .filter(
                        tick =>
                          (userCompletedTask === 'generated' &&
                            generateState === 'none') ||
                          tick <= PATTERN_AI_NUM_SEED_EVENTS
                      )
                      .map(tick => {
                        return (
                          <div
                            className={getOuterCellClasses(tick)}
                            onClick={() => toggleEvent(tick, index)}
                            key={tick}
                          >
                            <div className={getInnerCellClasses(tick)}>
                              <div
                                className={getCellClasses(note || index, tick)}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
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
                  <Slider
                    name="temperature-slider"
                    minValue={aiTemperatureMin}
                    maxValue={aiTemperatureMax}
                    step={1}
                    value={aiTemperature}
                    onChange={event => {
                      setAiTemperature(+event.target.value);
                    }}
                    className={styles.temperatureInput}
                    leftButtonProps={{
                      icon: {iconName: 'minus', title: 'Decrease'},
                      ['aria-label']: 'Decrease',
                    }}
                    rightButtonProps={{
                      icon: {iconName: 'plus', title: 'Increase'},
                      ['aria-label']: 'Increase',
                    }}
                    hideValue={true}
                    color="white"
                  />
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
