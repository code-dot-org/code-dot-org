import {Button} from '@code-dot-org/component-library/button';
import Typography from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';
import {FocusOn} from 'react-focus-on';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import askAi from '../ai/askAi';
import appConfig from '../appConfig';
import {DEFAULT_PACK} from '../constants';
import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import {setPackId, setCodeToLoad} from '../redux/musicRedux';

import styles from './Generate.module.scss';

interface GenerateProps {
  player: MusicPlayer;
}

const Generate: React.FunctionComponent<GenerateProps> = ({player}) => {
  const dispatch = useAppDispatch();

  const currentPackId = useAppSelector(state => state.music.packId);

  const library = MusicLibrary.getInstance();

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

Let's try it out.  Can you generate a song that, when run, plays "indie/guitar_chord_change" followed by "indie/guitar_clean_arp"?

And then it plays these three sounds together - "hiphop/drum_beat_808", "electro/drum_beat_hyper", and "groove/reggaeton_beat" - three times.
`;

  const contextGenerateMusicBlocklyFromMusicPsuedocode = `Your job will be to generate Blockly JSON from psuedocode which describes how to play a song.

The psuedocode looks something like this:

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

And Here is some example Blockly code for our system.  In this case, we are generating a song.  It repeats the output 3 times, the output being a drum beat cowbell and a guitar code which play togehter:

  {"blocks":{"languageVersion":0,"blocks":[{"type":"when_run_simple2","id":"when-run-block","x":30,"y":30,"deletable":false,"movable":false,"next":{"block":{"type":"repeat_simple2","id":"repeat_simple2","extraState":{"disableNextConnection":false},"fields":{"times":3},"inputs":{"code":{"block":{"type":"play_sounds_together","id":"play_sounds_together","extraState":{"disableNextConnection":false},"inputs":{"code":{"block":{"type":"play_sound_at_current_location_simple2","id":"play_sound_at_current_location_simple2","extraState":{"disableNextConnection":false},"fields":{"sound":"electro/drum_beat_cowbell"},"next":{"block":{"type":"play_sound_at_current_location_simple2","id":"!;-!82$m2/}%!h8$ua","extraState":{"disableNextConnection":false},"fields":{"sound":"electro/drum_beat_cowbell"}}}}}}}}}}}}]}}
`;

  const contextGenerateDancePsuedocodeFromMusicPsuedocode = `
You'll be given psuedocode that plays a song.

The psuedocode looks something like this:

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

Your job will be to generate some psuedocode for a system that makes some characters that dance.  Here is an example of that psuedocode:

when_run
  create "sloth" at "center"
  "sloths" do "dab"

at "2" measures
  "sloths" do "floss"

at "3" measures
  "sloths" do "dab"

This psuedocode has three moments of interest.  When first run, it creates a "sloth" character in the "center" of the screen, and then it makes all "sloths" do a dance called the "dab".  Then, when the background song reaches measure "2", the sloths start doing the "floss" dance move.  Then, when the song reaches measure "3", the sloths start doing the "dab" again.

Valid dancer characters are "sloth", "cat", "dog", and "duck".  Valid dances are "dab", "floss", "fresh", and "disco".

Valid screen locations are "top", "bottom", "left", "right" and "center".

Try to generate a dance sequence that has major moments, like the dancing changing, that coincide with the input music's major moments.

Note that the dance psudocode does not support the same set of features as the music psuedocode.

`;

  const contextGenerateDanceBlocklyFromDancePsuedocode = `
Your job will be to generate Blockly JSON from psuedocode which describes how to play a song.

Here is some example input psuedocode:

when_run
  create "sloth" at "center"
  "sloths" do "dab"

at "2" measures
  "sloths" do "floss"

at "3" measures
  "sloths" do "dab"

This psuedocode has three moments of interest.  When first run, it creates a "sloth" character in the "center" of the screen, and then it makes all "sloths" do a dance called the "dab".  Then, when the background song reaches measure "2", the sloths start doing the "floss" dance move.  Then, when the song reaches measure "3", the sloths start doing the "dab" again.

Indenting is important.

And here is example blockly JSON that represents the psuedocode above:

{"blocks":{"languageVersion":0,"blocks":[{"type":"Dancelab_whenSetup","id":";fui020!Iaz!kp-n0K[8","x":47,"y":41,"movable":false,"inputs":{"DO":{"block":{"type":"Dancelab_makeAnonymousDanceSprite","id":"{U-DOxMPz$)-j8dIS#O|","fields":{"COSTUME":"<field name=\\"COSTUME\\">\\"CAT\\"</field>","LOCATION":"<field name=\\"LOCATION\\">{x: 100, y: 200}</field>"},"next":{"block":{"type":"Dancelab_makeAnonymousDanceSprite","id":"~y[?utp)~L.$C@ZiL51V","fields":{"COSTUME":"<field name=\\"COSTUME\\">\\"DOG\\"</field>","LOCATION":"<field name=\\"LOCATION\\">{x: 300, y: 200}</field>"},"next":{"block":{"type":"Dancelab_changeMoveEachLR","id":"!zxTn$JN@Iwv}-Dk^Q(8","fields":{"GROUP":"<field name=\\"GROUP\\">\\"CAT\\"</field>","MOVE":"<field name=\\"MOVE\\">MOVES.Dab</field>","DIR":"<field name=\\"DIR\\">-1</field>"},"next":{"block":{"type":"Dancelab_changeMoveEachLR","id":"=D*J5IY5upi+bOqMX8nR","fields":{"GROUP":"<field name=\\"GROUP\\">\\"DOG\\"</field>","MOVE":"<field name=\\"MOVE\\">MOVES.Dab</field>","DIR":"<field name=\\"DIR\\">-1</field>"}}}}}}}}}}},{"type":"Dancelab_atTimestampNotAfter","id":"S4!uAzkx{%vw@UFZX8hY","x":50,"y":237,"deletable":false,"editable":false,"fields":{"TIMESTAMP":2,"UNIT":"<field name=\\"UNIT\\">\\"measures\\"</field>"},"next":{"block":{"type":"Dancelab_makeAnonymousDanceSprite","id":"d9O0m4kmUCbnvV+!g","fields":{"COSTUME":"<field name=\\"COSTUME\\">\\"SLOTH\\"</field>","LOCATION":"<field name=\\"LOCATION\\">{x: 200, y: 200}</field>"},"next":{"block":{"type":"Dancelab_changeMoveEachLR","id":"vb82H}!NOVGmpir7;~5Q","fields":{"GROUP":"<field name=\\"GROUP\\">\\"CAT\\"</field>","MOVE":"<field name=\\"MOVE\\">MOVES.Floss</field>","DIR":"<field name=\\"DIR\\">-1</field>"},"next":{"block":{"type":"Dancelab_changeMoveEachLR","id":"j..*n3lnL=w~GAWxr7dl","fields":{"GROUP":"<field name=\\"GROUP\\">\\"DOG\\"</field>","MOVE":"<field name=\\"MOVE\\">MOVES.Floss</field>","DIR":"<field name=\\"DIR\\">-1</field>"},"next":{"block":{"type":"Dancelab_doMoveEachLR","id":"*hCDocpHXqlku@f[[rK=","fields":{"GROUP":"<field name=\\"GROUP\\">\\"SLOTH\\"</field>","MOVE":"<field name=\\"MOVE\\">MOVES.Floss</field>","DIR":"<field name=\\"DIR\\">-1</field>"}}}}}}}}}}]}}
`;

  const [text, setText] = useState(
    'Can you generate a song which plays a drum beat and a guitar alternating, 4 times.  Then plays the drum beat and guide code together, 2 times?  Use a variety of sounds that fit the ask.\n' +
      'Put this into a function and call this function from the main block.\n'
  );

  const [generating, setGenerating] = useState<
    undefined | 'asking' | 'generating'
  >(undefined);

  const selectPack = useCallback(
    (packId: string) => {
      if (!library) {
        return;
      }

      player.cancelPreviews();
      dispatch(setPackId(packId));
      library.setCurrentPackId(packId);
    },
    [library, dispatch, player]
  );

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

      console.log('starting second ask');

      setGenerating('generating');

      askAi(
        'here is the contxt:\n' +
          contextGenerateMusicBlocklyFromMusicPsuedocode +
          '\n and here is the request:\n' +
          result[1].chatMessageText
      ).then(result2 => {
        console.log(result2[1].chatMessageText);

        setGenerating(undefined);

        // const jsonString = result2[1].chatMessageText;

        // Trim the result so that anything before the first '{' and after the last '}' is removed.
        const trimmedResult = result2[1].chatMessageText.trim();
        const firstBraceIndex = trimmedResult.indexOf('{');
        const lastBraceIndex = trimmedResult.lastIndexOf('}');
        const jsonString = trimmedResult.substring(
          firstBraceIndex,
          lastBraceIndex + 1
        ); // Include the last brace

        console.log('JSON String:', jsonString);
        selectPack(DEFAULT_PACK);
        dispatch(setCodeToLoad(jsonString));
      });
    });
  }, [
    contextGenerateMusicPsuedocode,
    contextGenerateMusicBlocklyFromMusicPsuedocode,
    dispatch,
    selectPack,
    text,
  ]);

  if (currentPackId) {
    return null;
  }

  return (
    <FocusOn className={styles.focusLock}>
      <div className={styles.dialogContainer}>
        <div id="pack-dialog" className={styles.packDialog}>
          <div id="hidden-item" tabIndex={0} role="button" />
          <Typography
            semanticTag="h1"
            visualAppearance="heading-lg"
            className={styles.heading}
          >
            Generate a song with AI
          </Typography>

          <div
            className={classNames(
              styles.body,
              appConfig.getValue('pack-dialog-2-stacked') === 'true' &&
                styles.bodyStacked
            )}
          >
            <div> &nbsp; </div>
          </div>

          <div className={styles.packsContainer}>
            <textarea
              id="generate-description"
              onChange={evt => setText(evt.target.value)}
              value={text}
              rows={4}
              className={styles.textArea}
            />
          </div>

          <div className={styles.status}>
            {generating === 'asking'
              ? 'Generating a song...'
              : generating === 'generating'
              ? 'Converting to blocks...'
              : ''}
          </div>

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
        </div>
      </div>
    </FocusOn>
  );
};

export default Generate;
