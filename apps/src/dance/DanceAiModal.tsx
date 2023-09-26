import React, {useState} from 'react';
import moduleStyles from './dance-ai.module.scss';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from '@cdo/apps/aichat/constants';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {setShowingAi} from './danceRedux';
import {StrongText, Heading5} from '@cdo/apps/componentLibrary/typography';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
const Typist = require('react-typist').default;

const aiBotBorder = require('@cdo/static/dance/ai-bot-border.png');

const promptString = 'Generate a scene using this mood:';

const doAi = async (input: string) => {
  const systemPrompt =
    'You are a helper which can accept a request for a mood or atmosphere, and you then generate JSON like the following format: {backgroundColor: "black", backgroundEffect: "splatter", foregroundEffect: "rain"}.  The only valid values for backgroundEffect are circles, color_cycle, diamonds, disco_ball, fireworks, swirl, kaleidoscope, lasers, splatter, rainbow, snowflakes, galaxy, sparkles, spiral, disco, stars.  The only valid values for backgroundColor are rave, cool, electronic, iceCream, neon, tropical, vintage, warm.  The only valid values for foregroundEffect are bubbles, confetti, hearts_red, music_notes, pineapples, pizzas, smiling_poop, rain, floating_rainbows, smile_face, spotlight, color_lights, raining_tacos.  Make sure you always generate all three of those values.  Also, add a field called "explanation" to the result JSON, which contains a simple explanation of why you chose the values that you did, at the reading level of a 5th-grade school student, in one sentence of less than forty words.';

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: input,
    },
  ];

  console.log('do AI:', input);

  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify({messages}),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  if (response.status === 200) {
    const res = await response.json();
    return res.content;
  } else {
    return null;
  }
};

interface DanceAiProps {
  onClose: () => void;
}

const DanceAiModal: React.FunctionComponent<DanceAiProps> = ({onClose}) => {
  const dispatch = useAppDispatch();

  const SLOT_COUNT = 3;

  const inputLibraryFilename = 'ai-inputs';
  const inputLibrary = require(`@cdo/static/dance/${inputLibraryFilename}.json`);

  const [mode, setMode] = useState('selectInputs');
  const [currentInputSlot, setCurrentInputSlot] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [responseParams, setResponseParams] = useState<string>('');
  const [responseExplanation, setResponseExplanation] = useState<string>('');
  const [typingDone, setTypingDone] = useState<boolean>(false);

  const showingAi = useSelector((state: {dance: any}) => state.dance.showingAi);

  const getImageUrl = (id: string) => {
    return `/blockly/media/dance/ai/${id}.png`;
  };

  const getAllItems = (slotIndex: number) => {
    if (slotIndex >= SLOT_COUNT) {
      return [];
    }

    return inputLibrary.options[slotIndex].map((option: string) => {
      const item = inputLibrary.items.find((item: any) => item.id === option);
      return {
        id: item.id,
        name: item.name,
        url: getImageUrl(item.id),
      };
    });
  };

  const handleItemClick = (id: string) => {
    if (currentInputSlot < SLOT_COUNT) {
      setInputs([...inputs, id]);
      setCurrentInputSlot(currentInputSlot + 1);
    }
  };

  const handleGeneratingClick = () => {
    setMode('results');
  };

  const handleGenerateClick = () => {
    const inputNames = inputs.map(
      input => inputLibrary.items.find((item: any) => item.id === input).name
    );
    const request = `${promptString} ${inputNames.join(', ')}.`;
    startAi(request);
    setMode('generating');
  };

  const startAi = async (value: string) => {
    const response = await doAi(value);

    const params = JSON.parse(response);

    showingAi.setValue(response);

    const picked = (({
      backgroundEffect,
      backgroundColor,
      foregroundEffect,
    }) => ({backgroundEffect, backgroundColor, foregroundEffect}))(params);

    const pickedString = JSON.stringify(picked)
      .replace(/":"/g, '": "')
      .replace(/","/g, '", "');
    setResponseParams(`ai(${pickedString})`);
    setResponseExplanation(params.explanation);
  };

  const handleDoneClick = () => {
    dispatch(setShowingAi(undefined));
  };

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
            {mode === 'selectInputs'
              ? 'Make a sentence by selecting some emoji.'
              : mode === 'generating' && responseParams === ''
              ? 'The AI is processing your sentence.'
              : mode === 'generating' && responseParams !== ''
              ? 'The AI is ready to generate results!'
              : mode === 'results' && !typingDone
              ? 'The AI is generating results.'
              : mode === 'results' && typingDone
              ? 'This is the result generated by the AI.'
              : undefined}
          </StrongText>
        </div>

        <div
          id="inputs-area"
          className={moduleStyles.inputsArea}
          style={{zIndex: mode === 'selectInputs' ? 1 : 0}}
        >
          {mode === 'selectInputs' && currentInputSlot < SLOT_COUNT && (
            <div className={moduleStyles.itemContainer}>
              {getAllItems(currentInputSlot).map((item: any, index: number) => {
                return (
                  <img
                    tabIndex={
                      index === 0 && currentInputSlot === 0 ? 0 : undefined
                    }
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    src={item.url}
                    className={moduleStyles.item}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div id="prompt-area" className={moduleStyles.promptArea}>
          {(mode === 'selectInputs' ||
            (mode === 'generating' && responseParams === '')) && (
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
                      <img
                        src={getImageUrl(inputs[index])}
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
          {((mode === 'selectInputs' && currentInputSlot >= SLOT_COUNT) ||
            mode === 'generating' ||
            mode === 'results') && (
            <div className={moduleStyles.botContainer}>
              <img
                src={aiBotBorder}
                className={classNames(
                  moduleStyles.bot,
                  mode === 'selectInputs'
                    ? moduleStyles.botAppearCentered
                    : mode === 'generating'
                    ? moduleStyles.botAppearCentered
                    : mode === 'results'
                    ? moduleStyles.botCenterToLeft
                    : undefined
                )}
              />
            </div>
          )}
          {mode === 'generating' && responseParams === '' && (
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
          style={{zIndex: mode === 'results' ? 1 : 0}}
        >
          {mode === 'results' && (
            <Typist
              startDelay={1500}
              avgTypingDelay={30}
              cursor={{show: false}}
              onTypingDone={() => {
                setTypingDone(true);
              }}
            >
              <Heading5>Code</Heading5>
              <pre className={moduleStyles.pre}>{responseParams}</pre>
              <Heading5>Explanation</Heading5>
              <pre className={moduleStyles.pre}>{responseExplanation}</pre>
            </Typist>
          )}
        </div>

        <div className={moduleStyles.buttonsArea}>
          {mode === 'selectInputs' && currentInputSlot >= SLOT_COUNT && (
            <Button
              id="select-all-sections"
              text={'Process'}
              onClick={handleGenerateClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {mode === 'generating' && responseParams !== '' && (
            <Button
              id="done"
              text={'Generate results'}
              onClick={handleGeneratingClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {mode === 'results' && typingDone && (
            <Button
              id="done"
              text={'Done'}
              onClick={handleDoneClick}
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
