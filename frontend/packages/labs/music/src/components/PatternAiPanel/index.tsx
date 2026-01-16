import classNames from 'classnames';
import type {ChangeEvent, FunctionComponent} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import FocusLock from 'react-focus-lock';

import {Button} from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Slider from '@code-dot-org/component-library/slider';
import {BodyFourText} from '@code-dot-org/component-library/typography';

import imgAiBot0 from '../../assets/ai/ai-bot-0.png';
import imgAiBot1 from '../../assets/ai/ai-bot-1.png';
import imgAiBot2 from '../../assets/ai/ai-bot-2.png';
import imgAiBot3 from '../../assets/ai/ai-bot-3.png';
import imgAiBotGenerating0 from '../../assets/ai/ai-bot-generating-0.png';
import imgAiBotGenerating1 from '../../assets/ai/ai-bot-generating-1.png';
import imgAiBotGenerating2 from '../../assets/ai/ai-bot-generating-2.png';
import imgArrow from '../../assets/music-callout-arrow.png';

import {useInterval} from '@code-dot-org/lab/hooks';

import {generatePattern} from '../../ai/patternAi';
import appConfig from '../../appConfig';
import {
  PATTERN_AI_NUM_EVENTS,
  PATTERN_AI_NUM_SEED_EVENTS,
} from '../../constants';
import MusicRegistry from '../../MusicRegistry';
import type {InstrumentEventValue} from '../../player/interfaces/InstrumentEvent';
import MusicLibrary from '../../player/MusicLibrary';

import LoadingOverlay from '../LoadingOverlay';
import PreviewControls from '../PreviewControls';

import styles from './patternAiPanel.module.scss';

const aiBotImages = [imgAiBot0, imgAiBot1, imgAiBot2, imgAiBot3];

const aiBotGeneratingImages = [
  imgAiBotGenerating0,
  imgAiBotGenerating1,
  imgAiBotGenerating2,
];

