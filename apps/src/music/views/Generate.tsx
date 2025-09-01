import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import reactStringReplace from 'react-string-replace';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import askAi from '../ai/generate/askAi';
import {generateBlocklyJson} from '../ai/generate/generateBlocklyJson';
import appConfig from '../appConfig';
import MusicLibrary from '../player/MusicLibrary';
import {setCodeToLoad, setAiGenerateState} from '../redux/musicRedux';

import styles from './Generate.module.scss';

const prefabTextTemplate =
  'Please generate a fun song.  Around {length} measures in duration is good.  Got for a {mood} vibe.  Sequence it like a {sequence}.';
const prefabTextOptions: {[key: string]: string[]} = {
  length: ['20', '30', '40'],
  mood: ['happy', 'sad', 'energetic', 'calm', 'upbeat', 'chill'],
  sequence: ['verse-chorus-verse', 'A-B-A', 'A-B-A-C-A', 'A-A-B-A'],
};

interface GenerateProps {}

const Generate: React.FunctionComponent<GenerateProps> = () => {
  const dispatch = useAppDispatch();

  const packId = useAppSelector(state => state.music.packId);
  const aiGenerateState = useAppSelector(state => state.music.aiGenerateState);

  const library = MusicLibrary.getInstance();

  const prefabText = appConfig.getValue('ai-generate-prefab') === 'true';

  const sounds = library
    ?.getFolderForFolderId(packId || 'indie')
    ?.sounds?.map(sound => {
      if (sound.type !== 'preview') {
        return `${sound.src} (${sound.length} measures)`;
      }
    })
    .filter(sound => sound !== undefined)
    .join('", "');

  const contextGenerateMusicPsuedocodeFromDescription = `Your job will be to generate psuedocode for a system that plays a song.  You'll be given a description of what to play, and then you should output code that generates the song to be played.  The psuedocode looks something like this:

when_run
  play "hiphop/drum_beat_808"
  play "electro/drum_beat_hyper"
  play_together
    play "hiphop/drum_beat_808"
    play "electro/drum_beat_hyper"
  repeat 3
    play "hiphop/drum_beat_808"
    play "electro/drum_beat_hyper"

Indenting is important.  In this example, when the code is run, it plays "hiphop/drum_beat_808" and then "electro/drum_beat_hyper".  Then it plays "electro_beat_808" and "electro/drum_beat_hyper" at the same time.  Then it plays the same thing three times: "hiphop/drum_beat_808" followed by "electro/drum_beat_hyper".

Don't include any comments in the generated psuedocode.

Note that each sound is actually 2 measures long.

The valid sounds to use are: "${sounds}".  (The length of each sound is in parentheses.)  You can use any of these sounds in your psuedocode.  Each sound name gets the "${packId}/" prefix, so for example, "indie/drum_beat_808".
`;

  const [text, setText] = useState(
    'Please generate a fun song.  Between 18-20 measures is enough duration.  Use layering of sounds to make it exciting.'
  );

  const [prefabOptions, setPrefabOptions] = useState<{[key: string]: string}>(
    {}
  );

  useEffect(() => {
    const initialOptions: {[key: string]: string} = {};
    Object.keys(prefabTextOptions).forEach(key => {
      initialOptions[key] = prefabTextOptions[key][0];
    });
    setPrefabOptions(initialOptions);
  }, []);

  const prefabHtml = useMemo(() => {
    let output: React.ReactNode[] = [prefabTextTemplate];
    Object.keys(prefabTextOptions).forEach(key => {
      output = reactStringReplace(output, `{${key}}`, match => {
        return (
          <select
            key={key}
            id={key}
            className={styles.select}
            value={prefabOptions[key]}
            onChange={event => {
              setPrefabOptions({
                ...prefabOptions,
                [key]: event.target.value,
              });
            }}
          >
            {(
              prefabTextOptions[
                key as keyof typeof prefabTextOptions
              ] as string[]
            ).map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      });
    });

    return output;
  }, [prefabOptions]);

  const getFilledPrefabText = useCallback(() => {
    let output = prefabTextTemplate;
    Object.keys(prefabTextOptions).forEach(key => {
      output = output.replace(`{${key}}`, prefabOptions[key]);
    });
    return output;
  }, [prefabOptions]);

  const generateSong = useCallback(() => {
    const useText = prefabText ? getFilledPrefabText() : text;

    console.log('starting ask');
    dispatch(setAiGenerateState('generating'));
    askAi(
      `Here is the context:
  ${contextGenerateMusicPsuedocodeFromDescription}

  And here is the request:
  ${useText}`
    ).then(result => {
      console.log(result[1].chatMessageText);
      const psuedocode = result[1].chatMessageText.replaceAll('```', '');

      const resultBlockly = generateBlocklyJson(psuedocode);
      dispatch(setCodeToLoad(resultBlockly));

      dispatch(setAiGenerateState('done'));
    });
  }, [
    prefabText,
    getFilledPrefabText,
    text,
    dispatch,
    contextGenerateMusicPsuedocodeFromDescription,
  ]);

  if (!packId) {
    return null;
  }

  return (
    <div id="generate-panel" className={styles.generatePanel}>
      {aiGenerateState === 'none' && (
        <>
          <div className={styles.info}>Generate a song with AI.</div>
          {!prefabText && (
            <textarea
              id="generate-description"
              onChange={evt => setText(evt.target.value)}
              value={text}
              rows={4}
              className={styles.textArea}
            />
          )}
          {prefabText && <div className={styles.textArea}>{prefabHtml}</div>}
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
    </div>
  );
};

export default Generate;
