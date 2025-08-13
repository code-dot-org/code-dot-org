import {Button} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import React, {useCallback, useState} from 'react';

import askAi from './askAi';
import generateBlocklyJson from './generateBlocklyJson';

import styles from './Generate.module.scss';

interface GenerateProps {
  psuedoCode: string;
}

const generateDanceBlocklyJsonFromMusicPsuedocode = `
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

Valid dancer characters are "sloth", "cat", "dog", and "duck".  Valid dances are "dab", "floss", "fresh", and "star".

Valid screen locations are "top", "bottom", "left", "right" and "center".

Try to generate a dance sequence that has major moments, like the dancing changing, that coincide with the input music's major moments.

Note that the dance psudocode does not support the same set of features as the music psuedocode.

Don't include any additional comments.  Return the psuedocode only.
`;

const Generate: React.FunctionComponent<GenerateProps> = ({psuedoCode}) => {
  const [generateState, setGenerateState] = useState<
    'none' | 'generating' | 'done'
  >('none');

  const generateDance = useCallback(() => {
    console.log('starting ask');
    setGenerateState('generating');
    askAi(
      `Here is the context:
  ${generateDanceBlocklyJsonFromMusicPsuedocode}
  And here is the music psuedocode:
  ${psuedoCode}
  `
    ).then(result => {
      console.log(result[1].chatMessageText);
      const psuedocode = result[1].chatMessageText.replaceAll('```', '');

      const resultBlockly = generateBlocklyJson(psuedocode);

      console.log(JSON.parse(resultBlockly));

      Blockly.serialization.workspaces.load(
        JSON.parse(resultBlockly),
        Blockly.getMainWorkspace()
      );

      setGenerateState('done');
    });
  }, [psuedoCode]);

  if (generateState === 'done') {
    return null;
  }

  return (
    <CustomDialog className={styles.generateDialog}>
      <div id="jumbo-ui" className={styles.jumboUi}>
        <div className={styles.text}>
          Now, let's generate a dance sequence to go with your song!
        </div>
        <div className={styles.actions}>
          {generateState === 'generating' && (
            <div className={styles.text}>Generating a dance...</div>
          )}
          {generateState === 'none' && (
            <Button
              ariaLabel={'Generate dance'}
              text={'Generate dance'}
              type="primary"
              color="white"
              size="m"
              onClick={generateDance}
            />
          )}
        </div>
      </div>
    </CustomDialog>
  );
};

export default Generate;
