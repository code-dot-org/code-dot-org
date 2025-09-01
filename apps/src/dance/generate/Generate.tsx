import {Button} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import React, {useCallback, useState} from 'react';

import generateBlocklyJson from './generateBlocklyJson';

import styles from './Generate.module.scss';

interface GenerateProps {
  eventMeasures: number[];
}

const Generate: React.FunctionComponent<GenerateProps> = ({eventMeasures}) => {
  const [generateState, setGenerateState] = useState<
    'none' | 'generating' | 'done'
  >('none');

  const generateDance = useCallback(() => {
    console.log('starting dance generation');
    setGenerateState('generating');

    const resultBlockly = generateBlocklyJson(eventMeasures);

    console.log(resultBlockly);

    Blockly.serialization.workspaces.load(
      resultBlockly,
      Blockly.getMainWorkspace()
    );

    setGenerateState('done');
  }, [eventMeasures]);

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
