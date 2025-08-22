import {Button} from '@code-dot-org/component-library/button';
import Typography from '@code-dot-org/component-library/typography';
import React, {useCallback, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {trySetLocalStorage} from '@cdo/apps/utils';

import askAi from '../ai/generate/askAi';
import {generateBlocklyJson} from '../ai/generate/generateBlocklyJson';
import MusicLibrary from '../player/MusicLibrary';
import {setCodeToLoad, setAiGenerateState} from '../redux/musicRedux';

import styles from './Generate.module.scss';

interface GenerateProps {}

const Generate: React.FunctionComponent<GenerateProps> = () => {
  const dispatch = useAppDispatch();

  const packId = useAppSelector(state => state.music.packId);
  const aiGenerateState = useAppSelector(state => state.music.aiGenerateState);
  const channelId = useAppSelector(state => state.lab.channel?.id);

  const library = MusicLibrary.getInstance();

  const sounds = library
    ?.getFolderForFolderId(packId || 'indie')
    ?.sounds //.filter(sound => sound.length === 2)
    ?.map(sound => {
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
    console.log('starting ask');
    dispatch(setAiGenerateState('generating'));
    askAi(
      `Here is the context:
  ${contextGenerateMusicPsuedocodeFromDescription}

  And here is the request:
  ${text}`
    ).then(result => {
      console.log(result[1].chatMessageText);
      const psuedocode = result[1].chatMessageText.replaceAll('```', '');

      const resultBlockly = generateBlocklyJson(psuedocode);
      dispatch(setCodeToLoad(resultBlockly));

      dispatch(setAiGenerateState('done'));

      // And save the psuedocode to session storage.
      trySetLocalStorage(
        'music-ai-generate',
        JSON.stringify({channelId, packId, psuedocode})
      );
    });
  }, [
    dispatch,
    contextGenerateMusicPsuedocodeFromDescription,
    text,
    channelId,
    packId,
  ]);

  if (!packId || aiGenerateState === 'done') {
    return null;
  }

  return (
    <div id="generate-panel" className={styles.generatePanel}>
      <Typography
        semanticTag="h1"
        visualAppearance="heading-lg"
        className={styles.heading}
      >
        Generate a song with AI
      </Typography>

      <textarea
        id="generate-description"
        onChange={evt => setText(evt.target.value)}
        value={text}
        rows={4}
        className={styles.textArea}
      />

      <div className={styles.footer}>
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
      </div>
    </div>
  );
};

export default Generate;
