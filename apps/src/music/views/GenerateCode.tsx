import {Button} from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import Adlib, {AdlibsType} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import getRandomInt from '@cdo/apps/util/getRandomInt';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

import askAi from '../ai/generate/askAi';
import adlibsUntyped from '../ai/generate/GenerateAdlibs.json';
import {generateBlocklyJson} from '../ai/generate/generateBlocklyJson';
import {
  DefaultContext,
  DefaultPrompt,
  GenerateContext,
} from '../ai/generate/GenerateContent';
import appConfig from '../appConfig';
import {baseAssetUrl} from '../constants';
import MusicLibrary from '../player/MusicLibrary';
import {setCodeToLoad, setAiGenerateState} from '../redux/musicRedux';

import styles from './GenerateCode.module.scss';

const adlibs = adlibsUntyped as AdlibsType;

interface GenerateCodeProps {
  adlibOption?: string;
}

const GenerateCode: React.FunctionComponent<GenerateCodeProps> = ({
  adlibOption,
}) => {
  const dispatch = useAppDispatch();

  const library = MusicLibrary.getInstance();
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

  const generateSongAi = useCallback(async () => {
    const sounds =
      library
        ?.getFolderForFolderId(packId || 'indie')
        ?.sounds?.map(sound => {
          if (sound.type !== 'preview') {
            return `${packId}/${sound.src} (${sound.length} measures)`;
          }
        })
        .filter(sound => sound !== undefined)
        .join('", "') || '';

    const drumSounds =
      library
        ?.getAvailableSounds()
        .filter(folder => folder.id !== packId)
        .map(folder =>
          folder.sounds
            .filter(sound => sound.type === 'beat')
            .map(sound => {
              return `${folder.id}/${sound.src} (${sound.length} measures)`;
            })
        )
        .flat()
        .join('", ') || '';

    console.log('Starting AI ask...');

    const result = await askAi(
      'Here is the context: \n\n' +
        GenerateContext(contextText, sounds, drumSounds) +
        '\n\n And here is the request: \n\n' +
        promptText
    );

    if (result.length > 1 && result[1].status === AiInteractionStatus.OK) {
      const pseudocode = result[1].chatMessageText.replaceAll('```', '');
      console.log('AI code generated.');
      return pseudocode;
    } else {
      console.error('Error getting AI response.');
    }
  }, [contextText, library, packId, promptText]);

  const generateSongCache = useCallback(async () => {
    const variant = getRandomInt(
      0,
      adlibs[adlibOption || 'complex'].variantCount - 1
    );
    const joinedChoices = choices?.join('-');
    const cacheFilePath = `${baseAssetUrl}generate/music/${packId}-${adlibOption}-${joinedChoices}-${variant
      .toString()
      .padStart(2, '0')}.txt`;
    console.log(cacheFilePath);

    const startTime = Date.now();
    try {
      const response = await HttpClient.get(cacheFilePath);
      const pseudocode = await response.text();

      const elapsedTime = Date.now() - startTime;
      const delayDuration = 2000; // 2 seconds.
      const remainingDelayDuration = Math.max(delayDuration - elapsedTime, 0);
      await new Promise(res => setTimeout(res, remainingDelayDuration));

      return pseudocode;
    } catch (error) {
      console.error('Error retrieving cached code.');
    }
  }, [adlibOption, choices, packId]);

  const generateSong = useCallback(async () => {
    dispatch(setAiGenerateState('generating'));

    const pseudocode = await (useCache
      ? generateSongCache()
      : generateSongAi());

    if (pseudocode) {
      const resultBlockly = generateBlocklyJson(pseudocode);
      dispatch(setCodeToLoad(resultBlockly));
    }

    dispatch(setAiGenerateState('done'));
  }, [dispatch, generateSongAi, generateSongCache, useCache]);
  if (!packId) {
    return null;
  }

  return (
    <Guide id="generate-panel">
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
        </>
      )}
    </Guide>
  );
};

export default GenerateCode;
