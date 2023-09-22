import React, {useState} from 'react';
import moduleStyles from './dance-ai.module.scss';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from '@cdo/apps/aichat/constants';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {setShowingAi} from './danceRedux';

const promptString = 'Generate a scene using this mood:';

const doAi = async (input: string) => {
  const systemPrompt =
    'You are a helper which can accept a request for a mood or atmosphere, and you then generate JSON like the following format: {backgroundColor: "black", backgroundEffect: "splatter", foregroundEffect: "rain"}.  The only valid values for backgroundEffect are circles, color_cycle, diamonds, disco_ball, fireworks, swirl, kaleidoscope, lasers, splatter, rainbow, snowflakes, galaxy, sparkles, spiral, disco, stars.  The only valid values for backgroundColor are rave, cool, electronic, iceCream, neon, tropical, vintage, warm.  The only valid values for foregroundEffect are bubbles, confetti, hearts_red, music_notes, pineapples, pizzas, smiling_poop, rain, floating_rainbows, smile_face, spotlight, color_lights, raining_tacos.  Make sure you always generate all three of those values.  Also, if you receive a request to place a dancer somewhere, then add {setDancer: "true"} to the result JSON.  Also, add a field called "explanation" to the result JSON, which contains a single-sentence explanation of why you chose the values that you did, at the reading level of a 5th-grade school student.';

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
  systemPrompt: string;
  onClose: () => {};
}

const DanceAi: React.FunctionComponent<DanceAiProps> = ({
  systemPrompt,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const ITEM_COUNT = 3;

  const inputLibraryFilename = 'ai-inputs';
  const inputLibrary = require(`@cdo/static/dance/${inputLibraryFilename}.json`);

  const [mode, setMode] = useState('selectInputs');
  const [currentInputSlot, setCurrentInputSlot] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);

  const showingAi = useSelector((state: {dance: any}) => state.dance.showingAi);

  const getImageUrl = (id: string) => {
    return `/blockly/media/dance/ai/${id}.png`;
  };

  const getAllItems = (slotIndex: number) => {
    if (slotIndex >= ITEM_COUNT) {
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
    if (currentInputSlot < ITEM_COUNT) {
      setInputs([...inputs, id]);
      setCurrentInputSlot(currentInputSlot + 1);
    }
  };

  const handleGenerateClick = () => {
    const request = promptString + inputs.join(', ');
    startAi(request);
    setMode('generating');
  };

  const startAi = async (value: string) => {
    // Call the main repo's doAI function which will transform this
    // block's value into a useful response.
    const response = await doAi(value);

    setMode('results');

    const params = JSON.parse(response);
    console.log('handle AI:', params);

    showingAi.setValue(response);

    /*
      this.setBackgroundEffect(
        params.backgroundEffect,
        params.backgroundColor
      );

      this.setForegroundEffect(params.foregroundEffect);

      if (params.setDancer) {
        this.makeNewDanceSprite('MOOSE', 'harold', null);
      }*/
  };

  const handleDoneClick = () => {
    dispatch(setShowingAi(false));
  };

  return (
    <AccessibleDialog className={moduleStyles.dialog} onClose={onClose}>
      <div tabIndex={0}>AI</div>

      {mode === 'generating' && <div>Please wait</div>}
      {mode === 'selectInputs' && (
        <div>
          <div className={moduleStyles.itemContainer}>
            {getAllItems(currentInputSlot).map((item: any) => {
              return (
                <img
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  src={item.url}
                  className={moduleStyles.item}
                />
              );
            })}
          </div>
          <div>
            {promptString}
            {inputs.map((input, index) => {
              return (
                inputs[index] && (
                  <img
                    key={inputs[index]}
                    src={getImageUrl(inputs[index])}
                    className={moduleStyles.item}
                  />
                )
              );
            })}
          </div>
          {currentInputSlot >= ITEM_COUNT && (
            <Button
              id="select-all-sections"
              text={'Generate'}
              onClick={handleGenerateClick}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
          )}
        </div>
      )}
      {mode === 'results' && (
        <div>
          Done!
          <Button
            id="done"
            text={'Done'}
            onClick={handleDoneClick}
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        </div>
      )}
    </AccessibleDialog>
  );
};

export default DanceAi;
