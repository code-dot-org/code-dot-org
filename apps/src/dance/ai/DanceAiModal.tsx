import React, {useState, useEffect} from 'react';
import moduleStyles from './dance-ai-modal.module.scss';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {setCurrentAiModalField, DanceState} from '../danceRedux';
import {StrongText, Heading5} from '@cdo/apps/componentLibrary/typography';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {BlockSvg} from 'blockly/core';
import {doAi} from './utils';
import {AiOutput} from '../types';
import AiPreview from './AiPreview';
const Typist = require('react-typist').default;

const aiBotBorder = require('@cdo/static/dance/ai/ai-bot-border.png');

const promptString = 'Generate a scene using this mood:';

enum Mode {
  SELECT_INPUTS = 'selectInputs',
  GENERATING = 'generating',
  RESULTS = 'results',
  RESULTS_FINAL = 'resultsFinal',
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

const DanceAiModal: React.FunctionComponent<DanceAiProps> = ({onClose}) => {
  const dispatch = useAppDispatch();

  const SLOT_COUNT = 3;

  const inputLibraryFilename = 'ai-inputs';
  const inputLibrary = require(`@cdo/static/dance/ai/${inputLibraryFilename}.json`);

  const [mode, setMode] = useState(Mode.SELECT_INPUTS);
  const [currentInputSlot, setCurrentInputSlot] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [resultJson, setResultJson] = useState<string>('');
  const [resultExplanation, setResultExplanation] = useState<string>('');
  const [typingDone, setTypingDone] = useState<boolean>(false);

  const currentAiModalField = useSelector(
    (state: {dance: DanceState}) => state.dance.currentAiModalField
  );

  const aiOutput = useSelector(
    (state: {dance: DanceState}) => state.dance.aiOutput
  );

  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    const currentValue = currentAiModalField?.getValue();
    console.log(currentValue);

    if (currentValue) {
      setMode(Mode.RESULTS_FINAL);

      // The block value will be set to this JSON.
      setResultJson(currentValue);

      setShowPreview(true);
    }
  }, [currentAiModalField]);

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

  const handleGeneratingClick = () => {
    setMode(Mode.RESULTS);
  };

  const handleGenerateClick = () => {
    const inputNames = inputs.map(
      input =>
        inputLibrary.items.find((item: AiModalItem) => item.id === input).name
    );
    const request = `${promptString} ${inputNames.join(', ')}.`;
    startAi(inputs, request);
    setMode(Mode.GENERATING);
  };

  const startAi = async (inputs: string[], value: string) => {
    const resultJsonString = await doAi(value);
    const result = JSON.parse(resultJsonString);

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

    // The user will see this explanation.
    setResultExplanation(result.explanation);
  };

  /**
   * Generates blocks from the AI result in the main workspace, and attaches
   * them to each other.
   */
  const generateBlocksFromResult = (): [BlockSvg, BlockSvg] => {
    const params = JSON.parse(resultJson);

    const blocksSvg: [BlockSvg, BlockSvg] = [
      Blockly.getMainWorkspace().newBlock(
        'Dancelab_setForegroundEffect'
      ) as BlockSvg,
      Blockly.getMainWorkspace().newBlock(
        'Dancelab_setBackgroundEffectWithPalette'
      ) as BlockSvg,
    ];

    // Foreground block.
    blocksSvg[0].setFieldValue(params.foregroundEffect, 'EFFECT');

    // Background block.
    blocksSvg[1].setFieldValue(params.backgroundEffect, 'EFFECT');
    blocksSvg[1].setFieldValue(params.backgroundColor, 'PALETTE');

    // Connect the blocks.
    blocksSvg[0].nextConnection.connect(blocksSvg[1].previousConnection);

    return blocksSvg;
  };

  const convertBlocks = () => {
    const blocksSvg = generateBlocksFromResult();

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
    dispatch(setCurrentAiModalField(undefined));
  };

  const formatJsonString = (jsonString: string) => {
    return jsonString
      .replace(/":/g, '": ')
      .replace(/","/g, '", "')
      .replace(/,"/g, ', "');
  };

  // We might or might not wrap this with Typist.  Typist doesn't seem to cope
  // with this being a separate functional component.
  const resultsComponent = (mode === Mode.RESULTS ||
    mode === Mode.RESULTS_FINAL) && (
    <div>
      <Heading5>Code</Heading5>

      <pre className={classNames(moduleStyles.pre, moduleStyles.code)}>
        ai({formatJsonString(resultJson)})
      </pre>

      <div style={{display: resultExplanation !== '' ? 'block' : 'none'}}>
        <Heading5>Explanation</Heading5>
        <pre className={classNames(moduleStyles.pre, moduleStyles.explanation)}>
          {resultExplanation}
        </pre>
      </div>
    </div>
  );

  return (
    <AccessibleDialog
      className={moduleStyles.dialog}
      onClose={onClose}
      initialFocus={false}
    >
      <div id="inner-area" className={moduleStyles.innerArea}>
        <div id="text-area" className={moduleStyles.textArea}>
          <StrongText>
            {' '}
            {mode === Mode.SELECT_INPUTS
              ? 'Make a sentence by selecting some emoji.'
              : mode === Mode.GENERATING && resultJson === ''
              ? 'The AI is processing your sentence.'
              : mode === Mode.GENERATING && resultJson !== ''
              ? 'The AI is ready to generate results!'
              : mode === Mode.RESULTS && !typingDone
              ? 'The AI is generating results.'
              : mode === Mode.RESULTS && typingDone
              ? 'This is the result generated by the AI.'
              : mode === Mode.RESULTS_FINAL
              ? 'This was the result generated by the AI.'
              : undefined}
          </StrongText>
        </div>

        <div
          id="inputs-area"
          className={moduleStyles.inputsArea}
          style={{zIndex: mode === Mode.SELECT_INPUTS ? 1 : 0}}
        >
          {mode === Mode.SELECT_INPUTS && currentInputSlot < SLOT_COUNT && (
            <div className={moduleStyles.itemContainer}>
              {getAllItems(currentInputSlot).map(
                (item: AiModalReturnedItem, index: number) => {
                  return (
                    <div
                      tabIndex={
                        index === 0 && currentInputSlot === 0 ? 0 : undefined
                      }
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
              mode === Mode.SELECT_INPUTS || mode === Mode.GENERATING ? 1 : 0,
          }}
        >
          {(mode === Mode.SELECT_INPUTS ||
            (mode === Mode.GENERATING && resultJson === '')) && (
            <div className={moduleStyles.prompt}>
              {promptString}
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
            mode === Mode.GENERATING ||
            mode === Mode.RESULTS ||
            mode === Mode.RESULTS_FINAL) && (
            <div className={moduleStyles.botContainer}>
              <img
                src={aiBotBorder}
                className={classNames(
                  moduleStyles.bot,
                  mode === Mode.SELECT_INPUTS
                    ? moduleStyles.botAppearCentered
                    : mode === Mode.GENERATING
                    ? moduleStyles.botAppearCentered
                    : mode === Mode.RESULTS
                    ? moduleStyles.botCenterToLeft
                    : mode === Mode.RESULTS_FINAL
                    ? moduleStyles.botLeft
                    : undefined
                )}
              />
            </div>
          )}
          {mode === Mode.GENERATING && resultJson === '' && (
            <div className={moduleStyles.spinner}>
              <FontAwesome
                title={undefined}
                icon="spinner"
                className={classNames('fa-pulse', 'fa-3x')}
              />
            </div>
          )}
        </div>

        <div
          id="outputs-area"
          className={moduleStyles.outputsArea}
          style={{
            zIndex:
              mode === Mode.RESULTS || mode === Mode.RESULTS_FINAL ? 1 : 0,
          }}
        >
          {mode === Mode.RESULTS && (
            <Typist
              startDelay={1500}
              avgTypingDelay={20}
              cursor={{show: false}}
              onTypingDone={() => {
                setTypingDone(true);
                currentAiModalField?.setValue(resultJson);
                setShowPreview(true);
              }}
            >
              {resultsComponent}
            </Typist>
          )}
          {mode === Mode.RESULTS_FINAL && resultsComponent}
        </div>

        {showPreview && (
          <div id="preview-area" className={moduleStyles.previewArea}>
            <AiPreview blocks={generateBlocksFromResult()} />
          </div>
        )}

        <div className={moduleStyles.buttonsArea}>
          {mode === Mode.SELECT_INPUTS && currentInputSlot >= SLOT_COUNT && (
            <Button
              id="select-all-sections"
              text={'Process'}
              onClick={handleGenerateClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {mode === Mode.GENERATING && resultJson !== '' && (
            <Button
              id="done"
              text={'Generate results'}
              onClick={handleGeneratingClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {((mode === Mode.RESULTS && typingDone) ||
            mode === Mode.RESULTS_FINAL) && (
            <div>
              {(aiOutput === AiOutput.BLOCKS || aiOutput === AiOutput.BOTH) && (
                <Button
                  id="convert"
                  text={'Convert'}
                  onClick={convertBlocks}
                  color={Button.ButtonColor.brandSecondaryDefault}
                  className={moduleStyles.button}
                />
              )}
              {(aiOutput === AiOutput.BLOCK || aiOutput === AiOutput.BOTH) && (
                <Button
                  id="use"
                  text={'Use'}
                  onClick={handleUseClick}
                  color={Button.ButtonColor.brandSecondaryDefault}
                  className={moduleStyles.button}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </AccessibleDialog>
  );
};

export default DanceAiModal;
