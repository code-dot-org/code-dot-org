import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback, useState} from 'react';

import Adlib from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import askAi from '../ai/generate/askAi';
import {generateBlocklyJson} from '../ai/generate/generateBlocklyJson';
import appConfig from '../appConfig';
import MusicLibrary from '../player/MusicLibrary';
import {setCodeToLoad, setAiGenerateState} from '../redux/musicRedux';

import styles from './Generate.module.scss';

const adlibs: {
  [key: string]: {template: string; options: {[key: string]: string[]}};
} = {
  complex: {
    template:
      'Please generate a new song.  Around {length} measures in duration is good.  Go for a {mood} vibe.  Sequence it like a {sequence}.',
    options: {
      length: ['20', '30', '40'],
      mood: ['happy', 'sad', 'energetic', 'calm', 'upbeat', 'chill'],
      sequence: ['verse-chorus-verse', 'A-B-A', 'A-B-A-C-A', 'A-A-B-A'],
    },
  },
  length: {
    template:
      'Please generate a new song.  Around {length} measures in duration is good.',
    options: {
      length: ['20', '30', '40'],
    },
  },
  sounds: {
    template: 'Please make a song with {sounds} sounds in order.',
    options: {
      sounds: ['2', '3', '4', '5'],
    },
  },
  layers: {
    template:
      'Please make a song that layers {type1} and {type2} together. Around 10 measures is good.',
    options: {
      type1: ['bass', 'leads', 'beats', 'vocals'],
      type2: ['bass', 'leads', 'beats', 'vocals'],
    },
  },
};

interface GenerateProps {}

const Generate: React.FunctionComponent<GenerateProps> = () => {
  const dispatch = useAppDispatch();

  const packId = useAppSelector(state => state.music.packId);
  const aiGenerateState = useAppSelector(state => state.music.aiGenerateState);

  const library = MusicLibrary.getInstance();

  const adlibOption = appConfig.getValue('ai-generate-adlib') as string;
  const [adlibText, setAdlibText] = useState<string | undefined>(undefined);

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

  const generateSong = useCallback(() => {
    const useText = adlibOption ? adlibText : text;

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
    adlibOption,
    adlibText,
    text,
    dispatch,
    contextGenerateMusicPsuedocodeFromDescription,
  ]);

  if (!packId) {
    return null;
  }

  return (
    <Guide id="generate-panel">
      {aiGenerateState === 'none' && (
        <>
          <div className={styles.info}>Generate a song with AI.</div>
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
