import {FieldDropdown, Workspace} from 'blockly/core';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import color from '@cdo/apps/util/color';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import inputLibraryJson from '@cdo/static/dance/ai/ai-inputs.json';
import aiBotBodyNormal from '@cdo/static/dance/ai/bot/ai-bot-body-normal.png';
import aiBotBodyThink0 from '@cdo/static/dance/ai/bot/ai-bot-body-think0.png';
import aiBotBodyThink1 from '@cdo/static/dance/ai/bot/ai-bot-body-think1.png';
import aiBotBodyThink2 from '@cdo/static/dance/ai/bot/ai-bot-body-think2.png';
import aiBotBodyYes from '@cdo/static/dance/ai/bot/ai-bot-body-yes.png';
import aiBotHeadNormal from '@cdo/static/dance/ai/bot/ai-bot-head-normal.png';
import aiBotHeadYes from '@cdo/static/dance/ai/bot/ai-bot-head-yes.png';

import danceMetricsReporter from '../danceMetricsReporter';
import {closeAiModal, DanceState} from '../danceRedux';

// Disabling import order in order to add require statements first
// Require statements can change behavior based on the order they are called.
// This might be safe to remove but needs investigation whether any behavior is changed by order.
/* eslint-disable import/order */
const ToggleGroup = require('@cdo/apps/templates/ToggleGroup').default;

const i18n = require('../locale');
/* eslint-enable import/order */

import AiVisualizationPreview from './AiVisualizationPreview';
import CdoFieldDanceAi from './cdoFieldDanceAi';
import {DANCE_AI_FIELD_NAME} from './constants';
import DanceAiModalFlipCard from './DanceAiModalFlipCard';
import DanceAiModalHeader from './DanceAiModalHeader';
import DanceAiScore, {ScoreColors} from './DanceAiScore';
import EmojiIcon from './EmojiIcon';
import EmojiInputGrid from './EmojiInputGrid';
import ModalButton from './ModalButton';
import {
  AiFieldValue,
  DanceAiModalMode,
  DanceAiModalOutputType,
  DanceAiPreviewButtonToggleState,
  DanceAiSound,
  EffectsQuality,
  EmojiItem,
  FieldKey,
  GeneratedEffect,
  MinMax,
} from './types';
import {
  chooseEffects,
  generateAiEffectBlocks,
  generateAiEffectBlocksFromResult,
  getAiEmojiItem,
  getGeneratedEffectScores,
  getLabelMap,
  getPreviewCode,
  getRangeArray,
  lerp,
  useInterval,
} from './utils';

import moduleStyles from './dance-ai-modal.module.scss';

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

const aiBotBodyThinkImages = [
  aiBotBodyThink0,
  aiBotBodyThink1,
  aiBotBodyThink2,
];

// this function is used internaly in handleItemClick to determine if an id is selected
const isItemSelected = (id: string, inputs: string[]) =>
  inputs.some(inputId => inputId === id);

// How many emojis are to be selected.
const SLOT_COUNT = 3;

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

interface DanceAiModalProps {
  playSound: (name: DanceAiSound, options?: object) => void;
}

