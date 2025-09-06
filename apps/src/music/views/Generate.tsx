import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback, useState} from 'react';

import Adlib from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

import askAi from '../ai/generate/askAi';
import adlibsUntyped from '../ai/generate/GenerateAdlibs.json';
import {generateBlocklyJson} from '../ai/generate/generateBlocklyJson';
import GenerateContext from '../ai/generate/GenerateContext';
import appConfig from '../appConfig';
import MusicLibrary from '../player/MusicLibrary';
import {setCodeToLoad, setAiGenerateState} from '../redux/musicRedux';

import styles from './Generate.module.scss';

const adlibs = adlibsUntyped as {
  [key: string]: {template: string; options: {[key: string]: string[]}};
};

const Generate: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const packId = useAppSelector(state => state.music.packId) || '';
  const aiGenerateState = useAppSelector(state => state.music.aiGenerateState);

  const library = MusicLibrary.getInstance();

  const adlibOption = appConfig.getValue('ai-generate-adlib') as string;
  const [adlibText, setAdlibText] = useState<string | undefined>(undefined);

  const [text, setText] = useState(
    'Please generate a fun song.  Between 18-20 measures is enough duration.  Use layering of sounds to make it exciting.'
  );

  const useText = adlibOption ? adlibText : text;

  const sounds =
    library
      ?.getFolderForFolderId(packId || 'indie')
      ?.sounds?.map(sound => {
        if (sound.type !== 'preview') {
          return `${sound.src} (${sound.length} measures)`;
        }
      })
      .filter(sound => sound !== undefined)
      .join('", "') || '';

  const contextGenerateMusicPsuedocodeFromDescription = GenerateContext(
    sounds,
    packId
  );

  const generateSong = useCallback(() => {
    console.log('starting ask');
    dispatch(setAiGenerateState('generating'));
    askAi(
      `Here is the context:
  ${contextGenerateMusicPsuedocodeFromDescription}

  And here is the request:
  ${useText}`
    ).then(result => {
      if (result.length > 1 && result[1].status === AiInteractionStatus.OK) {
        console.log(result[1].chatMessageText);
        const psuedocode = result[1].chatMessageText.replaceAll('```', '');
        const resultBlockly = generateBlocklyJson(psuedocode);
        dispatch(setCodeToLoad(resultBlockly));
      } else {
        console.error('Error getting AI response.');
      }

      dispatch(setAiGenerateState('done'));
    });
  }, [dispatch, contextGenerateMusicPsuedocodeFromDescription, useText]);

  if (!packId) {
    return null;
  }

  return (
    <Guide id="generate-panel">
      {(aiGenerateState === 'generating' || aiGenerateState === 'done') && (
        <div className={styles.textArea}>{useText}</div>
      )}

      {aiGenerateState === 'none' && (
        <>
          {!adlibOption && (
            <textarea
              id="generate-description"
              onChange={evt => setText(evt.target.value)}
              value={text}
              rows={4}
              className={styles.textArea}
            />
          )}
          {adlibOption && (
            <Adlib
              template={adlibs[adlibOption].template}
              options={adlibs[adlibOption].options}
              onChange={setAdlibText}
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
          <div className={styles.info}>
            Here is the code that was generated.
          </div>

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

export default Generate;
