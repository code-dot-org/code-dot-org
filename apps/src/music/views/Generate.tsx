import {Button} from '@code-dot-org/component-library/button';
import Typography from '@code-dot-org/component-library/typography';
import React, {useCallback, useState} from 'react';
import {FocusOn} from 'react-focus-on';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import askAi from '../ai/askAi';
import {generateBlocklyJson} from '../ai/generateBlockly3';
import MusicLibrary from '../player/MusicLibrary';
import {setPackId, setCodeToLoad} from '../redux/musicRedux';

import styles from './Generate.module.scss';

interface GenerateProps {}

const Generate: React.FunctionComponent<GenerateProps> = () => {
  const dispatch = useAppDispatch();

  const packId = 'tinashe_tightrope';

  const library = MusicLibrary.getInstance();

  dispatch(setPackId(packId));
  library?.setCurrentPackId(packId);

  const sounds = library
    ?.getFolderForFolderId(packId)
    ?.sounds.map(sound => {
      if (sound.type !== 'preview') {
        return sound.src;
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

The valid sounds to use are: "${sounds}".  You can use any of these sounds in your psuedocode.  Each sound name gets the "${packId}/" prefix, so for example, "indie/drum_beat_808".
`;

  const [text, setText] = useState(
    'Please generate a fun song.  Between 10-15 measures is enoguh duration.  Use layering of sounds to make it exciting.  No comments please.'
  );

  const [generating, setGenerating] = useState<
    undefined | 'asking' | 'generating' | 'done'
  >(undefined);

  const generateSong = useCallback(() => {
    console.log('starting ask');
    setGenerating('asking');
    askAi(
      'here is the contxt:\n' +
        contextGenerateMusicPsuedocodeFromDescription +
        '\n and here is the request:\n' +
        text
    ).then(result => {
      console.log(result[1].chatMessageText);
      const psuedocode = result[1].chatMessageText.replaceAll('```', '');

      //const resultBlockly = '';
      const resultBlockly = generateBlocklyJson(psuedocode);
      dispatch(setCodeToLoad(resultBlockly));

      console.log(resultBlockly);

      setGenerating('done');
    });
  }, [contextGenerateMusicPsuedocodeFromDescription, text, dispatch]);

  if (generating === 'done') {
    return null;
  }

  return (
    <FocusOn className={styles.focusLock}>
      <div id="generate-panel" className={styles.generatePanel}>
        <div id="hidden-item" tabIndex={0} role="button" />
        <Typography
          semanticTag="h1"
          visualAppearance="heading-lg"
          className={styles.heading}
        >
          Generate a song with AI
        </Typography>

        <div className={styles.body}>
          <div> &nbsp; </div>
        </div>

        <textarea
          id="generate-description"
          onChange={evt => setText(evt.target.value)}
          value={text}
          rows={4}
          className={styles.textArea}
        />

        <div className={styles.status}>
          {generating === 'asking'
            ? 'Generating a song...'
            : generating === 'generating'
            ? 'Converting to blocks...'
            : ''}
        </div>

        {generating === undefined && (
          <div className={styles.footer}>
            <div className={styles.buttonContainer}>
              <Button
                ariaLabel={'Generate song'}
                text={'Generate song'}
                type="primary"
                color="purple"
                size="s"
                onClick={generateSong}
              />
            </div>
          </div>
        )}
      </div>
    </FocusOn>
  );
};

export default Generate;