const DanceAiModal: React.FunctionComponent<DanceAiModalProps> = ({
  playSound,
}) => {
  const dispatch = useAppDispatch();

  const generatedEffects = useRef<GeneratedEffects>({
    badEffects: [],
    goodEffect: undefined,
  });
  const minMaxAssociations = useRef<MinMax>({
    minIndividualScore: 0,
    maxTotalScore: 3 * SLOT_COUNT,
  });

  const [mode, setMode] = useState(DanceAiModalMode.INITIAL);

  const [inputs, setInputs] = useState<string[]>([]);
  const [inputAddCount, setInputAddCount] = useState<number>(0);
  const [generatingProgress, setGeneratingProgress] =
    useState<GeneratingProgress>({
      step: 0,
      subStep: 0,
    });
  const [generatedProgress, setGeneratedProgress] = useState<number>(0);
  const [currentToggle, setCurrentToggle] =
    useState<DanceAiPreviewButtonToggleState>(
      DanceAiPreviewButtonToggleState.EFFECT
    );
  const [explanationProgress, setExplanationProgress] = useState<number>(0);

  const aiModalBlockId = useSelector(
    (state: {dance: DanceState}) => state.dance.currentAiModalBlockId
  );

  const currentAiModalField: CdoFieldDanceAi | null = useMemo(() => {
    if (aiModalBlockId === undefined) {
      danceMetricsReporter.logWarning('AI modal opened without a field');
      return null;
    }

    const field = Blockly.getMainWorkspace()
      .getBlockById(aiModalBlockId)
      ?.getField(DANCE_AI_FIELD_NAME);

    if (field === null) {
      danceMetricsReporter.logWarning('Could not find AI field');
      return null;
    }

    return field as CdoFieldDanceAi;
  }, [aiModalBlockId]);

  const aiModalOpenedFromFlyout = useSelector(
    (state: {dance: DanceState}) => state.dance.aiModalOpenedFromFlyout
  );

  const aiOutput = useSelector(
    (state: {dance: DanceState}) => state.dance.aiOutput
  );

  const currentInputSlot = inputs.length;
  const selectedEmojis = useMemo(
    () => inputs.map(getAiEmojiItem).filter(item => item !== undefined),
    [inputs]
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
    (givenInputs: string[], step: number) => {
      const effect = getGeneratedEffect(step);
      if (effect) {
        return getGeneratedEffectScores(givenInputs, effect);
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
    (givenInputs: string[]) => {
      // The minimum individual score is selected across all generated effects (bad and good).
      const minIndividualScore = getRangeArray(
        0,
        BAD_GENERATED_RESULTS_COUNT - 1
      ).reduce((accumulator: number, step: number) => {
        const scores = getScores(givenInputs, step);
        return Math.min(...scores, accumulator);
      }, Infinity);

      // By definition, the maximum total score must come from the "good" effect.
      const goodEffectScores = getScores(
        givenInputs,
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
    if (mode === DanceAiModalMode.INITIAL) {
      const initialValueString = currentAiModalField?.getValue();
      if (initialValueString) {
        const initialValue: AiFieldValue = JSON.parse(initialValueString);

        setMode(DanceAiModalMode.RESULTS);
        setInputs(initialValue.inputs);
        setGeneratingProgress({step: BAD_GENERATED_RESULTS_COUNT, subStep: 0});

        generatedEffects.current = {
          badEffects: getRangeArray(0, BAD_GENERATED_RESULTS_COUNT - 1).map(
            () => chooseEffects(initialValue.inputs, EffectsQuality.BAD)
          ),
          goodEffect: initialValue,
        };

        minMaxAssociations.current = calculateMinMax(initialValue.inputs);
      } else {
        setTimeout(() => {
          setMode(DanceAiModalMode.SELECT_INPUTS);
        }, 500);
      }
    }
  }, [currentAiModalField, mode, calculateMinMax]);

  const labels = useMemo(() => {
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
  }, []);

  // this callback is handed to the EmojiInputGrid to determine if an EmojiIcon is highlighted
  const isItemHighlighted = useCallback(
    (item: EmojiItem) => isItemSelected(item.id, inputs),
    [inputs]
  );

  const handleItemClick = useCallback(
    (id: string) => {
      setInputs(inputs => {
        const available = !isItemSelected(id, inputs);

        // if we've clicked on an emoji that's not available, remove it from our inputs
        if (!available) {
          playSound('ai-deselect-emoji');
          return inputs.filter(input => input !== id);
          // if we have more input slots, we can add the emoji
        } else if (inputs.length < SLOT_COUNT) {
          playSound('ai-select-emoji');
          setInputAddCount(inputAddCount => inputAddCount + 1);
          return [...inputs, id];
          // otherwise, it's not a remove and we don't have space - do nothing.
        } else {
          return inputs;
        }
      });
    },
    [playSound]
  );

  const startAi = useCallback(() => {
    generatedEffects.current = {
      badEffects: getRangeArray(0, BAD_GENERATED_RESULTS_COUNT - 1).map(() =>
        chooseEffects(inputs, EffectsQuality.BAD)
      ),
      goodEffect: chooseEffects(inputs, EffectsQuality.GOOD),
    };

    minMaxAssociations.current = calculateMinMax(inputs);
  }, [calculateMinMax, inputs]);

  const startGenerating = useCallback(() => {
    startAi();
    setMode(DanceAiModalMode.GENERATING);
  }, [startAi]);

  const handleGenerateClick = useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_GENERATED, {
      emojis: inputs,
    });

    startGenerating();
  }, [startGenerating, inputs]);

  const onClose = useCallback(() => dispatch(closeAiModal()), [dispatch]);

  const handleStartOverClick = useCallback(
    (usingHeader: boolean) => {
      analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_RESTARTED, {
        emojis: inputs,
        usingHeader,
      });
      setInputs([]);
      setGeneratingProgress({step: 0, subStep: 0});
      setGeneratedProgress(0);
      setMode(DanceAiModalMode.SELECT_INPUTS);
    },
    [inputs]
  );

  const handleStartOverClickUsingHeader = useCallback(
    () => handleStartOverClick(true),
    [handleStartOverClick]
  );

  const handleStartOverClickNotUsingHeader = useCallback(
    () => handleStartOverClick(false),
    [handleStartOverClick]
  );

  const handleRegenerateClick = useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_REGENERATED, {
      emojis: inputs,
    });

    setGeneratingProgress({step: 0, subStep: 0});
    setGeneratedProgress(0);
    setCurrentToggle(DanceAiPreviewButtonToggleState.EFFECT);
    startGenerating();
  }, [startGenerating, inputs]);

  const handleExplanationClick = useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_EXPLAINED, {
      emojis: inputs,
    });

    setGeneratedProgress(0);
    setExplanationProgress(0);
    setMode(DanceAiModalMode.EXPLANATION);
  }, [inputs]);

  const handleUseClick = useCallback(() => {
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
  }, [currentAiModalField, inputs, onClose]);

  const handleLeaveExplanation = useCallback(() => {
    setMode(DanceAiModalMode.RESULTS);
  }, []);

  // One-shot update of step & substep.
  const updateGeneratingProgress = useCallback(
    (progress: GeneratingProgress) => {
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
    },
    []
  );

  // Handle moments when we should play a sound or do another action.
  useEffect(() => {
    if (
      mode === DanceAiModalMode.GENERATING &&
      generatingProgress.subStep === 0
    ) {
      if (generatingProgress.step < BAD_GENERATED_RESULTS_COUNT) {
        playSound('ai-generate-no', {volume: 0.2});
      } else {
        setMode(DanceAiModalMode.GENERATED);
      }
    } else if (mode === DanceAiModalMode.GENERATED) {
      if (generatedProgress === 0) {
        playSound('ai-generate-yes', {volume: 0.2});
      } else if (generatedProgress === GENERATED_STEPS_COUNT - 1) {
        setMode(DanceAiModalMode.RESULTS);
      }
    } else if (mode === DanceAiModalMode.EXPLANATION) {
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

  const getGeneratingStepDuration = useCallback(() => {
    return lerp(
      generatingProgress.step,
      BAD_GENERATED_RESULTS_COUNT,
      GENERATION_SUBSTEP_DURATION_MAX,
      GENERATION_SUBSTEP_DURATION_MIN
    );
  }, [generatingProgress.step]);

  // Animate through the generating or explanation process.
  useInterval(
    () => {
      if (mode === DanceAiModalMode.GENERATING) {
        setGeneratingProgress(updateGeneratingProgress);
      } else if (mode === DanceAiModalMode.GENERATED) {
        if (generatedProgress < GENERATED_STEPS_COUNT - 1) {
          setGeneratedProgress(progress => progress + 1);
        }
      } else if (mode === DanceAiModalMode.EXPLANATION) {
        if (explanationProgress < EXPLANATION_STEPS_COUNT - 1) {
          setExplanationProgress(progress => progress + 1);
        }
      }
    },
    mode === DanceAiModalMode.GENERATING
      ? getGeneratingStepDuration()
      : mode === DanceAiModalMode.GENERATED
      ? GENERATED_STEP_DURATION
      : mode === DanceAiModalMode.EXPLANATION
      ? EXPLANATION_STEP_DURATION
      : undefined
  );

  const handleConvertBlocks = useCallback(() => {
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
        blockSvg.queueRender();
      });

      origBlock.dispose(false);

      // End modal.
      onClose();
    }
  }, [currentAiModalField, onClose, inputs]);

  const handleOnClose = useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_MODAL_CLOSED, {
      emojis: inputs,
      mode,
      currentToggle,
      generatingStep: generatingProgress.step,
    });

    onClose();
  }, [inputs, mode, currentToggle, generatingProgress.step, onClose]);

  const showUseButton =
    mode === DanceAiModalMode.RESULTS &&
    currentToggle === DanceAiPreviewButtonToggleState.EFFECT &&
    (aiOutput === DanceAiModalOutputType.AI_BLOCK ||
      aiOutput === DanceAiModalOutputType.BOTH);

  const showConvertButton =
    mode === DanceAiModalMode.RESULTS &&
    currentToggle === DanceAiPreviewButtonToggleState.CODE &&
    (aiOutput === DanceAiModalOutputType.GENERATED_BLOCKS ||
      aiOutput === DanceAiModalOutputType.BOTH);

  let aiBotHead = aiBotHeadNormal;
  let aiBotBody = aiBotBodyNormal;

  if (
    mode === DanceAiModalMode.GENERATED ||
    (mode === DanceAiModalMode.GENERATING &&
      generatingProgress.step >= BAD_GENERATED_RESULTS_COUNT)
  ) {
    aiBotHead = aiBotHeadYes;
    aiBotBody = aiBotBodyYes;
  } else if (mode === DanceAiModalMode.GENERATING) {
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

  const currentGeneratedEffect = getGeneratedEffect(generatingProgress.step);

  const lastInputItem = selectedEmojis[currentInputSlot - 1];

  // Visualization preview size, in pixels.
  const previewSizeSmall = 90;

  // How long the preview takes to appear.
  const previewAppearDuration = getGeneratingStepDuration() / 2.5;

  const text =
    mode === DanceAiModalMode.SELECT_INPUTS
      ? i18n.danceAiModalChooseEmoji()
      : mode === DanceAiModalMode.GENERATING
      ? i18n.danceAiModalFinding2()
      : mode === DanceAiModalMode.GENERATED
      ? i18n.danceAiModalGenerating2()
      : mode === DanceAiModalMode.RESULTS &&
        currentToggle === DanceAiPreviewButtonToggleState.EFFECT
      ? i18n.danceAiModalEffect2()
      : mode === DanceAiModalMode.RESULTS &&
        currentToggle === DanceAiPreviewButtonToggleState.CODE
      ? i18n.danceAiModalCode2()
      : mode === DanceAiModalMode.EXPLANATION
      ? i18n.danceAiModalExplanation2()
      : undefined;

  // If the AI modal was somehow not opened by an AI block, or we couldn't find the source field,
  // don't render anything.
  if (currentAiModalField === null) {
    return null;
  }

  return (
    <AccessibleDialog
      className={moduleStyles.dialog}
      onClose={handleOnClose}
      initialFocus={false}
      styles={{
        modalBackdrop: moduleStyles.modalBackdrop,
        xCloseButton: moduleStyles.xCloseButton,
      }}
    >
      <DanceAiModalHeader
        onClose={onClose}
        handleStartOverClick={handleStartOverClickUsingHeader}
        selectedEmojis={selectedEmojis}
        slotCount={SLOT_COUNT}
      />

      <div id="ai-modal-inner-area" className={moduleStyles.innerArea}>
        {mode === DanceAiModalMode.RESULTS && (
          <div
            id="toggle-area"
            className={moduleStyles.toggleArea}
            style={{zIndex: mode === DanceAiModalMode.RESULTS ? 1 : 0}}
          >
            <ToggleGroup
              selected={currentToggle}
              activeColor={color['light_primary_500']}
              onChange={(value: DanceAiPreviewButtonToggleState) => {
                setCurrentToggle(value);
              }}
              useRebrandedLikeStyles
            >
              <button
                id="toggle-effect-button"
                type="button"
                value={DanceAiPreviewButtonToggleState.EFFECT}
              >
                {i18n.danceAiModalEffectButton()}
              </button>
              <button
                id="toggle-code-button"
                type="button"
                value={DanceAiPreviewButtonToggleState.CODE}
              >
                {i18n.danceAiModalCodeButton()}
              </button>
            </ToggleGroup>
          </div>
        )}

        {text && (
          <div id="text-area" className={moduleStyles.textArea}>
            <div className={moduleStyles.text}>{text}</div>
          </div>
        )}

        {mode === DanceAiModalMode.SELECT_INPUTS && (
          <EmojiInputGrid
            inputLibrary={inputLibraryJson}
            onClick={handleItemClick}
            isHighlighted={isItemHighlighted}
          />
        )}

        <div id="bot-area" className={moduleStyles.botArea}>
          {mode === DanceAiModalMode.SELECT_INPUTS && lastInputItem && (
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
          {(mode === DanceAiModalMode.INITIAL ||
            mode === DanceAiModalMode.SELECT_INPUTS ||
            mode === DanceAiModalMode.GENERATING ||
            mode === DanceAiModalMode.GENERATED ||
            mode === DanceAiModalMode.RESULTS) && (
            <div className={moduleStyles.botContainer}>
              <img
                src={aiBotHead}
                className={classNames(
                  moduleStyles.botHead,
                  mode === DanceAiModalMode.SELECT_INPUTS &&
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

        {(mode === DanceAiModalMode.GENERATING ||
          mode === DanceAiModalMode.GENERATED ||
          mode === DanceAiModalMode.RESULTS) && (
          <DanceAiModalFlipCard
            mode={mode}
            generatingProgressStep={generatingProgress.step}
            badGeneratedResultsCount={BAD_GENERATED_RESULTS_COUNT}
            currentToggle={currentToggle}
            previewAppearDuration={previewAppearDuration}
            currentGeneratedEffect={currentGeneratedEffect}
            getGeneratedEffect={getGeneratedEffect}
          />
        )}

        {mode === DanceAiModalMode.GENERATED && (
          <div id="check-area" className={moduleStyles.checkArea}>
            <i className="fa fa-check-circle" />
          </div>
        )}

        {mode === DanceAiModalMode.EXPLANATION && currentGeneratedEffect && (
          <div id="explanation-area" className={moduleStyles.explanationArea}>
            <div className={moduleStyles.key}>
              {selectedEmojis.map((item, index) => (
                <div key={item.id} className={moduleStyles.emojiSlot}>
                  <div
                    className={classNames(
                      moduleStyles.dot,
                      explanationKeyDotColor[index]
                    )}
                  />

                  <EmojiIcon
                    item={item}
                    className={moduleStyles.emojiSlotIcon}
                  />
                </div>
              ))}
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
              showFor={[DanceAiModalMode.RESULTS]}
              id="start-over-button"
              onClick={handleStartOverClickNotUsingHeader}
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
              showFor={[DanceAiModalMode.RESULTS]}
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
              showFor={[DanceAiModalMode.EXPLANATION]}
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
              showFor={[DanceAiModalMode.RESULTS]}
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
                showFor={[DanceAiModalMode.SELECT_INPUTS]}
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

export default DanceAiModal;
