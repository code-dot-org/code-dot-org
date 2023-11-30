import React, {useState, useEffect, useRef, useCallback} from 'react';
import moduleStyles from './dance-ai-modal.module.scss';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {closeAiModal, DanceState} from '../danceRedux';
import classNames from 'classnames';
import {FieldDropdown, Workspace} from 'blockly/core';
import {
  chooseEffects,
  ChooseEffectsQuality,
  getGeneratedEffectScores,
} from './DanceAiClient';
import DanceAiScore, {ScoreColors} from './DanceAiScore';
import AiVisualizationPreview from './AiVisualizationPreview';
import AiBlockPreview from './AiBlockPreview';
import {
  AiFieldValue,
  AiOutput,
  DanceAiSound,
  FieldKey,
  GeneratedEffect,
  MinMax,
} from './types';
import {
  generateAiEffectBlocks,
  generateAiEffectBlocksFromResult,
  generatePreviewCode,
  getEmojiImageUrl,
  getLabelMap,
  getRangeArray,
  lerp,
  useInterval,
} from './utils';
import color from '@cdo/apps/util/color';
const ToggleGroup = require('@cdo/apps/templates/ToggleGroup').default;
const i18n = require('../locale');

import inputLibraryJson from '@cdo/static/dance/ai/ai-inputs.json';

import aiBotMini from '@cdo/static/dance/ai/bot/ai-bot-mini.svg';
import aiBotHeadNormal from '@cdo/static/dance/ai/bot/ai-bot-head-normal.png';
import aiBotBodyNormal from '@cdo/static/dance/ai/bot/ai-bot-body-normal.png';
import aiBotHeadYes from '@cdo/static/dance/ai/bot/ai-bot-head-yes.png';
import aiBotBodyYes from '@cdo/static/dance/ai/bot/ai-bot-body-yes.png';
import aiBotBodyThink0 from '@cdo/static/dance/ai/bot/ai-bot-body-think0.png';
import aiBotBodyThink1 from '@cdo/static/dance/ai/bot/ai-bot-body-think1.png';
import aiBotBodyThink2 from '@cdo/static/dance/ai/bot/ai-bot-body-think2.png';

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import ModalButton from './ModalButton';

export enum Mode {
  INITIAL = 'initial',
  SELECT_INPUTS = 'selectInputs',
  GENERATING = 'generating',
  GENERATED = 'generated',
  RESULTS = 'results',
  EXPLANATION = 'explanation',
}

type AiModalItem = {
  id: string;
  emoji: string;
};

// Progress in the generating mode has a step and a substep.
// Each step is a now effect, while each substep shows progress for
// the generation of that effect.
type GeneratingProgress = {
  step: number;
  subStep: number;
};

type GeneratedEffects = {
  badEffects: GeneratedEffect[];
  goodEffect?: GeneratedEffect;
};

enum Toggle {
  EFFECT = 'effect',
  CODE = 'code',
}

const aiBotBodyThinkImages = [
  aiBotBodyThink0,
  aiBotBodyThink1,
  aiBotBodyThink2,
];

// How many emojis are to be selected.
const SLOT_COUNT = 3;

interface DanceAiModalProps {
  playSound: (name: DanceAiSound, options?: object) => void;
}

