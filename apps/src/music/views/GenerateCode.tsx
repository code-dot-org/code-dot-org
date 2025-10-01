import {Button} from '@code-dot-org/component-library/button';
import {Heading5} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {
  AdlibsType,
  AdlibType,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {generateBlocklyJson} from '../ai/generate/generateBlocklyJson';
import {generateSongAi, generateSongCache} from '../ai/generate/GenerateCode';
import adlibsUntyped from '../ai/generate/GenerateCodeAdlibs.json';
import {
  DefaultContext,
  DefaultPrompt,
} from '../ai/generate/GenerateCodeContent';
import appConfig from '../appConfig';
import {setCodeToLoad, setAiGenerateState} from '../redux/musicRedux';

import styles from './GenerateCode.module.scss';

const adlibs = adlibsUntyped as AdlibsType;

interface GenerateCodeProps {
  adlibOption?: string;
  adlib?: AdlibType;
  levelProperties: LevelProperties;
}

const GenerateCode: React.FunctionComponent<GenerateCodeProps> = ({
  adlibOption,
  adlib,
  levelProperties,
}) => {
  const dispatch = useAppDispatch();

  const packId = useAppSelector(state => state.music.packId) || '';
  const aiGenerateState = useAppSelector(state => state.music.aiGenerateState);

  const useCache = appConfig.getValue('ai-generate-cache') === 'true';
  const showFullContext =
    appConfig.getValue('ai-generate-full-context') === 'true';

  // The array of user choices in the adlib.
  const [choices, setChoices] = useState<string[] | undefined>(undefined);

  const [contextText, setContextText] = useState(DefaultContext);

  const [promptText, setPromptText] = useState(
    adlibOption ? undefined : DefaultPrompt
  );

  // Use legacy adlib ID, adlib object, or new adlib ID.
  const useAdlib =
    adlib && typeof adlib === 'string'
      ? adlibs[adlib]
      : adlib
      ? adlib
      : adlibOption
      ? adlibs[adlibOption]
      : undefined;

  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    dispatch(setAiGenerateState('none'));
  });

  const generateSong = useCallback(async () => {
    dispatch(setAiGenerateState('generating'));

    const pseudocode = await (useCache
      ? generateSongCache(adlibs, adlibOption || 'complex', packId, choices)
      : generateSongAi(contextText, packId, promptText || ''));

    if (pseudocode) {
      const resultBlockly = generateBlocklyJson(pseudocode);
      dispatch(setCodeToLoad(resultBlockly));
    }

    dispatch(setAiGenerateState('done'));
  }, [
    adlibOption,
    choices,
    contextText,
    dispatch,
    packId,
    promptText,
    useCache,
  ]);

  if (!packId) {
    return null;
  }

  return (
    <Guide id="generate-panel">
      {!levelProperties.longInstructions && (
        <Heading5 className={styles.heading}> Use AI</Heading5>
      )}

      {levelProperties.longInstructions && (
        <MainInstructionsContent
          instructionsText={levelProperties.longInstructions}
          handleInstructionsTextClick={() => {}}
        />
      )}

      {showFullContext && aiGenerateState === 'none' && (
        <textarea
          id="generate-context"
          onChange={evt => setContextText(evt.target.value)}
          value={contextText}
          rows={6}
          className={classNames(styles.textArea, styles.textAreaSmall)}
        />
      )}
      {(aiGenerateState === 'generating' || aiGenerateState === 'done') && (
        <div className={styles.textArea}>{promptText}</div>
      )}

      {aiGenerateState === 'none' && (
        <>
          {!useAdlib && (
            <textarea
              id="generate-description"
              onChange={evt => setPromptText(evt.target.value)}
              value={promptText}
              rows={4}
              className={styles.textArea}
            />
          )}
          {useAdlib && (
            <Adlib
              adlib={useAdlib}
              onChange={(text, choices) => {
                setPromptText(text);
                setChoices(choices);
              }}
              className={styles.textArea}
            />
          )}
        </>
      )}

      {aiGenerateState === 'generating' ? 'Generating a song...' : ''}

      {aiGenerateState === 'none' && (
        <Button
          ariaLabel={'Generate song'}
          text={'Generate song'}
          type="primary"
          color="black"
          size="s"
          iconLeft={{iconName: 'sparkles'}}
          onClick={generateSong}
        />
      )}

      {aiGenerateState === 'done' && (
        <>
          <div>Here is the code that was generated.</div>

          <Button
            ariaLabel={'Generate again'}
            text={'Generate again'}
            type="primary"
            color="black"
            size="s"
            iconLeft={{iconName: 'sparkles'}}
            onClick={generateSong}
          />

          <Button
            ariaLabel={'Adjust prompt'}
            text={'Adjust prompt'}
            type="primary"
            color="black"
            size="s"
            onClick={() => dispatch(setAiGenerateState('none'))}
          />

          <Button
            ariaLabel={'Continue'}
            text={'Continue'}
            type="primary"
            color="black"
            size="s"
            iconRight={{iconName: 'arrow-right', iconStyle: 'solid'}}
            onClick={() => dispatch(continueOrFinishLesson())}
          />
        </>
      )}
    </Guide>
  );
};

export default GenerateCode;
