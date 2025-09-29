import {Button} from '@code-dot-org/component-library/button';
import {Heading5} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';
import Adlib, {AdlibsType} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import NavigationButton from '@cdo/apps/lab2/views/components/Instructions/NavigationButton';
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
  levelProperties: LevelProperties;
}

const GenerateCode: React.FunctionComponent<GenerateCodeProps> = ({
  adlibOption,
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
      <Heading5 className={styles.heading}> Use AI</Heading5>

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
          {!adlibOption && (
            <textarea
              id="generate-description"
              onChange={evt => setPromptText(evt.target.value)}
              value={promptText}
              rows={4}
              className={styles.textArea}
            />
          )}
          {adlibOption && (
            <Adlib
              adlib={adlibs[adlibOption]}
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
          color="purple"
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
            color="purple"
            size="s"
            iconLeft={{iconName: 'sparkles'}}
            onClick={generateSong}
          />

          <Button
            ariaLabel={'Adjust prompt'}
            text={'Adjust prompt'}
            type="primary"
            color="purple"
            size="s"
            onClick={() => dispatch(setAiGenerateState('none'))}
          />

          <NavigationButton
            levelProperties={levelProperties}
            hasRun={true}
            hasEdited={false}
            className={styles.navigationButton}
          />
        </>
      )}
    </Guide>
  );
};

export default GenerateCode;