const DanceAiModal: React.FunctionComponent<DanceAiModalProps> = ({
  playSound,
}) => {
  const dispatch = useAppDispatch();

  // How many low-scoring results we show before the chosen one.
  const BAD_GENERATED_RESULTS_COUNT = 7;

  // How many substeps for each step in the generating mode.
  const GENERATING_SUBSTEP_COUNT = 3;

  // How long we spend in each substep in the generating mode.
  // Perform a linear interpolation from the first to the second, so
  // that we gradually speed up.
  const GENERATION_SUBSTEP_DURATION_MAX = 360;
  const GENERATION_SUBSTEP_DURATION_MIN = 360;

  // How many steps in the generated mode.
  const GENERATED_STEPS_COUNT = 3;

  // How long we spend in each step of the generated mode.
  const GENERATED_STEP_DURATION = 1500;

  // How many steps in the explanation mode.
  const EXPLANATION_STEPS_COUNT = 5;

  // How long we spend in each step of the explanation mode.
  const EXPLANATION_STEP_DURATION = 900;

  // The explanation shows the last (EXPLANATION_STEPS_COUNT-1) bad effects and the
  // one good effect.
  const EXPLANATION_START_INDEX =
    BAD_GENERATED_RESULTS_COUNT - EXPLANATION_STEPS_COUNT + 1;

  const generatedEffects = useRef<GeneratedEffects>({
    badEffects: [],
    goodEffect: undefined,
  });
  const minMaxAssociations = useRef<MinMax>({
    minIndividualScore: 0,
    maxTotalScore: 3 * SLOT_COUNT,
  });

  const [mode, setMode] = useState(Mode.INITIAL);
  const [currentInputSlot, setCurrentInputSlot] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [inputAddCount, setInputAddCount] = useState<number>(0);
  const [generatingProgress, setGeneratingProgress] =
    useState<GeneratingProgress>({
      step: 0,
      subStep: 0,
    });
  const [generatedProgress, setGeneratedProgress] = useState<number>(0);
  const [currentToggle, setCurrentToggle] = useState<Toggle>(Toggle.EFFECT);
  const [explanationProgress, setExplanationProgress] = useState<number>(0);

  const currentAiModalField = useSelector(
    (state: {dance: DanceState}) => state.dance.currentAiModalField
  );

  const aiModalOpenedFromFlyout = useSelector(
    (state: {dance: DanceState}) => state.dance.aiModalOpenedFromFlyout
  );

  const aiOutput = useSelector(
    (state: {dance: DanceState}) => state.dance.aiOutput
  );

  const getGeneratedEffect = useCallback((step: number) => {
    if (step < BAD_GENERATED_RESULTS_COUNT) {
      return generatedEffects.current.badEffects[step];
    } else if (generatedEffects.current.goodEffect) {
      return generatedEffects.current.goodEffect;
    } else {
      return undefined;
    }
  }, []);

  const getScores = useCallback(
    (useInputs: string[], step: number) => {
      const effect = getGeneratedEffect(step);
      if (effect) {
        return getGeneratedEffectScores(useInputs, effect);
      }

      return [0, 0, 0];
    },
    [getGeneratedEffect]
  );

  // Calculates the minimum individual score
  // (ie, a SINGLE emoji association with a foreground/background palette combination),
  // and a maximum total score
  // (ie, the sum of ALL selected emoji's associations with a foreground/background palette combination).
  // Used to normalize and scale the data for easier differentiation between results by the user.
  const calculateMinMax = useCallback(
    (useInputs: string[]) => {
      // The minimum individual score is selected across all generated effects (bad and good).
      const minIndividualScore = getRangeArray(
        0,
        BAD_GENERATED_RESULTS_COUNT - 1
      ).reduce((accumulator: number, currentValue: number) => {
        const scores = getScores(useInputs, currentValue);
        const min = Math.min(...scores);
        return min < accumulator ? min : accumulator;
      }, Infinity);

      // By definition, the maximum total score must come from the "good" effect.
      const goodEffectScores = getScores(
        useInputs,
        BAD_GENERATED_RESULTS_COUNT
      );
      const maxTotalScore = goodEffectScores.reduce(
        (sum, score) => (sum += score)
      );

      return {minIndividualScore, maxTotalScore};
    },
    [getScores]
  );

  // Handle the case in which the modal is created with an existing value.
  useEffect(() => {
    if (mode === Mode.INITIAL) {
      const currentValueString = currentAiModalField?.getValue();
      if (currentValueString) {
        const currentValue: AiFieldValue = JSON.parse(currentValueString);
        setMode(Mode.RESULTS);
        setInputs(currentValue.inputs);
        setGeneratingProgress({step: BAD_GENERATED_RESULTS_COUNT, subStep: 0});

        generatedEffects.current = {
          badEffects: getRangeArray(0, BAD_GENERATED_RESULTS_COUNT - 1).map(
            () => chooseEffects(currentValue.inputs, ChooseEffectsQuality.BAD)
          ),
          goodEffect: currentValue,
        };

        minMaxAssociations.current = calculateMinMax(currentValue.inputs);
      } else {
        setTimeout(() => {
          setMode(Mode.SELECT_INPUTS);
        }, 500);
      }
    }
  }, [currentAiModalField, mode, calculateMinMax]);

  const getLabels = () => {
    const tempWorkspace = new Workspace();
    const blocksSvg = generateAiEffectBlocks(tempWorkspace);

    const foregroundLabels = getLabelMap(
      blocksSvg[0].getField('EFFECT') as FieldDropdown
    );
    const backgroundLabels = getLabelMap(
      blocksSvg[1].getField('EFFECT') as FieldDropdown
    );
    const paletteLabels = getLabelMap(
      blocksSvg[1].getField('PALETTE') as FieldDropdown
    );

    tempWorkspace.dispose();

    return {
      [FieldKey.FOREGROUND_EFFECT]: foregroundLabels,
      [FieldKey.BACKGROUND_EFFECT]: backgroundLabels,
      [FieldKey.BACKGROUND_PALETTE]: paletteLabels,
    };
  };

  const getAllItems = () => {
    return inputLibraryJson.items.map(item => {
      return {
        ...item,
        available: !inputs.includes(item.id),
      };
    });
  };

  const getItem = (id: string) =>
    inputLibraryJson.items.find(item => item.id === id);

  const handleItemClick = (id: string, available: boolean) => {
    if (available) {
      // Add item inputs.
      if (currentInputSlot < SLOT_COUNT) {
        setInputs([...inputs, id]);
        setCurrentInputSlot(currentInputSlot + 1);
        setInputAddCount(inputAddCount + 1);

        playSound('ai-select-emoji');
      }
    } else {
      // Remove item from inputs.
      setInputs(inputs.filter(input => input !== id));
      setCurrentInputSlot(currentInputSlot - 1);

      playSound('ai-deselect-emoji');
    }
  };

  const handleGenerateClick = (
    _: React.SyntheticEvent,
    regenerating = false
  ) => {
    startAi();

    if (!regenerating) {
      analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_GENERATED, {
        emojis: inputs,
      });
    }

    setMode(Mode.GENERATING);
  };

  const handleStartOverClick = () => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_RESTARTED, {
      emojis: inputs,
    });
    setInputs([]);
    setCurrentInputSlot(0);
    setGeneratingProgress({step: 0, subStep: 0});
    setGeneratedProgress(0);
    setMode(Mode.SELECT_INPUTS);
  };

  const handleRegenerateClick = (e: React.SyntheticEvent) => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_REGENERATED, {
      emojis: inputs,
    });
    setGeneratingProgress({step: 0, subStep: 0});
    setGeneratedProgress(0);
    setCurrentToggle(Toggle.EFFECT);
    handleGenerateClick(e, true);
  };

  const handleExplanationClick = () => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_EXPLAINED, {
      emojis: inputs,
    });
    setGeneratedProgress(0);
    setExplanationProgress(0);
    setMode(Mode.EXPLANATION);
  };

  const handleUseClick = () => {
    if (!generatedEffects.current.goodEffect) {
      // Effect should exist when Use is clicked
      return;
    }
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_USED, {
      emojis: inputs,
      ...generatedEffects.current.goodEffect,
    });
    const currentValue: AiFieldValue = {
      inputs,
      ...generatedEffects.current.goodEffect,
    };
    currentAiModalField?.setValue(JSON.stringify(currentValue));
    onClose();
  };

  const handleLeaveExplanation = () => {
    setMode(Mode.RESULTS);
  };

  // One-shot update of step & substep.
  const updateGeneratingProgress = (progress: GeneratingProgress) => {
    // Do a deep copy into a new object to ensure that a re-render
    // is triggered at the end of this work.
    const currentProgress: GeneratingProgress = {
      ...progress,
    };

    if (currentProgress.subStep < GENERATING_SUBSTEP_COUNT - 1) {
      // Bump substep.
      currentProgress.subStep++;
    } else if (currentProgress.step < BAD_GENERATED_RESULTS_COUNT) {
      // Bump step and reset substep.
      currentProgress.step++;
      currentProgress.subStep = 0;
    }

    return currentProgress;
  };

  // Handle moments when we should play a sound or do another action.
  useEffect(() => {
    if (mode === Mode.GENERATING && generatingProgress.subStep === 0) {
      if (generatingProgress.step < BAD_GENERATED_RESULTS_COUNT) {
        playSound('ai-generate-no', {volume: 0.2});
      } else {
        setMode(Mode.GENERATED);
      }
    } else if (mode === Mode.GENERATED) {
      if (generatedProgress === 0) {
        playSound('ai-generate-yes', {volume: 0.2});
      } else if (generatedProgress === GENERATED_STEPS_COUNT - 1) {
        setMode(Mode.RESULTS);
      }
    } else if (mode === Mode.EXPLANATION) {
      if (explanationProgress < EXPLANATION_STEPS_COUNT - 1) {
        playSound('ai-generate-no', {volume: 0.2});
      } else {
        playSound('ai-generate-yes', {volume: 0.2});
      }
    }
  }, [
    generatingProgress,
    generatedProgress,
    explanationProgress,
    mode,
    playSound,
  ]);

  const getGeneratingStepDuration = () => {
    return lerp(
      generatingProgress.step,
      BAD_GENERATED_RESULTS_COUNT,
      GENERATION_SUBSTEP_DURATION_MAX,
      GENERATION_SUBSTEP_DURATION_MIN
    );
  };

  // Animate through the generating or explanation process.
  useInterval(
    () => {
      if (mode === Mode.GENERATING) {
        setGeneratingProgress(updateGeneratingProgress);
      } else if (mode === Mode.GENERATED) {
        if (generatedProgress < GENERATED_STEPS_COUNT - 1) {
          setGeneratedProgress(progress => progress + 1);
        }
      } else if (mode === Mode.EXPLANATION) {
        if (explanationProgress < EXPLANATION_STEPS_COUNT - 1) {
          setExplanationProgress(progress => progress + 1);
        }
      }
    },
    mode === Mode.GENERATING
      ? getGeneratingStepDuration()
      : mode === Mode.GENERATED
      ? GENERATED_STEP_DURATION
      : mode === Mode.EXPLANATION
      ? EXPLANATION_STEP_DURATION
      : undefined
  );

  const startAi = () => {
    generatedEffects.current = {
      badEffects: getRangeArray(0, BAD_GENERATED_RESULTS_COUNT - 1).map(() =>
        chooseEffects(inputs, ChooseEffectsQuality.BAD)
      ),
      goodEffect: chooseEffects(inputs, ChooseEffectsQuality.GOOD),
    };

    minMaxAssociations.current = calculateMinMax(inputs);
  };

  const handleConvertBlocks = () => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_EDITED, {
      emojis: inputs,
      ...generatedEffects.current.goodEffect,
    });

    if (!generatedEffects.current.goodEffect) {
      return;
    }

    const blocksSvg = generateAiEffectBlocksFromResult(
      Blockly.getMainWorkspace(),
      generatedEffects.current.goodEffect
    );

    const origBlock = currentAiModalField?.getSourceBlock();

    if (origBlock && currentAiModalField) {
      if (!origBlock.getPreviousBlock()) {
        // This block isn't attached to anything at all.
        const blockXY = origBlock.getRelativeToSurfaceXY();
        blocksSvg[0].moveTo(blockXY);
      } else if (!origBlock?.getPreviousBlock()?.nextConnection) {
        // origBlock is the first input (for example, to a setup block),
        // without a regular code block above it.
        origBlock
          ?.getPreviousBlock()
          ?.getInput('DO')
          ?.connection?.connect(blocksSvg[0].previousConnection);
      } else {
        // origBlock has a regular block above it.
        origBlock
          ?.getPreviousBlock()
          ?.nextConnection?.connect(blocksSvg[0].previousConnection);
      }

      origBlock
        ?.getNextBlock()
        ?.previousConnection?.connect(blocksSvg[1].nextConnection);

      blocksSvg.forEach(blockSvg => {
        blockSvg.initSvg();
        blockSvg.render();
      });

      origBlock.dispose(false);

      // End modal.
      onClose();
    }
  };

  const handleOnClose = () => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_MODAL_CLOSED, {
      emojis: inputs,
      mode,
      currentToggle,
      generatingStep: generatingProgress.step,
    });

    onClose();
  };

  const getPreviewCode = (currentGeneratedEffect?: GeneratedEffect): string => {
    if (!currentGeneratedEffect) {
      return '';
    }

    const tempWorkspace = new Workspace();
    const previewCode = generatePreviewCode(
      tempWorkspace,
      currentGeneratedEffect
    );
    tempWorkspace.dispose();
    return previewCode;
  };

  const onClose = () => dispatch(closeAiModal());

  const showUseButton =
    mode === Mode.RESULTS &&
    currentToggle === Toggle.EFFECT &&
    (aiOutput === AiOutput.AI_BLOCK || aiOutput === AiOutput.BOTH);

  const showConvertButton =
    mode === Mode.RESULTS &&
    currentToggle === Toggle.CODE &&
    (aiOutput === AiOutput.GENERATED_BLOCKS || aiOutput === AiOutput.BOTH);

  let aiBotHead = aiBotHeadNormal;
  let aiBotBody = aiBotBodyNormal;
  let previewAreaClass = undefined;
  if (
    mode === Mode.GENERATED ||
    (mode === Mode.GENERATING &&
      generatingProgress.step >= BAD_GENERATED_RESULTS_COUNT)
  ) {
    aiBotHead = aiBotHeadYes;
    aiBotBody = aiBotBodyYes;
    previewAreaClass = moduleStyles.previewAreaYes;
  } else if (mode === Mode.GENERATING) {
    aiBotBody =
      aiBotBodyThinkImages[
        generatingProgress.step % aiBotBodyThinkImages.length
      ];
  }

  const explanationKeyDotColor = [
    moduleStyles.dotFirst,
    moduleStyles.dotSecond,
    moduleStyles.dotThird,
  ];

  const headerValue = () => {
    return (
      <div
        className={moduleStyles.inputsContainer}
        tabIndex={0}
        onClick={handleStartOverClick}
      >
        {getRangeArray(0, SLOT_COUNT - 1).map(index => {
          const item = getItem(inputs[index]);
          return (
            <div key={index} className={moduleStyles.emojiSlot}>
              {item && (
                <EmojiIcon item={item} className={moduleStyles.emojiSlotIcon} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // The header comes from a localized string like this: "generate {input} effect".
  // We split the localized string on the "{input}", and rebuild the HTML but with
  // the emoji box in place of that "{input}".
  const INPUT_KEY = '__CDO_INPUTS__';
  const headerTextSplit = i18n
    .danceAiModalHeading({input: INPUT_KEY})
    .split(INPUT_KEY);

  const headerContent = [
    headerTextSplit[0],
    headerValue(),
    headerTextSplit[1],
  ].map((part: string, index: number) => {
    return <span key={index}>{part}</span>;
  });

  const currentGeneratedEffect = getGeneratedEffect(generatingProgress.step);

  const lastInputItem =
    currentInputSlot > 0 ? getItem(inputs[currentInputSlot - 1]) : undefined;

  // Visualization preview size, in pixels.
  const previewSize = 280;
  const previewSizeSmall = 90;

  const labels = getLabels();

  // While generating, we render two previews at a time, so that as a new
  // one appears, it will smoothly fade in over the top of the previous one.
  const indexesToPreview = [];
  if (mode === Mode.GENERATING || mode === Mode.GENERATED) {
    if (generatingProgress.step > 0) {
      indexesToPreview.push(generatingProgress.step - 1);
    }
    indexesToPreview.push(generatingProgress.step);
  } else if (mode === Mode.RESULTS) {
    indexesToPreview.push(BAD_GENERATED_RESULTS_COUNT);
  }

  // How long the preview takes to appear.
  const previewAppearDuration = getGeneratingStepDuration() / 2.5;

  const text =
    mode === Mode.SELECT_INPUTS
      ? i18n.danceAiModalChooseEmoji()
      : mode === Mode.GENERATING
      ? i18n.danceAiModalFinding2()
      : mode === Mode.GENERATED
      ? i18n.danceAiModalGenerating2()
      : mode === Mode.RESULTS && currentToggle === Toggle.EFFECT
      ? i18n.danceAiModalEffect2()
      : mode === Mode.RESULTS && currentToggle === Toggle.CODE
      ? i18n.danceAiModalCode2()
      : mode === Mode.EXPLANATION
      ? i18n.danceAiModalExplanation2()
      : undefined;

  return (
    <AccessibleDialog
      className={moduleStyles.dialog}
      onClose={handleOnClose}
      initialFocus={false}
      styles={{modalBackdrop: moduleStyles.modalBackdrop}}
    >
      <div id="ai-modal-header-area" className={moduleStyles.headerArea}>
        <div className={moduleStyles.headerAreaLeft}>
          <img
            src={aiBotMini}
            className={moduleStyles.botImage}
            alt={i18n.danceAiModalBotAlt()}
          />
          {headerContent}
        </div>
        <div
          id="ai-modal-header-area-right"
          className={moduleStyles.headerAreaRight}
        >
          <button
            className={moduleStyles.closeButton}
            data-dismiss="modal"
            type="button"
            onClick={handleOnClose}
          >
            <i className="fa fa-close" aria-hidden={true} />
            <span className="sr-only">{i18n.danceAiModalClose()}</span>
          </button>
        </div>
      </div>
      <div id="ai-modal-inner-area" className={moduleStyles.innerArea}>
        {mode === Mode.RESULTS && (
          <div
            id="toggle-area"
            className={moduleStyles.toggleArea}
            style={{zIndex: mode === Mode.RESULTS ? 1 : 0}}
          >
            <ToggleGroup
              selected={currentToggle}
              activeColor={color['light_primary_500']}
              onChange={(value: Toggle) => {
                setCurrentToggle(value);
              }}
              useRebrandedLikeStyles
            >
              <button key={0} type="button" value={Toggle.EFFECT}>
                {i18n.danceAiModalEffectButton()}
              </button>
              <button key={1} type="button" value={Toggle.CODE}>
                {i18n.danceAiModalCodeButton()}
              </button>
            </ToggleGroup>
          </div>
        )}

        {text && (
          <div id="text-area" className={moduleStyles.textArea}>
            <div key={text} className={moduleStyles.text}>
              {text}
            </div>
          </div>
        )}

        <div
          id="inputs-area"
          className={moduleStyles.inputsArea}
          style={{zIndex: mode === Mode.SELECT_INPUTS ? 1 : 0}}
        >
          {mode === Mode.SELECT_INPUTS && (
            <div id="inputs-container" className={moduleStyles.inputsContainer}>
              {getAllItems().map((item, index) => {
                return (
                  <EmojiIcon
                    key={index}
                    item={item}
                    onClick={() => handleItemClick(item.id, item.available)}
                    isHighlighted={!item.available}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div id="bot-area" className={moduleStyles.botArea}>
          {mode === Mode.SELECT_INPUTS && lastInputItem && (
            <div
              key={inputAddCount}
              id="flying-emoji"
              className={moduleStyles.flyingEmoji}
            >
              <EmojiIcon
                item={lastInputItem}
                className={moduleStyles.emojiSlotIcon}
              />
            </div>
          )}
          {(mode === Mode.INITIAL ||
            mode === Mode.SELECT_INPUTS ||
            mode === Mode.GENERATING ||
            mode === Mode.GENERATED ||
            mode === Mode.RESULTS) && (
            <div className={moduleStyles.botContainer}>
              <img
                src={aiBotHead}
                className={classNames(
                  moduleStyles.botHead,
                  mode === Mode.SELECT_INPUTS &&
                    currentInputSlot < SLOT_COUNT &&
                    moduleStyles.botHeadOpen
                )}
                alt={i18n.danceAiModalBotAlt()}
              />
              <img
                src={aiBotBody}
                className={moduleStyles.botBody}
                alt={i18n.danceAiModalBotAlt()}
              />
            </div>
          )}
        </div>

        {(mode === Mode.GENERATING ||
          mode === Mode.GENERATED ||
          mode === Mode.RESULTS) && (
          <div
            id="preview-area"
            className={classNames(moduleStyles.previewArea, previewAreaClass)}
          >
            <div id="flip-card" className={moduleStyles.flipCard}>
              <div
                id="flip-card-inner"
                className={classNames(
                  moduleStyles.flipCardInner,
                  mode === Mode.RESULTS &&
                    currentToggle === Toggle.CODE &&
                    moduleStyles.flipCardInnerFlipped
                )}
              >
                <div
                  id="flip-card-front"
                  className={moduleStyles.flipCardFront}
                >
                  {indexesToPreview.map(index => {
                    return (
                      <div
                        id={'preview-container-' + index}
                        key={'preview-container-' + index}
                        className={moduleStyles.previewContainer}
                        style={{
                          animationDuration: previewAppearDuration + 'ms',
                        }}
                      >
                        <AiVisualizationPreview
                          id={'ai-preview-' + index}
                          code={getPreviewCode(getGeneratedEffect(index))}
                          size={previewSize}
                        />
                      </div>
                    );
                  })}
                </div>
                <div id="flip-card-back" className={moduleStyles.flipCardBack}>
                  {mode === Mode.RESULTS && (
                    <div
                      id="block-preview"
                      className={moduleStyles.blockPreview}
                    >
                      {currentGeneratedEffect && (
                        <AiBlockPreview results={currentGeneratedEffect} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === Mode.GENERATED && (
          <div id="check-area" className={moduleStyles.checkArea}>
            <i className="fa fa-check-circle" />
          </div>
        )}

        {mode === Mode.EXPLANATION && currentGeneratedEffect && (
          <div id="explanation-area" className={moduleStyles.explanationArea}>
            <div className={moduleStyles.key}>
              {getRangeArray(0, SLOT_COUNT - 1).map(index => {
                const item = getItem(inputs[index]);
                return (
                  <div key={index} className={moduleStyles.emojiSlot}>
                    <div
                      className={classNames(
                        moduleStyles.dot,
                        explanationKeyDotColor[index]
                      )}
                    />
                    {item && (
                      <EmojiIcon
                        item={item}
                        className={moduleStyles.emojiSlotIcon}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className={moduleStyles.visualizationContainer}>
              {getRangeArray(
                EXPLANATION_START_INDEX,
                EXPLANATION_START_INDEX + explanationProgress
              ).map(index => {
                return (
                  <div key={index} className={moduleStyles.visualizationColumn}>
                    <DanceAiScore
                      scores={getScores(inputs, index)}
                      minMax={minMaxAssociations.current}
                      colors={
                        index < BAD_GENERATED_RESULTS_COUNT
                          ? ScoreColors.NORMAL_NO
                          : ScoreColors.NORMAL_YES
                      }
                      slotCount={SLOT_COUNT}
                    />

                    <div
                      title={
                        labels.backgroundEffect[
                          getGeneratedEffect(index)?.backgroundEffect || 0
                        ] +
                        ' - ' +
                        labels.foregroundEffect[
                          getGeneratedEffect(index)?.foregroundEffect || 0
                        ] +
                        ' - ' +
                        labels.backgroundColor[
                          getGeneratedEffect(index)?.backgroundColor || 0
                        ]
                      }
                    >
                      <AiVisualizationPreview
                        id={'ai-preview-' + index}
                        code={getPreviewCode(getGeneratedEffect(index))}
                        size={previewSizeSmall}
                        durationMs={
                          index < BAD_GENERATED_RESULTS_COUNT
                            ? EXPLANATION_STEP_DURATION
                            : undefined
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div id="buttons-area-top" className={moduleStyles.buttonsAreaTop}>
          <div id="buttons-area-top-left">
            <ModalButton
              currentMode={mode}
              showFor={[Mode.RESULTS]}
              id="start-over-button"
              onClick={handleStartOverClick}
              color={Button.ButtonColor.neutralDark}
              className={classNames(
                moduleStyles.button,
                moduleStyles.buttonWithoutText
              )}
              iconClassName={moduleStyles.buttonIcon}
              aria-label={i18n.danceAiModalStartOverButton()}
              title={i18n.danceAiModalStartOverButton()}
              icon="fast-backward"
            />
          </div>
          <div id="buttons-area-top-right">
            <ModalButton
              currentMode={mode}
              showFor={[Mode.RESULTS]}
              id="explanation-button"
              onClick={handleExplanationClick}
              color={Button.ButtonColor.neutralDark}
              aria-label={i18n.danceAiModalExplanationButton()}
              title={i18n.danceAiModalExplanationButton()}
              className={classNames(
                moduleStyles.button,
                moduleStyles.buttonWithoutText
              )}
              iconClassName={moduleStyles.buttonIcon}
              icon="chart-simple"
            />

            <ModalButton
              currentMode={mode}
              showFor={[Mode.EXPLANATION]}
              id="leave-explanation-button"
              onClick={handleLeaveExplanation}
              color={Button.ButtonColor.brandSecondaryDefault}
              aria-label={i18n.danceAiModalBack()}
              title={i18n.danceAiModalBack()}
              className={classNames(
                moduleStyles.button,
                moduleStyles.buttonWithoutText
              )}
              iconClassName={moduleStyles.buttonIcon}
              icon="chart-simple"
            />
          </div>
        </div>

        <div id="buttons-area" className={moduleStyles.buttonsArea}>
          <div>
            <ModalButton
              currentMode={mode}
              showFor={[Mode.RESULTS]}
              id="regenerate-button"
              onClick={handleRegenerateClick}
              color={Button.ButtonColor.neutralDark}
              className={moduleStyles.button}
              icon="refresh"
              iconClassName={classNames(
                moduleStyles.buttonIcon,
                moduleStyles.buttonIconWithText
              )}
              text={i18n.danceAiModalRegenerateButton()}
            />
          </div>
          <div>
            {currentInputSlot >= SLOT_COUNT && (
              <ModalButton
                currentMode={mode}
                showFor={[Mode.SELECT_INPUTS]}
                id="generate-button"
                text={i18n.danceAiModalGenerateButton()}
                onClick={handleGenerateClick}
                color={Button.ButtonColor.brandSecondaryDefault}
                className={moduleStyles.button}
                useDefaultLineHeight
              />
            )}

            {showConvertButton && (
              <Button
                id="convert-button"
                text={i18n.danceAiModalUseCodeButton()}
                onClick={handleConvertBlocks}
                color={Button.ButtonColor.brandSecondaryDefault}
                className={moduleStyles.button}
                disabled={aiModalOpenedFromFlyout}
                useDefaultLineHeight
              />
            )}
            {showUseButton && (
              <Button
                id="use-button"
                text={i18n.danceAiModalUseEffectButton()}
                onClick={handleUseClick}
                color={Button.ButtonColor.brandSecondaryDefault}
                className={moduleStyles.button}
                useDefaultLineHeight
              />
            )}
          </div>
        </div>
      </div>
    </AccessibleDialog>
  );
};

interface EmojiIconProps {
  item: AiModalItem;
  onClick?: () => void;
  className?: string;
  isHighlighted?: boolean;
}

const EmojiIcon: React.FunctionComponent<EmojiIconProps> = ({
  item,
  onClick,
  className,
  isHighlighted,
}) => {
  const isButton = onClick !== undefined;
  const Tag = isButton ? 'button' : 'div';
  return (
    <Tag
      type={isButton ? 'button' : undefined}
      key={item.id}
      onClick={onClick}
      style={{
        backgroundImage: `url(${getEmojiImageUrl(item.id)})`,
      }}
      className={classNames(
        moduleStyles.emojiIcon,
        isButton && moduleStyles.emojiIconButton,
        isHighlighted && moduleStyles.emojiIconButtonHighlighted,
        className
      )}
      aria-label={item.emoji}
    />
  );
};

export default DanceAiModal;
