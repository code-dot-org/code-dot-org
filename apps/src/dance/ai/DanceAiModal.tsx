import React, {useState, useEffect, useCallback, useRef} from 'react';
import moduleStyles from './dance-ai-modal.module.scss';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {setCurrentAiModalField, DanceState} from '../danceRedux';
import classNames from 'classnames';
import {FieldDropdown, Workspace} from 'blockly/core';
import {chooseEffects} from './DanceAiClient';
import AiVisualizationPreview from './AiVisualizationPreview';
import AiBlockPreview from './AiBlockPreview';
import AiExplanationView from './AiExplanationView';
import {AiOutput, FieldKey} from '../types';
import {generateBlocks, generateBlocksFromResult, getLabelMap} from './utils';
const ToggleGroup = require('@cdo/apps/templates/ToggleGroup').default;
import color from '@cdo/apps/util/color';

const aiBotBorder = require('@cdo/static/dance/ai/bot/ai-bot-border.png');
const aiBotYes = require('@cdo/static/dance/ai/bot/ai-bot-yes.png');
const aiBotNo = require('@cdo/static/dance/ai/bot/ai-bot-no.png');
const aiBotBeam = require('@cdo/static/dance/ai/bot/blue-scanner.png');

enum Mode {
  SELECT_INPUTS = 'selectInputs',
  PROCESSING = 'processing',
  GENERATING = 'generating',
  RESULTS = 'results',
  EXPLANATION = 'explanation',
}

type AiModalItem = {
  id: string;
  name: string;
};

type AiModalReturnedItem = {
  id: string;
  name: string;
  url: string;
  available: boolean;
};

