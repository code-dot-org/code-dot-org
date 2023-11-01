import React, {useState, useEffect, useCallback} from 'react';
import moduleStyles from './dance-ai-modal.module.scss';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {setCurrentAiModalField, DanceState} from '../danceRedux';
import classNames from 'classnames';
import {FieldDropdown, Workspace} from 'blockly/core';
import AiGeneratingView from './AiGeneratingView';
import {chooseEffects} from './DanceAiClient';
import AiVisualizationPreview from './AiVisualizationPreview';
import AiBlockPreview from './AiBlockPreview';
import AiExplanationView from './AiExplanationView';
import {AiOutput, FieldKey} from '../types';
import {generateBlocks, generateBlocksFromResult, getLabelMap} from './utils';
import inputLibraryJson from '@cdo/static/dance/ai/ai-inputs.json';
import aiBotBorder from '@cdo/static/dance/ai/ai-bot-border.png';
import aiBotBeam from '@cdo/static/dance/ai/blue-scanner.png';

enum Mode {
  SELECT_INPUTS = 'selectInputs',
  PROCESSING = 'processing',
  GENERATING = 'generating',
  RESULTS = 'results',
  RESULTS_FINAL = 'resultsFinal',
  EXPLANATION = 'explanation',
}

type AiModalItem = {
  id: string;
  name: string;
  emoji: string;
};

type AiModalReturnedItem = {
  id: string;
  name: string;
  url: string;
  available: boolean;
  emoji: string;
};

interface DanceAiProps {
  onClose: () => void;
}

const getImageUrl = (id: string) => {
  return `/blockly/media/dance/ai/emoji/${id}.svg`;
};

