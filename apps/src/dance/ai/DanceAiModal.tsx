import React, {useState, useEffect, useRef} from 'react';
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
import AiVisualizationPreview from './AiVisualizationPreview';
import AiBlockPreview from './AiBlockPreview';
import {
  AiOutput,
  FieldKey,
  GeneratedEffect,
  GeneratedEffectScores,
} from '../types';
import {
  generateBlocks,
  generateBlocksFromResult,
  generatePreviewCode,
  getLabelMap,
} from './utils';
import color from '@cdo/apps/util/color';
const ToggleGroup = require('@cdo/apps/templates/ToggleGroup').default;
const i18n = require('../locale');

import inputLibraryJson from '@cdo/static/dance/ai/ai-inputs.json';

import aiBotBorder from '@cdo/static/dance/ai/bot/ai-bot-border.png';
import aiBotHeadNormal from '@cdo/static/dance/ai/bot/ai-bot-head-normal.png';
import aiBotBodyNormal from '@cdo/static/dance/ai/bot/ai-bot-body-normal.png';
import aiBotHeadYes from '@cdo/static/dance/ai/bot/ai-bot-head-yes.png';
import aiBotBodyYes from '@cdo/static/dance/ai/bot/ai-bot-body-yes.png';
import aiBotHeadNo from '@cdo/static/dance/ai/bot/ai-bot-head-no.png';
import aiBotBodyNo from '@cdo/static/dance/ai/bot/ai-bot-body-no.png';

enum Mode {
  INITIAL = 'initial',
  SELECT_INPUTS = 'selectInputs',
  GENERATING = 'generating',
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

type MinMax = {
  min: number;
  max: number;
};

enum Toggle {
  AI_BLOCK = 'aiBlock',
  CODE = 'code',
}

// Adapted from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback: () => void, delay: number | undefined) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== undefined) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const SCORE_VISUALIZATION_HEIGHT = 140;

// How many emojis are to be selected.
const SLOT_COUNT = 3;

const getImageUrl = (id: string) => {
  return `/blockly/media/dance/ai/emoji/${id}.svg`;
};

const DanceAiModal: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  // How many low-scoring results we show before the chosen one.
  const BAD_GENERATED_RESULTS_COUNT = 4;

  // How many substeps for each step in the generating process.
  const GENERATING_SUBSTEP_COUNT = 3;

  // How long we spend in each substep in the generating process.
  const GENERATION_SUBSTEP_DURATION = 1000;

  // How long we spend in each step of the explanation process.
  const EXPLANATION_STEP_DURATION = 2000;

  const generatedEffects = useRef<GeneratedEffects>({
    badEffects: [],
    goodEffect: undefined,
  });
  const minMaxAssociations = useRef<MinMax>({
    min: 0,
    max: 3,
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
  const [currentToggle, setCurrentToggle] = useState<Toggle>(Toggle.AI_BLOCK);
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

  // Handle the case in which the modal is created with an existing value.
  useEffect(() => {
    if (mode === Mode.INITIAL) {
      const currentValue = currentAiModalField?.getValue();
      if (currentValue) {
        const currentInputs = JSON.parse(currentValue).inputs;

        setMode(Mode.RESULTS);
        setInputs(currentInputs);
        setGeneratingProgress({step: BAD_GENERATED_RESULTS_COUNT, subStep: 0});

        generatedEffects.current = {
          badEffects: Array.from(Array(BAD_GENERATED_RESULTS_COUNT).keys()).map(
            () => chooseEffects(currentInputs, ChooseEffectsQuality.BAD)
          ),
          goodEffect: JSON.parse(currentValue),
        };
      } else {
        setTimeout(() => {
          setMode(Mode.SELECT_INPUTS);
        }, 500);
      }
    }
  }, [currentAiModalField, mode]);

  const getLabels = () => {
    const tempWorkspace = new Workspace();
    const blocksSvg = generateBlocks(tempWorkspace);

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
      }
    } else {
      // Remove item from inputs.
      setInputs(inputs.filter(input => input !== id));
      setCurrentInputSlot(currentInputSlot - 1);
    }
  };