interface DanceAiProps {
  onClose: () => void;
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

const DanceAiModal: React.FunctionComponent<DanceAiProps> = ({onClose}) => {
  const dispatch = useAppDispatch();

  const SLOT_COUNT = 3;
  const BAD_RESULTS_COUNT = 7;
  const GENERATING_SUBSTEP_COUNT = 2;

  const inputLibraryFilename = 'ai-inputs';
  const inputLibrary = require(`@cdo/static/dance/ai/${inputLibraryFilename}.json`);

  const allResults = useRef<any[]>([]);

  const [mode, setMode] = useState(Mode.SELECT_INPUTS);
  const [currentInputSlot, setCurrentInputSlot] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [processingDone, setProcessingDone] = useState<boolean>(false);
  const [generatingStep, setGeneratingStep] = useState<number[]>([0, 0]);
  const [currentToggle, setCurrentToggle] = useState<string>('ai-block');

  const currentAiModalField = useSelector(
    (state: {dance: DanceState}) => state.dance.currentAiModalField
  );

  const aiOutput = useSelector(
    (state: {dance: DanceState}) => state.dance.aiOutput
  );

  useEffect(() => {
    const currentValue = currentAiModalField?.getValue();

    if (currentValue) {
      setMode(Mode.RESULTS);

      allResults.current = [];
      allResults.current[BAD_RESULTS_COUNT] = {
        results: JSON.parse(currentValue),
      };

      setGeneratingStep([BAD_RESULTS_COUNT, 0]);

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

    return inputLibrary.items.map((item: AiModalItem) => {
      return {
        id: item.id,
        name: item.name,
        url: getImageUrl(item.id),
        available: !inputs.includes(item.id),
      };
    });
  };

  const getItemName = (id: string) => {
    return inputLibrary.items.find(
      (item: AiModalReturnedItem) => item.id === id
    )?.name;
  };

  const handleItemClick = (id: string) => {
    if (currentInputSlot < SLOT_COUNT) {
      setInputs([...inputs, id]);
      setCurrentInputSlot(currentInputSlot + 1);
    }
  };

  const handleResultsClick = () => {
    setMode(Mode.RESULTS);
  };

  const handleExplanationClick = () => {
    setMode(Mode.EXPLANATION);
  };

  useInterval(
    () => {
      console.log('begin tick');

      if (mode === Mode.GENERATING) {
        let currentGeneratingStep = [...generatingStep];

        if (currentGeneratingStep[1] < GENERATING_SUBSTEP_COUNT - 1) {
          // bump substep.
          currentGeneratingStep[1]++;
        } else if (currentGeneratingStep[0] < BAD_RESULTS_COUNT) {
          // bump step and reset substep;
          currentGeneratingStep[0]++;
          currentGeneratingStep[1] = 0;
        } else {
          // leave these values but go to results.
          setMode(Mode.RESULTS);
        }

        // one-shot update of step & substep.
        setGeneratingStep(currentGeneratingStep);

        console.log('end tick', currentGeneratingStep);
      }
    },
    mode === Mode.GENERATING ? 1000 : undefined
  );

  const getScore = (scores: any) => {
    const total =
      scores.backgroundEffectScore +
      scores.foregroundEffectScore +
      scores.backgroundColorScore;
    return total;
  };

  const handleGenerateClick = () => {
    startAi();
    setMode(Mode.GENERATING);
  };

  const handleStartOverClick = () => {
    setMode(Mode.SELECT_INPUTS);
    setInputs([]);
    setCurrentInputSlot(0);
    setProcessingDone(false);
    setGeneratingStep([0, 0]);
  };

  const handleRegenerateClick = () => {
    setProcessingDone(false);
    setGeneratingStep([0, 0]);

    handleGenerateClick();
  };

  const handleProcessClick = () => {
    setMode(Mode.PROCESSING);
    setTimeout(() => {
      handleGenerateClick();
      //setProcessingDone(true);
    }, 4000);
  };

  const startAi = async () => {
    const result = chooseEffects(inputs, true);

    allResults.current = [];

    const badResultsList: any = [];
    // Grab some bad results too.
    for (let i = 0; i < BAD_RESULTS_COUNT; i++) {
      allResults.current[i] = chooseEffects(inputs, false);
    }

    allResults.current[BAD_RESULTS_COUNT] = result;

    console.log('all results', allResults);
  };

  const handleConvertBlocks = () => {
    const blocksSvg = generateBlocksFromResult(
      Blockly.getMainWorkspace(),
      JSON.stringify(allResults.current[generatingStep[0]].results)
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
    currentAiModalField?.setValue(
      JSON.stringify({inputs, ...allResults.current[BAD_RESULTS_COUNT].results})
    );
    dispatch(setCurrentAiModalField(undefined));
  };

  const handleLeaveExplanation = () => {
    setMode(Mode.RESULTS);
  };

  const showUseButton =
    mode === Mode.RESULTS &&
    currentToggle === 'ai-block' &&
    (aiOutput === AiOutput.AI_BLOCK || aiOutput === AiOutput.BOTH);

  const showConvertButton =
    mode === Mode.RESULTS &&
    currentToggle === 'code' &&
    (aiOutput === AiOutput.GENERATED_BLOCKS || aiOutput === AiOutput.BOTH);

  const botImage =
    mode === Mode.GENERATING &&
    generatingStep[0] < BAD_RESULTS_COUNT &&
    generatingStep[1] >= 1
      ? aiBotNo
      : mode === Mode.GENERATING && generatingStep[1] >= 1
      ? aiBotYes
      : aiBotBorder;

  return (
    <AccessibleDialog
      className={moduleStyles.dialog}
      onClose={onClose}
      initialFocus={false}
      styles={{modalBackdrop: moduleStyles.modalBackdrop}}
    >
      <div id="ai-modal-header-area" className={moduleStyles.headerArea}>
        <img src={aiBotBorder} className={moduleStyles.botImage} />
        generate &nbsp;
        <div
          className={moduleStyles.inputsContainer}
          onClick={handleStartOverClick}
        >
          {Array.from(Array(SLOT_COUNT).keys()).map(index => (
            <div
              key={index}
              style={{
                backgroundImage:
                  inputs[index] && `url(${getImageUrl(inputs[index])}`,
              }}
              className={moduleStyles.emojiSlot}
              title={getItemName(inputs[index])}
            />
          ))}
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
              onChange={(value: string) => {
                setCurrentToggle(value);
              }}
            >
              <button key={0} type="button" value={'ai-block'}>
                Effect
              </button>
              <button key={1} type="button" value={'code'}>
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
            : mode === Mode.GENERATING
            ? 'A.I. is finding the best effect to generate.'
            : mode === Mode.RESULTS && currentToggle === 'ai-block'
            ? 'A.I. generated this effect.'
            : mode === Mode.RESULTS && currentToggle === 'code'
            ? 'Did you know? A.I. wrote this code to generate the effect.'
            : mode === Mode.EXPLANATION
            ? "Each emoji contributes to A.I.'s decision. Here are five possible effects and the calculations that A.I. made."
            : undefined}
        </div>

        <div
          id="inputs-area"
          className={moduleStyles.inputsArea}
          style={{zIndex: mode === Mode.SELECT_INPUTS ? 1 : 0}}
        >
          {mode === Mode.SELECT_INPUTS && currentInputSlot < SLOT_COUNT && (
            <div className={moduleStyles.itemContainer}>
              {getAllItems(currentInputSlot).map(
                (item: AiModalReturnedItem) => {
                  return (
                    <button
                      type={'button'}
                      key={item.id}
                      onClick={() => item.available && handleItemClick(item.id)}
                      style={{
                        backgroundImage: `url(${item.url})`,
                      }}
                      className={classNames(
                        moduleStyles.item,
                        item.available && moduleStyles.itemAvailable
                      )}
                      title={item.name}
                    />
                  );
                }
              )}
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

                    {inputs[index] && (
                      <div
                        style={{
                          backgroundImage: `url(${getImageUrl(inputs[index])}`,
                        }}
                        className={moduleStyles.inputItem}
                        title={getItemName(inputs[index])}
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
                />
                <img src={botImage} className={moduleStyles.image} />
              </div>
            </div>
          )}
          {mode === Mode.GENERATING && (
            /*generatingStep[1] >= 1 && */ <div className={moduleStyles.score}>
              <div className={moduleStyles.barContainer}>
                <div
                  className={moduleStyles.barFill}
                  style={{
                    width: Math.round(
                      2 *
                        getScore(
                          allResults.current[
                            generatingStep[0] > BAD_RESULTS_COUNT
                              ? BAD_RESULTS_COUNT
                              : generatingStep[0]
                          ].scores
                        ) *
                        10
                    ),
                  }}
                >
                  &nbsp;
                </div>
              </div>
              <div className={moduleStyles.text}>
                {Math.round(
                  getScore(
                    allResults.current[
                      generatingStep[0] > BAD_RESULTS_COUNT
                        ? BAD_RESULTS_COUNT
                        : generatingStep[0]
                    ].scores
                  ) * 10
                )}
              </div>
            </div>
          )}
        </div>

        {(mode === Mode.GENERATING || mode === Mode.RESULTS) && (
          <div
            key={'preview-' + generatingStep[0]}
            id="preview-area"
            className={moduleStyles.previewArea}
          >
            <div id="flip-card" className={moduleStyles.flipCard}>
              <div
                id="flip-card-inner"
                className={classNames(
                  moduleStyles.flipCardInner,
                  mode === Mode.RESULTS &&
                    currentToggle === 'code' &&
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
                      JSON.stringify(
                        allResults.current[generatingStep[0]].results
                      )
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
                          allResults.current[generatingStep[0]].results
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === Mode.EXPLANATION && (
          <div id="explanation-area" className={moduleStyles.explanationArea}>
            <AiExplanationView
              inputs={inputs}
              result={allResults.current[BAD_RESULTS_COUNT]}
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
              onClick={() => {
                handleGenerateClick();
              }}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {/*mode === Mode.GENERATING && generatingStep[0] >= 4 && (
            <Button
              id="results-button"
              text={'Continue'}
              onClick={handleResultsClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )*/}

          {showConvertButton && (
            <Button
              id="convert-button"
              text={'Use code'}
              onClick={handleConvertBlocks}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
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

export default DanceAiModal;
