import React, {useState, useEffect, useRef} from 'react';
import moduleStyles from './dance-ai-modal.module.scss';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {closeAiModal, DanceState} from '../danceRedux';
import classNames from 'classnames';
import {FieldDropdown, Workspace} from 'blockly/core';
import {chooseEffects, ChooseEffectsQuality} from './DanceAiClient';
import AiVisualizationPreview from './AiVisualizationPreview';
import AiBlockPreview from './AiBlockPreview';
import AiExplanationView from './AiExplanationView';
import {AiOutput, FieldKey, GeneratedEffect} from '../types';
import {generateBlocks, generateBlocksFromResult, getLabelMap} from './utils';
import color from '@cdo/apps/util/color';
const ToggleGroup = require('@cdo/apps/templates/ToggleGroup').default;

import inputLibraryJson from '@cdo/static/dance/ai/ai-inputs.json';

import aiBotBorder from '@cdo/static/dance/ai/bot/ai-bot-border.png';
import aiBotYes from '@cdo/static/dance/ai/bot/ai-bot-yes.png';
import aiBotNo from '@cdo/static/dance/ai/bot/ai-bot-no.png';
import aiBotBeam from '@cdo/static/dance/ai/bot/blue-scanner.png';

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

enum Mode {
  SELECT_INPUTS = 'selectInputs',
  PROCESSING = 'processing',
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

const getImageUrl = (id: string) => {
  return `/blockly/media/dance/ai/emoji/${id}.svg`;
};

const DanceAiModal: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  // How many emojis are to be selected.
  const SLOT_COUNT = 3;

  // How many low-scoring results we show before the chosen one.
  const BAD_GENERATED_RESULTS_COUNT = 4;

  // How many substeps for each step in the generating process.
  const GENERATING_SUBSTEP_COUNT = 2;

  // How long we spend in each substep in the generating process.
  const GENERATION_SUBSTEP_DURATION = 1000;

  const generatedEffects = useRef<GeneratedEffects>({
    badEffects: [],
    goodEffect: undefined,
  });