const DanceAiModal: React.FunctionComponent<DanceAiProps> = ({onClose}) => {
  const dispatch = useAppDispatch();

  const SLOT_COUNT = 3;

  const [mode, setMode] = useState(Mode.SELECT_INPUTS);
  const [currentInputSlot, setCurrentInputSlot] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [resultJson, setResultJson] = useState<string>('');
  const [generatingNodesDone, setGeneratingNodesDone] =
    useState<boolean>(false);
  const [processingDone, setProcessingDone] = useState<boolean>(false);
  const [generatingDone, setGeneratingDone] = useState<boolean>(false);
  const [typingDone, setTypingDone] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const currentAiModalField = useSelector(
    (state: {dance: DanceState}) => state.dance.currentAiModalField
  );

  const aiOutput = useSelector(
    (state: {dance: DanceState}) => state.dance.aiOutput
  );

  useEffect(() => {
    const currentValue = currentAiModalField?.getValue();

    if (currentValue) {
      setMode(Mode.RESULTS_FINAL);

      // The block value will be set to this JSON.
      setResultJson(currentValue);

      setShowPreview(true);

      setInputs(JSON.parse(currentValue).inputs);
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

  const getImageUrl = (id: string) => {
    return `/blockly/media/dance/ai/emoji/${id}.svg`;
  };

  const getAllItems = (slotIndex: number) => {
    if (slotIndex >= SLOT_COUNT) {
      return [];
    }

    return inputLibraryJson.items.map(item => {
      return {
        ...item,
        url: getImageUrl(item.id),
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

  const handleResultsClick = () => {
    setMode(Mode.RESULTS);
  };

  const handleResultsFinalClick = () => {
    setMode(Mode.RESULTS_FINAL);
  };

  const handleGenerateClick = () => {
    startAi();
    setMode(Mode.GENERATING);
  };

  const handleRegenerateClick = () => {
    // Reset state
    setTypingDone(false);
    setResultJson('');
    setShowPreview(false);
    setProcessingDone(false);
    setGeneratingNodesDone(false);
    setGeneratingDone(false);

    handleGenerateClick();
  };

  const handleProcessClick = () => {
    setMode(Mode.PROCESSING);
    setTimeout(() => {
      setProcessingDone(true);
    }, 4000);
  };

  const startAi = async () => {
    const responseJsonString = chooseEffects(inputs);
    const result = JSON.parse(responseJsonString);

    // "Pick" a subset of fields to be used.  Specifically, we exclude the
    // explanation, since we don't want it becoming part of the code.
    const pickedResult = (({
      backgroundEffect,
      backgroundColor,
      foregroundEffect,
    }) => ({
      backgroundEffect,
      backgroundColor,
      foregroundEffect,
    }))(result);

    const fullResult = {inputs, ...pickedResult};

    const fullResultJson = JSON.stringify(fullResult);

    // The block value will be set to this JSON.
    setResultJson(fullResultJson);
  };

  const handleConvertBlocks = () => {
    const blocksSvg = generateBlocksFromResult(
      Blockly.getMainWorkspace(),
      resultJson
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
      dispatch(setCurrentAiModalField(undefined));
    }
  };

  const handleUseClick = () => {
    currentAiModalField?.setValue(resultJson);
    dispatch(setCurrentAiModalField(undefined));
  };

  const handleExplanationClick = () => {
    setMode(Mode.EXPLANATION);
  };

  const handleStartOverClick = () => {
    setMode(Mode.SELECT_INPUTS);
    setInputs([]);
    setCurrentInputSlot(0);
    setTypingDone(false);
    setResultJson('');
    setShowPreview(false);
    setProcessingDone(false);
    setGeneratingNodesDone(false);
    setGeneratingDone(false);
  };

  let showConvertButton = false;
  let showUseButton = false;

  if ((mode === Mode.RESULTS && typingDone) || mode === Mode.RESULTS_FINAL) {
    if (aiOutput === AiOutput.GENERATED_BLOCKS || aiOutput === AiOutput.BOTH) {
      showConvertButton = true;
    }
    if (aiOutput === AiOutput.AI_BLOCK || aiOutput === AiOutput.BOTH) {
      showUseButton = true;
    }
  }

  const onBlockPreviewDone = useCallback(() => {
    if (mode === Mode.GENERATING) {
      setGeneratingDone(true);
    } else if (mode === Mode.RESULTS) {
      setShowPreview(true);
      setMode(Mode.RESULTS_FINAL);
      setTypingDone(true);
    }
  }, [mode, setGeneratingDone, setShowPreview, setTypingDone]);

  return (
    <AccessibleDialog
      className={moduleStyles.dialog}
      onClose={onClose}
      initialFocus={false}
    >
      <div id="ai-modal-header-area" className={moduleStyles.headerArea}>
        <img
          src={aiBotBorder}
          className={moduleStyles.botImage}
          alt="A.I. Bot"
        />
        generate &nbsp;
        <div className={moduleStyles.inputsContainer}>
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
        &nbsp; effects
        <div
          id="ai-modal-header-area-right"
          className={moduleStyles.headerAreaRight}
        >
          {mode === Mode.RESULTS_FINAL && (
            <Button
              id="explanation-button"
              text={'Explanation'}
              onClick={handleExplanationClick}
              color={Button.ButtonColor.white}
              className={classNames(
                moduleStyles.button,
                moduleStyles.buttonNoMargin,
                moduleStyles.buttonSmallText
              )}
            />
          )}
          {mode === Mode.EXPLANATION && (
            <Button
              id="results-final-button"
              text={'Back to Results'}
              onClick={handleResultsFinalClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={classNames(
                moduleStyles.button,
                moduleStyles.buttonNoMargin,
                moduleStyles.buttonSmallText
              )}
            />
          )}
        </div>
      </div>
      <div id="ai-modal-inner-area" className={moduleStyles.innerArea}>
        <div id="text-area" className={moduleStyles.textArea}>
          {' '}
          {mode === Mode.SELECT_INPUTS
            ? 'Choose three emoji for the mood of the effects.'
            : mode === Mode.PROCESSING && !processingDone
            ? 'A.I. is processing your input.'
            : mode === Mode.PROCESSING && processingDone
            ? 'A.I. is ready to generate effects!'
            : mode === Mode.GENERATING
            ? 'A.I. is generating code based on the emojis.'
            : mode === Mode.RESULTS && !typingDone
            ? ''
            : mode === Mode.RESULTS && typingDone
            ? 'A.I. generated code for your dance party!'
            : mode === Mode.RESULTS_FINAL
            ? 'A.I. generated code for your dance party!'
            : mode === Mode.EXPLANATION
            ? 'These are the associations between the emojis and this effect.'
            : undefined}
        </div>

        <div
          id="inputs-area"
          className={moduleStyles.inputsArea}
          style={{zIndex: mode === Mode.SELECT_INPUTS ? 1 : 0}}
        >
          {mode === Mode.SELECT_INPUTS && currentInputSlot < SLOT_COUNT && (
            <div className={moduleStyles.itemContainer}>
              {getAllItems(currentInputSlot).map(item => {
                return (
                  <EmojiIcon
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
            mode === Mode.RESULTS ||
            mode === Mode.RESULTS_FINAL) && (
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
                    : mode === Mode.RESULTS || mode === Mode.RESULTS_FINAL
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
                  alt="A.I. Bot Beam"
                />
                <img
                  src={aiBotBorder}
                  className={moduleStyles.image}
                  alt="A.I. Bot"
                />
              </div>
            </div>
          )}
        </div>

        <div id="generating-area" className={moduleStyles.generatingArea}>
          {mode === Mode.GENERATING && (
            <AiGeneratingView
              imageUrls={inputs.map(input => {
                return getImageUrl(input);
              })}
              onComplete={() => {
                setGeneratingNodesDone(true);
              }}
            />
          )}
        </div>

        <div className={moduleStyles.outputsArea}>
          {((mode === Mode.GENERATING && generatingNodesDone) ||
            mode === Mode.RESULTS ||
            mode === Mode.RESULTS_FINAL) && (
            <div
              id="generating-block-preview"
              className={classNames(
                moduleStyles.blockPreview,
                mode === Mode.GENERATING
                  ? moduleStyles.blockPreviewRight
                  : mode === Mode.RESULTS
                  ? moduleStyles.blockPreviewRightToCenter
                  : undefined
              )}
            >
              <AiBlockPreview
                fadeIn={mode === Mode.GENERATING}
                resultJson={resultJson}
                onComplete={onBlockPreviewDone}
              />
            </div>
          )}
        </div>

        {(mode === Mode.RESULTS || mode === Mode.RESULTS_FINAL) &&
          showPreview && (
            <div id="preview-area" className={moduleStyles.previewArea}>
              <AiVisualizationPreview
                blocks={generateBlocksFromResult(
                  Blockly.getMainWorkspace(),
                  resultJson
                )}
              />
            </div>
          )}

        {mode === Mode.EXPLANATION && (
          <div id="explanation-area" className={moduleStyles.explanationArea}>
            <AiExplanationView
              inputs={inputs}
              result={JSON.parse(resultJson)}
              labelMaps={getLabels()}
            />
          </div>
        )}

        <div id="buttons-area" className={moduleStyles.buttonsArea}>
          {mode === Mode.RESULTS_FINAL && (
            <div
              id="buttons-area-left"
              className={moduleStyles.buttonsAreaLeft}
            >
              <Button
                id="start-over-button"
                text={'Start over'}
                onClick={handleStartOverClick}
                color={Button.ButtonColor.white}
                className={classNames(moduleStyles.button)}
              />
              <Button
                id="regenerate"
                text={'Regenerate'}
                onClick={handleRegenerateClick}
                color={Button.ButtonColor.white}
                className={classNames(moduleStyles.button)}
              />
            </div>
          )}

          {mode === Mode.SELECT_INPUTS && currentInputSlot >= SLOT_COUNT && (
            <Button
              id="select-all-sections-button"
              text={'Process'}
              onClick={handleProcessClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {mode === Mode.PROCESSING && processingDone && (
            <Button
              id="generate-button"
              text={'Generate'}
              onClick={handleGenerateClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {mode === Mode.GENERATING && generatingDone && (
            <Button
              id="results-button"
              text={'Show effects'}
              onClick={handleResultsClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}
          {showConvertButton && (
            <Button
              id="convert-button"
              text={'Edit code'}
              onClick={handleConvertBlocks}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}
          {showUseButton && (
            <Button
              id="use-button"
              text={'Use'}
              onClick={handleUseClick}
              color={
                showConvertButton
                  ? Button.ButtonColor.white
                  : Button.ButtonColor.brandSecondaryDefault
              }
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