  const handleGenerateClick = () => {
    startAi();
    setMode(Mode.GENERATING);
  };

  const handleStartOverClick = () => {
    setInputs([]);
    setCurrentInputSlot(0);
    setGeneratingProgress({step: 0, subStep: 0});
    setMode(Mode.SELECT_INPUTS);
  };

  const handleRegenerateClick = () => {
    setGeneratingProgress({step: 0, subStep: 0});
    handleGenerateClick();
  };

  const handleExplanationClick = () => {
    setExplanationProgress(0);
    setMode(Mode.EXPLANATION);
  };

  const handleUseClick = () => {
    currentAiModalField?.setValue(
      JSON.stringify({
        inputs,
        ...generatedEffects.current.goodEffect,
      })
    );
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
    } else {
      // Leave these values intact, and go to the results.
      setMode(Mode.RESULTS);
    }

    return currentProgress;
  };

  // Animate through the generating or explanation process.
  useInterval(
    () => {
      if (mode === Mode.GENERATING) {
        setGeneratingProgress(updateGeneratingProgress);
      } else if (mode === Mode.EXPLANATION) {
        if (explanationProgress < BAD_GENERATED_RESULTS_COUNT) {
          setExplanationProgress(progress => progress + 1);
        }
      }
    },
    mode === Mode.GENERATING
      ? GENERATION_SUBSTEP_DURATION
      : mode === Mode.EXPLANATION
      ? EXPLANATION_STEP_DURATION
      : undefined
  );

  const startAi = () => {
    generatedEffects.current = {
      badEffects: Array.from(Array(BAD_GENERATED_RESULTS_COUNT).keys()).map(
        () => chooseEffects(inputs, ChooseEffectsQuality.BAD)
      ),
      goodEffect: chooseEffects(inputs, ChooseEffectsQuality.GOOD),
    };
  };

  const getGeneratedEffect = (step: number) => {
    if (step < BAD_GENERATED_RESULTS_COUNT) {
      return generatedEffects.current.badEffects[step];
    } else if (generatedEffects.current.goodEffect) {
      return generatedEffects.current.goodEffect;
    } else {
      return undefined;
    }
  };

  const getScores = (step: number) => {
    const effect = getGeneratedEffect(step);
    if (effect) {
      return getGeneratedEffectScores(inputs, effect);
    }

    return [0, 0, 0];
  };

  const handleConvertBlocks = () => {
    if (!generatedEffects.current.goodEffect) {
      return;
    }

    const blocksSvg = generateBlocksFromResult(
      Blockly.getMainWorkspace(),
      JSON.stringify(generatedEffects.current.goodEffect)
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

  const getPreviewCode = (generatedEffect?: GeneratedEffect): string => {
    const tempWorkspace = new Workspace();
    const previewCode = generatePreviewCode(
      tempWorkspace,
      JSON.stringify(generatedEffect)
    );
    tempWorkspace.dispose();
    return previewCode;
  };

  const onClose = () => dispatch(closeAiModal());

  const showUseButton =
    mode === Mode.RESULTS &&
    currentToggle === Toggle.AI_BLOCK &&
    (aiOutput === AiOutput.AI_BLOCK || aiOutput === AiOutput.BOTH);

  const showConvertButton =
    mode === Mode.RESULTS &&
    currentToggle === Toggle.CODE &&
    (aiOutput === AiOutput.GENERATED_BLOCKS || aiOutput === AiOutput.BOTH);

  let aiBotHead = aiBotHeadNormal;
  let aiBotBody = aiBotBodyNormal;
  if (mode === Mode.GENERATING && generatingProgress.subStep >= 2) {
    if (generatingProgress.step < BAD_GENERATED_RESULTS_COUNT) {
      aiBotHead = aiBotHeadNo;
      aiBotBody = aiBotBodyNo;
    } else {
      aiBotHead = aiBotHeadYes;
      aiBotBody = aiBotBodyYes;
    }
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
        onClick={handleStartOverClick}
      >
        {Array.from(Array(SLOT_COUNT).keys()).map(index => {
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
  const headerContent = [0, 1, 2]
    .map(index => {
      if (index === 0) {
        return headerTextSplit[0];
      } else if (index === 1) {
        return headerValue();
      } else {
        return headerTextSplit[1];
      }
    })
    .map((part: string, index: number) => {
      return <span key={index}>{part}</span>;
    });

  const currentGeneratedEffect = getGeneratedEffect(generatingProgress.step);

  const lastInputItem =
    currentInputSlot > 0 ? getItem(inputs[currentInputSlot - 1]) : undefined;

  // Visualization preview size, in pixels.
  const previewSize = 280;
  const previewSizeSmall = 90;

  const labels = getLabels();

  const calculateMinMax = () => {
    return Array.from(Array(BAD_GENERATED_RESULTS_COUNT + 1).keys()).reduce(
      (accumulator: MinMax, currentValue: number) => {
        const scores = getScores(currentValue);
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        if (min < accumulator.min) {
          accumulator.min = min;
        }
        if (max > accumulator.max) {
          accumulator.max = max;
        }
        return accumulator;
      },
      {min: Infinity, max: 0}
    );
  };

  if (
    generatedEffects.current.goodEffect &&
    generatedEffects.current.badEffects.length === BAD_GENERATED_RESULTS_COUNT
  ) {
    minMaxAssociations.current = calculateMinMax();
  }

  return (
    <AccessibleDialog
      className={moduleStyles.dialog}
      onClose={onClose}
      initialFocus={false}
      styles={{modalBackdrop: moduleStyles.modalBackdrop}}
    >
      <div id="ai-modal-header-area" className={moduleStyles.headerArea}>
        <img
          src={aiBotBorder}
          className={moduleStyles.botImage}
          alt={i18n.danceAiModalBotAlt()}
        />
        {headerContent}
        <div
          id="ai-modal-header-area-right"
          className={moduleStyles.headerAreaRight}
        >
          <button
            className={moduleStyles.closeButton}
            data-dismiss="modal"
            type="button"
            onClick={onClose}
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
              activeColor={color.teal}
              onChange={(value: Toggle) => {
                setCurrentToggle(value);
              }}
            >
              <button key={0} type="button" value={Toggle.AI_BLOCK}>
                {i18n.danceAiModalEffectButton()}
              </button>
              <button key={1} type="button" value={Toggle.CODE}>
                {i18n.danceAiModalCodeButton()}
              </button>
            </ToggleGroup>
          </div>
        )}

        <div id="text-area" className={moduleStyles.textArea}>
          {' '}
          {mode === Mode.SELECT_INPUTS
            ? i18n.danceAiModalChooseEmoji()
            : mode === Mode.GENERATING && aiBotHead === aiBotHeadYes
            ? i18n.danceAiModalGenerating()
            : mode === Mode.GENERATING
            ? i18n.danceAiModalFinding()
            : mode === Mode.RESULTS && currentToggle === Toggle.AI_BLOCK
            ? i18n.danceAiModalEffect()
            : mode === Mode.RESULTS && currentToggle === Toggle.CODE
            ? i18n.danceAiModalCode()
            : mode === Mode.EXPLANATION
            ? i18n.danceAiModalExplanation()
            : undefined}
        </div>

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

        {(mode === Mode.GENERATING || mode === Mode.RESULTS) && (
          <div
            key={'preview-' + generatingProgress.step}
            id="preview-area"
            className={moduleStyles.previewArea}
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
                  <AiVisualizationPreview
                    id="ai-preview"
                    code={getPreviewCode(currentGeneratedEffect)}
                    size={previewSize}
                  />
                </div>
                <div id="flip-card-back" className={moduleStyles.flipCardBack}>
                  {mode === Mode.RESULTS && (
                    <div
                      id="block-preview"
                      className={moduleStyles.blockPreview}
                    >
                      <AiBlockPreview
                        resultJson={JSON.stringify(currentGeneratedEffect)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === Mode.GENERATING && generatingProgress.subStep >= 1 && (
          <div
            id="score-area"
            key={generatingProgress.step}
            className={moduleStyles.scoreArea}
          >
            <Score
              scores={getScores(generatingProgress.step)}
              minMax={minMaxAssociations.current}
            />
          </div>
        )}

        {mode === Mode.EXPLANATION && currentGeneratedEffect && (
          <div id="explanation-area" className={moduleStyles.explanationArea}>
            <div className={moduleStyles.key}>
              {Array.from(Array(SLOT_COUNT).keys()).map(index => {
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
              {Array.from(Array(explanationProgress + 1).keys()).map(index => {
                return (
                  <div key={index} className={moduleStyles.visualizationColumn}>
                    <Score
                      scores={getScores(index)}
                      minMax={minMaxAssociations.current}
                    />

                    <div
                      className={moduleStyles.visualizationColumn}
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
          {mode === Mode.RESULTS && (
            <div>
              <Button
                id="explanation-button"
                text={'?'}
                onClick={handleExplanationClick}
                color={Button.ButtonColor.neutralDark}
                className={moduleStyles.button}
              />
            </div>
          )}

          {mode === Mode.EXPLANATION && (
            <Button
              id="results-final-button"
              text={i18n.danceAiModalBack()}
              onClick={handleLeaveExplanation}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}
        </div>

        <div id="buttons-area" className={moduleStyles.buttonsArea}>
          <div id="buttons-area-left" className={moduleStyles.buttonsAreaLeft}>
            {mode === Mode.RESULTS && (
              <Button
                id="regenerate"
                onClick={handleRegenerateClick}
                color={Button.ButtonColor.neutralDark}
                className={classNames(moduleStyles.button)}
              >
                <i
                  className={classNames(
                    'fa fa-refresh',
                    moduleStyles.buttonIcon
                  )}
                />
                {i18n.danceAiModalRegenerateButton()}
              </Button>
            )}
          </div>

          {mode === Mode.SELECT_INPUTS && currentInputSlot >= SLOT_COUNT && (
            <Button
              id="select-all-sections-button"
              text={i18n.danceAiModalGenerateButton()}
              onClick={handleGenerateClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
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
            />
          )}
          {showUseButton && (
            <Button
              id="use-button"
              text={i18n.danceAiModalUseEffectButton()}
              onClick={handleUseClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}
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
        backgroundImage: `url(${getImageUrl(item.id)})`,
      }}
      className={classNames(
        moduleStyles.emojiIcon,
        isButton && moduleStyles.emojiIconButton,
        isHighlighted && moduleStyles.emojiIconButtonHighlighted,
        className
      )}
      title={item.emoji}
    />
  );
};

interface ScoreProps {
  scores: GeneratedEffectScores;
  minMax: MinMax;
}

const Score: React.FunctionComponent<ScoreProps> = ({scores, minMax}) => {
  const range = minMax.max - minMax.min;
  const getScaledNumerator = (scores: GeneratedEffectScores) => {
    return scores.reduce(
      (scaledSum: number, score: number) => (scaledSum += score - minMax.min),
      0
    );
  };

  const getHeight = (scores: GeneratedEffectScores) =>
    Math.round(
      (getScaledNumerator(scores) / (range * SLOT_COUNT)) *
        SCORE_VISUALIZATION_HEIGHT
    );

  const layers = [
    {
      height: getHeight(scores),
      className: moduleStyles.barFillFirst,
    },
    {
      height: getHeight([scores[0], scores[1]]),
      className: moduleStyles.barFillSecond,
    },
    {
      height: getHeight([scores[0]]),
      className: moduleStyles.barFillThird,
    },
  ];

  return (
    <div className={moduleStyles.scoreContainer}>
      {layers.map((layer, index) => {
        return (
          <div
            key={index}
            className={moduleStyles.barContainer}
            style={{
              height: layer.height,
            }}
          >
            <div className={classNames(moduleStyles.barFill, layer.className)}>
              &nbsp;
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DanceAiModal;
