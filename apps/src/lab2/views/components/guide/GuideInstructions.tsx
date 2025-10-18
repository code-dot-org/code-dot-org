import React from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import Instructions from '@cdo/apps/lab2/views/components/Instructions/InstructionsV2';

import styles from './GuideInstructions.module.scss';

interface GuideInstructionsProps {
  levelProperties: LevelProperties;
  isRunning: boolean;
  hasRun: boolean;
  hasEdited: boolean;
}

const GuideInstructions: React.FunctionComponent<GuideInstructionsProps> = ({
  levelProperties,
  isRunning,
  hasRun,
  hasEdited,
}) => {
  return (
    <Guide id="guide-instructions" modal={false}>
      <Instructions
        levelProperties={levelProperties}
        isRunning={isRunning}
        hasRun={hasRun}
        hasEdited={hasEdited}
        className={styles.GuideInstructions}
      />
    </Guide>
  );
};

export default GuideInstructions;