// Generate an array containing tick numbers from 1..PATTERN_AI_NUM_EVENTS.
const arrayOfTicks = Array.from(
  {length: PATTERN_AI_NUM_EVENTS},
  (_, i) => i + 1,
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

const Help: FunctionComponent<HelpProps> = ({
  userCompletedTask,
  generateState,
  generatingScanStep,
  eventsLength,
  isPlaying,
  shouldShowGenerateAgainHelp,
}) => {
  const clickDrumsTexts = [
    'Click to set up the start of your drums.',
    'Click to set up the start of your drums.\nThree more!',
    'Click to set up the start of your drums.\nTwo to go!',
    'Click to set up the start of your drums.\nOne more to go!',
  ];

  const clickDrumsText =
    eventsLength < clickDrumsTexts.length && clickDrumsTexts[eventsLength];

  return (
    <>
      {userCompletedTask === 'none' && clickDrumsText && (
        <div className={styles.helpContainer}>
          <div className={classNames(styles.help, styles.helpDrawDrums)}>
            <BodyFourText>{clickDrumsText}</BodyFourText>
          </div>
          <div
            className={classNames(
              styles.arrowContainer,
              styles.arrowContainerDrawDrums,
            )}
          >
            <div
              id="callout-arrow"
              className={classNames(styles.arrow, styles.arrowLeft)}
            >
              <img src={imgArrow} alt="" />
            </div>
          </div>
        </div>
      )}
      {userCompletedTask === 'drawnDrums' &&
        MusicRegistry.showAiTemperatureExplanation && (
          <div className={styles.helpContainer}>
            <div className={classNames(styles.help, styles.helpTemperature)}>
              Move this slider to adjust the temperature.
            </div>
            <div
              className={classNames(
                styles.arrowContainer,
                styles.arrowContainerTemperature,
              )}
            >
              <div
                id="callout-arrow"
                className={classNames(styles.arrow, styles.arrowRight)}
              >
                <img src={imgArrow} alt="" />
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
                : styles.helpGenerate,
            )}
          >
            <BodyFourText>
              {userCompletedTask === 'changedTemperature'
                ? 'Click this button and A.I. will generate more drums based on this temperature.'
                : 'Click this button and A.I. will generate more drums based on what you started.'}
            </BodyFourText>
          </div>
          <div
            className={classNames(
              styles.arrowContainer,
              MusicRegistry.hideAiTemperature
                ? styles.arrowContainerGenerateNoTemperature
                : styles.arrowContainerGenerate,
            )}
          >
            <div
              id="callout-arrow"
              className={classNames(styles.arrow, styles.arrowRight)}
            >
              <img src={imgArrow} alt="" />
            </div>
          </div>
        </div>
      )}
      {generateState === 'generating' &&
        generatingScanStep > numberScanStepsBeforeHelpText && (
          <div className={styles.helpContainer}>
            <div className={classNames(styles.help, styles.helpGenerating)}>
              <BodyFourText>
                A.I. is generating more drums based on what you started.
              </BodyFourText>
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
                  : styles.helpGenerateAgain,
              )}
            >
              Click this button again and A.I. will generate a different
              variation.
            </div>
            <div
              className={classNames(
                styles.arrowContainer,
                MusicRegistry.hideAiTemperature
                  ? styles.arrowContainerGenerateAgainNoTemperature
                  : styles.arrowContainerGenerateAgain,
              )}
            >
              <div
                id="callout-arrow"
                className={classNames(styles.arrow, styles.arrowRight)}
              >
                <img src={imgArrow} alt="" />
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
              styles.errorMessage,
            )}
          >
            Something went wrong. Try again.
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
const PatternAiPanel: FunctionComponent<PatternAiPanelProps> = ({
  initValue,
  onChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const parsedInitValue = JSON.parse(JSON.stringify(initValue));
  const currentValue = useRef<InstrumentEventValue>(parsedInitValue);
  const [currentEvents, setCurrentEvents] = useState<
    InstrumentEventValue['events']
  >(parsedInitValue.events);
  const [currentInstrument, setCurrentInstrument] = useState<
    InstrumentEventValue['instrument']
  >(parsedInitValue.instrument);

  const [aiTemperature, setAiTemperature] = useState(defaultAiTemperature);

  const hasGeneratedEvents = useMemo(
    () => currentEvents.some(event => event.tick > PATTERN_AI_NUM_SEED_EVENTS),
    [currentEvents],
  );

  // Count generates so that we can show the "generate again" help after
  // the first generate, but not beyond that.
  // If the panel starts with generated events, presume that the user
  // has already generated twice, so that we won't show that help.
  const [generateCount, setGenerateCount] = useState(
    hasGeneratedEvents ? 2 : 0,
  );

  const availableKits = useMemo(() => {
    return MusicLibrary.getInstance()?.kits || [];
  }, []);

  const [userCompletedTask, setUserCompletedTask] =
    useState<UserCompletedTaskType>('none');
  const [generateState, setGenerateState] = useState<GenerateStateType>('none');

  const [generatingScanStep, setGeneratingScanStep] = useState(0);

  const currentFolder = useMemo(() => {
    // Default to the first available kit if the current kit is not found in this library.
    return (
      availableKits.find(kit => kit.id === currentInstrument) ||
      availableKits[0]
    );
  }, [availableKits, currentInstrument]);
  const [currentPreviewTick, setCurrentPreviewTick] = useState(0);

  const updateCurrentInstrument = useCallback(
    (instrument: string) => {
      currentValue.current.instrument = instrument;
      setCurrentInstrument(instrument);

      if (!MusicRegistry.player.isInstrumentLoaded(instrument)) {
        setIsLoading(true);
        if (MusicRegistry.player.isInstrumentLoading(instrument)) {
          // If the instrument is already loading, register a callback and wait for it to finish.
          MusicRegistry.player.registerCallback('InstrumentLoaded', kit => {
            if (kit === instrument) {
              setIsLoading(false);
            }
          });
        } else {
          // Otherwise, initiate the load.
          MusicRegistry.player.setupSampler(instrument, () =>
            setIsLoading(false),
          );
        }
      }
    },
    [setCurrentInstrument, currentValue],
  );

  const previewNote = useCallback(
    (note: number) => {
      // Don't preview the note if we're previewing the whole pattern
      if (currentPreviewTick > 0) {
        return;
      }

      MusicRegistry.player.previewNote(note, currentInstrument);
    },
    [currentInstrument, currentPreviewTick],
  );

  const hasEvent = (note: number, tick: number) => {
    const element = currentEvents.find(
      event => event.note === note && event.tick === tick,
    );
    return !!element;
  };

  const handleFolderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateCurrentInstrument(event.target.value);
    onChange(currentValue.current);
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
      tick % 4 === 0 && !isLastColumnShowing && styles.outerCellFourth,
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
        styles.innerCellSlowFade,
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
      isPlaying && styles.cellPlaying,
    );
  };

  const onClear = useCallback(() => {
    currentValue.current.events = [];
    setCurrentEvents([]);
    onChange(currentValue.current);
  }, [onChange, currentValue]);

  useEffect(() => {}, [currentInstrument, setIsLoading]);

  // Tracks the tasks completed by the user.
  const updateGenerateState = useCallback(
    (state: GenerateStateType) => {
      if (state === 'generating' || hasGeneratedEvents) {
        setUserCompletedTask('generated');
      } else if (
        MusicRegistry.showAiTemperatureExplanation &&
        aiTemperature !== defaultAiTemperature
      ) {
        if (userCompletedTask === 'drawnDrums') {
          setUserCompletedTask('changedTemperature');
        }
      } else if (currentEvents.length >= 4) {
        if (userCompletedTask === 'none') {
          setUserCompletedTask('drawnDrums');
        }
      }
      setGenerateState(state);
    },
    [
      hasGeneratedEvents,
      setGenerateState,
      currentEvents,
      userCompletedTask,
      setUserCompletedTask,
      aiTemperature,
    ],
  );

  const toggleEvent = useCallback(
    (tick: number, note: number) => {
      const index = currentEvents.findIndex(
        event => event.note === note && event.tick === tick,
      );
      if (index !== -1) {
        // If found, delete.
        currentEvents.splice(index, 1);
      } else {
        // Not found, so add.
        currentEvents.push({tick, note});
        previewNote(note);
      }

      currentValue.current.events = [...currentEvents];
      setCurrentEvents(currentValue.current.events);
      updateGenerateState();
      onChange(currentValue.current);
    },
    [
      onChange,
      currentEvents,
      previewNote,
      setCurrentEvents,
      updateGenerateState,
    ],
  );

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
        },
      );
    },
    [setCurrentPreviewTick],
  );

  const playPreview = useCallback(() => {
    startPreview(currentValue.current);
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
    const seedEvents = currentValue.current.events.filter(
      event => event.tick <= PATTERN_AI_NUM_SEED_EVENTS,
    );

    const onError = (e: Error) => {
      console.error(e);
      updateGenerateState('error');
    };

    stopPreview();

    currentValue.current.events = currentValue.current.events.filter(
      event => event.tick <= PATTERN_AI_NUM_SEED_EVENTS,
    );
    setCurrentEvents([...currentValue.current.events]);
    onChange(currentValue.current);

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
            JSON.stringify(currentValue.current),
          );
          newValue.events = newEvents;

          onChange(newValue);
          updateGenerateState('none');
          startPreview(newValue);
        });
      },
      onError,
    );
    updateGenerateState('generating');
    setGeneratingScanStep(1);
    setGenerateCount(generateCount + 1);
  }, [
    currentValue,
    updateGenerateState,
    onChange,
    aiTemperature,
    stopPreview,
    generateCount,
    startPreview,
  ]);

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
            aiBotImages.length,
        ),
        aiBotImages.length - 1,
      );
      return aiBotImages[aiBotImageIndex];
    }
  };

  const aiBotImage = getAiBotImage();
  const showBotArea = [
    'drawnDrums',
    'changedTemperature',
    'generated',
  ].includes(userCompletedTask);

  return (
    <FocusLock className={styles.focusContainer}>
      <div className={styles.patternPanel} dir="ltr">
        <LoadingOverlay show={isLoading} />

        <div
          className={classNames(
            styles.body,
            generateState === 'generating' && styles.bodyGenerating,
          )}
        >
          <Help
            userCompletedTask={userCompletedTask}
            generateState={generateState}
            generatingScanStep={generatingScanStep}
            eventsLength={currentEvents.length}
            isPlaying={!!currentPreviewTick}
            shouldShowGenerateAgainHelp={generateCount === 1}
          />

          <div className={styles.leftArea}>
            <div className={styles.topRow}>
              <SimpleDropdown
                name="instrument-dropdown"
                labelText=""
                isLabelVisible={false}
                selectedValue={currentInstrument}
                onChange={handleFolderChange}
                size="s"
                items={availableKits.map(folder => ({
                  value: folder.id,
                  text: folder.name,
                }))}
              />

              <div className={styles.previewControls}>
                <PreviewControls
                  enabled={currentEvents.length > 0}
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
                        <BodyFourText>
                          <span
                            className={styles.name}
                            onClick={() => previewNote(note || index)}
                          >
                            {name}
                          </span>
                        </BodyFourText>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.patternArea}>
                {currentFolder.sounds.map(({note}, index) => {
                  return (
                    <div className={styles.row} key={note}>
                      {arrayOfTicks
                        .filter(
                          tick =>
                            (userCompletedTask === 'generated' &&
                              generateState === 'none') ||
                            tick <= PATTERN_AI_NUM_SEED_EVENTS,
                        )
                        .map(tick => {
                          return (
                            <div
                              className={getOuterCellClasses(tick)}
                              onClick={() => toggleEvent(tick, index)}
                              key={tick}
                              role="button"
                              tabIndex={0}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  toggleEvent(tick, index);
                                  e.preventDefault();
                                }
                              }}
                            >
                              <div className={getInnerCellClasses(tick)}>
                                <div
                                  className={getCellClasses(
                                    note || index,
                                    tick,
                                  )}
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
                showBotArea && styles.botAreaVisible,
              )}
            >
              <img
                src={aiBotImage}
                className={classNames(
                  styles.aiBot,
                  generateState === 'generating' && styles.aiBotGenerating,
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
                        tabIndex: showBotArea ? 0 : -1,
                      }}
                      rightButtonProps={{
                        icon: {iconName: 'plus', title: 'Increase'},
                        ['aria-label']: 'Increase',
                        tabIndex: showBotArea ? 0 : -1,
                      }}
                      hideValue={true}
                      color="aqua"
                      tabIndex={showBotArea ? 0 : -1} // Only allow tabbing to the slider when the bot area is visible
                    />
                  </div>
                </div>
              )}
              <Button
                ariaLabel="Generate"
                text="Generate"
                onClick={handleAiClick}
                disabled={generateState === 'generating'}
                type="primary"
                color="white"
                size="s"
                className={styles.button}
                tabIndex={showBotArea ? 0 : -1} // Only allow tabbing to the button when the bot area is visible
              />
            </div>
          </div>
        </div>
      </div>
    </FocusLock>
  );
};

export default PatternAiPanel;