  const [mode, setMode] = useState(Mode.SELECT_INPUTS);
  const [currentInputSlot, setCurrentInputSlot] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [processingDone, setProcessingDone] = useState<boolean>(false);
  const [generatingProgress, setGeneratingProgress] =
    useState<GeneratingProgress>({
      step: 0,
      subStep: 0,
    });
  const [currentToggle, setCurrentToggle] = useState<Toggle>(Toggle.AI_BLOCK);

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
    const currentValue = currentAiModalField?.getValue();
    if (currentValue) {
      setMode(Mode.RESULTS);
      setInputs(JSON.parse(currentValue).inputs);
      setGeneratingProgress({step: BAD_GENERATED_RESULTS_COUNT, subStep: 0});

      generatedEffects.current = {
        badEffects: [],
        goodEffect: {results: JSON.parse(currentValue)},
      };
    }
  }, [currentAiModalField]);

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

  const getAllItems = (slotIndex: number) => {
    if (slotIndex >= SLOT_COUNT) {
      return [];
    }

    return inputLibraryJson.items.map(item => {
      return {
        ...item,
        available: !inputs.includes(item.id),
      };
    });
  };

  const getItem = (id: string) =>
    inputLibraryJson.items.find(item => item.id === id);

  const handleItemClick = (id: string) => {
    if (currentInputSlot < SLOT_COUNT) {
      setInputs([...inputs, id]);
      setCurrentInputSlot(currentInputSlot + 1);
    }
  };

  const handleGenerateClick = () => {
    startAi();

    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_GENERATED, {
      emojis: inputs,
    });

    setMode(Mode.GENERATING);
  };

  const handleStartOverClick = () => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_RESTARTED, {
      emojis: inputs,
    });
    setInputs([]);
    setCurrentInputSlot(0);
    setProcessingDone(false);
    setGeneratingProgress({step: 0, subStep: 0});
    setMode(Mode.SELECT_INPUTS);
  };

  const handleRegenerateClick = () => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_REGENERATED, {
      emojis: inputs,
    });
    setProcessingDone(false);
    setGeneratingProgress({step: 0, subStep: 0});
    handleGenerateClick();
  };

  const handleProcessClick = () => {
    setMode(Mode.PROCESSING);
    setTimeout(() => {
      handleGenerateClick();
    }, 4000);
  };

  const handleExplanationClick = () => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_EXPLAINED, {
      emojis: inputs,
    });
    setMode(Mode.EXPLANATION);
  };

  const handleUseClick = () => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_USED, {
      emojis: inputs,
      backgroundEffect:
        generatedEffects.current.goodEffect?.results.backgroundEffect,
      backgroundColor:
        generatedEffects.current.goodEffect?.results.backgroundColor,
      foregroundEffect:
        generatedEffects.current.goodEffect?.results.foregroundEffect,
    });

    currentAiModalField?.setValue(
      JSON.stringify({
        inputs,
        ...generatedEffects.current.goodEffect?.results,
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

  // Animate through the generating process.
  useInterval(
    () => {
      if (mode === Mode.GENERATING) {
        setGeneratingProgress(updateGeneratingProgress);
      }
    },
    mode === Mode.GENERATING ? GENERATION_SUBSTEP_DURATION : undefined
  );

  const startAi = async () => {
    generatedEffects.current = {
      badEffects: Array.from(Array(BAD_GENERATED_RESULTS_COUNT).keys()).map(
        () => chooseEffects(inputs, ChooseEffectsQuality.BAD)
      ),
      goodEffect: chooseEffects(inputs, ChooseEffectsQuality.GOOD),
    };
  };

  const getCurrentGeneratedEffect = () => {
    if (generatingProgress.step < BAD_GENERATED_RESULTS_COUNT) {
      return generatedEffects.current.badEffects[generatingProgress.step];
    } else if (generatedEffects.current.goodEffect) {
      return generatedEffects.current.goodEffect;
    } else {
      return undefined;
    }
  };

  const handleConvertBlocks = () => {
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_AI_BACKGROUND_EDITED, {
      emojis: inputs,
      backgroundEffect:
        generatedEffects.current.goodEffect?.results.backgroundEffect,
      backgroundColor:
        generatedEffects.current.goodEffect?.results.backgroundColor,
      foregroundEffect:
        generatedEffects.current.goodEffect?.results.foregroundEffect,
    });

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

  const onClose = () => dispatch(closeAiModal());

  const showUseButton =
    mode === Mode.RESULTS &&
    currentToggle === Toggle.AI_BLOCK &&
    (aiOutput === AiOutput.AI_BLOCK || aiOutput === AiOutput.BOTH);

  const showConvertButton =
    mode === Mode.RESULTS &&
    currentToggle === Toggle.CODE &&
    (aiOutput === AiOutput.GENERATED_BLOCKS || aiOutput === AiOutput.BOTH);

  let botImage = aiBotBorder;
  if (mode === Mode.GENERATING && generatingProgress.subStep >= 1) {
    botImage =
      generatingProgress.step < BAD_GENERATED_RESULTS_COUNT
        ? aiBotNo
        : aiBotYes;
  }

  const currentGeneratedEffect = getCurrentGeneratedEffect();

  return (
    <AccessibleDialog
      className={moduleStyles.dialog}
      onClose={onClose}
      initialFocus={false}
      styles={{modalBackdrop: moduleStyles.modalBackdrop}}
    >
      <div id="ai-modal-header-area" className={moduleStyles.headerArea}>
        <img src={aiBotBorder} className={moduleStyles.botImage} alt="A.I." />
        generate &nbsp;
        <div
          className={moduleStyles.inputsContainer}
          onClick={handleStartOverClick}
        >
          {Array.from(Array(SLOT_COUNT).keys()).map(index => {
            const item = getItem(inputs[index]);
            return (
              <div key={index} className={moduleStyles.emojiSlot}>
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
        &nbsp; effect
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
            <span className="sr-only">Close</span>
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
                Effect
              </button>
              <button key={1} type="button" value={Toggle.CODE}>
                Code
              </button>
            </ToggleGroup>
          </div>
        )}

        <div id="text-area" className={moduleStyles.textArea}>
          {' '}
          {mode === Mode.SELECT_INPUTS
            ? 'Choose three emojis.'
            : mode === Mode.PROCESSING && !processingDone
            ? ''
            : mode === Mode.PROCESSING && processingDone
            ? ''
            : mode === Mode.GENERATING && botImage === aiBotYes
            ? 'A.I. is generating this effect.'
            : mode === Mode.GENERATING
            ? 'A.I. is finding the best effect to generate.'
            : mode === Mode.RESULTS && currentToggle === Toggle.AI_BLOCK
            ? 'A.I. generated this effect.'
            : mode === Mode.RESULTS && currentToggle === Toggle.CODE
            ? 'Did you know? A.I. wrote this code to generate the effect.'
            : mode === Mode.EXPLANATION
            ? "Each emoji contributed to A.I.'s decision. Here are five possible effects and the calculations that A.I. made."
            : undefined}
        </div>

        <div
          id="inputs-area"
          className={moduleStyles.inputsArea}
          style={{zIndex: mode === Mode.SELECT_INPUTS ? 1 : 0}}
        >
          {mode === Mode.SELECT_INPUTS && currentInputSlot < SLOT_COUNT && (
            <div className={moduleStyles.itemContainer}>
              {getAllItems(currentInputSlot).map((item, index) => {
                return (
                  <EmojiIcon
                    key={index}
                    item={item}
                    onClick={() => item.available && handleItemClick(item.id)}
                    className={classNames(
                      moduleStyles.item,
                      item.available && moduleStyles.itemAvailable
                    )}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div
          id="prompt-area"
          className={moduleStyles.promptArea}
          style={{
            zIndex:
              mode === Mode.SELECT_INPUTS || mode === Mode.PROCESSING ? 1 : 0,
          }}
        >
          {(mode === Mode.SELECT_INPUTS ||
            (mode === Mode.PROCESSING && !processingDone)) && (
            <div className={moduleStyles.prompt}>
              {Array.from(Array(SLOT_COUNT).keys()).map(index => {
                const item = getItem(inputs[index]);
                return (
                  <div key={index} className={moduleStyles.inputContainer}>
                    {index === currentInputSlot && (
                      <div
                        className={classNames(
                          moduleStyles.arrowDown,
                          currentInputSlot === 0 &&
                            moduleStyles.arrowDownFirstAppear
                        )}
                      >
                        &nbsp;
                      </div>
                    )}
                    <div className={moduleStyles.inputBackground}>&nbsp;</div>

                    {item && (
                      <EmojiIcon
                        item={item}
                        className={moduleStyles.inputItem}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div id="bot-area" className={moduleStyles.botArea}>
          {((mode === Mode.SELECT_INPUTS && currentInputSlot >= SLOT_COUNT) ||
            mode === Mode.PROCESSING ||
            mode === Mode.GENERATING ||
            mode === Mode.RESULTS) && (
            <div className={moduleStyles.botContainer}>
              <div
                className={classNames(
                  moduleStyles.bot,
                  mode === Mode.SELECT_INPUTS
                    ? moduleStyles.botAppearCentered
                    : mode === Mode.PROCESSING
                    ? moduleStyles.botScanLeftToRight
                    : mode === Mode.GENERATING
                    ? moduleStyles.botCenterToLeft
                    : mode === Mode.RESULTS
                    ? moduleStyles.botLeft
                    : undefined
                )}
              >
                <img
                  src={aiBotBeam}
                  className={classNames(
                    moduleStyles.beamImage,
                    mode === Mode.PROCESSING &&
                      !processingDone &&
                      moduleStyles.beamImageVisible
                  )}
                  alt="A.I. Beam"
                />
                <img src={botImage} className={moduleStyles.image} alt="A.I." />
              </div>
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
                    blocks={generateBlocksFromResult(
                      Blockly.getMainWorkspace(),
                      JSON.stringify(currentGeneratedEffect?.results)
                    )}
                  />
                </div>
                <div id="flip-card-back" className={moduleStyles.flipCardBack}>
                  {mode === Mode.RESULTS && (
                    <div
                      id="block-preview"
                      className={moduleStyles.blockPreview}
                    >
                      <AiBlockPreview
                        resultJson={JSON.stringify(
                          currentGeneratedEffect?.results
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === Mode.EXPLANATION && currentGeneratedEffect && (
          <div id="explanation-area" className={moduleStyles.explanationArea}>
            <AiExplanationView
              inputs={inputs}
              results={currentGeneratedEffect.results}
              labelMaps={getLabels()}
            />
          </div>
        )}

        <div id="buttons-area-top" className={moduleStyles.buttonsAreaTop}>
          {mode === Mode.RESULTS && (
            <div>
              <Button
                id="regenerate"
                onClick={handleRegenerateClick}
                color={Button.ButtonColor.white}
                className={classNames(moduleStyles.button)}
              >
                <i className="fa fa-refresh" />
              </Button>
              <Button
                id="explanation-button"
                text={'?'}
                onClick={handleExplanationClick}
                color={Button.ButtonColor.white}
                className={moduleStyles.button}
              />
            </div>
          )}

          {mode === Mode.EXPLANATION && (
            <Button
              id="results-final-button"
              text={'Back'}
              onClick={handleLeaveExplanation}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}
        </div>

        <div id="buttons-area" className={moduleStyles.buttonsArea}>
          <div
            id="buttons-area-left"
            className={moduleStyles.buttonsAreaLeft}
          />

          {mode === Mode.SELECT_INPUTS && currentInputSlot >= SLOT_COUNT && (
            <Button
              id="select-all-sections-button"
              text={'Generate'}
              onClick={handleProcessClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {mode === Mode.PROCESSING && processingDone && (
            <Button
              id="generate-button"
              text={'Generate'}
              onClick={handleGenerateClick()}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {showConvertButton && (
            <Button
              id="convert-button"
              text={'Use code'}
              onClick={handleConvertBlocks}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
              disabled={aiModalOpenedFromFlyout}
            />
          )}
          {showUseButton && (
            <Button
              id="use-button"
              text={'Use effect'}
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
}

const EmojiIcon: React.FunctionComponent<EmojiIconProps> = ({
  item,
  onClick,
  className,
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
        className
      )}
      title={item.emoji}
    />
  );
};

export default DanceAiModal;
