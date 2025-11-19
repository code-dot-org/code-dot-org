import React from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';

import styles from './GuideInstructions.module.scss';

interface GuideInstructionsProps {
  width?: 'narrow' | 'normal';
  levelProperties: LevelProperties;
  isRunning: boolean;
  hasRun: boolean;
  hasEdited: boolean;
}

const GuideInstructions: React.FunctionComponent<GuideInstructionsProps> = ({
  width,
  levelProperties,
  isRunning,
  hasRun,
  hasEdited,
}) => {
  const {longInstructions} = levelProperties;

  const levelSpecificId = `guide-instructions-${levelProperties.id}`;

  return (
    <Guide
      key={levelSpecificId}
      id={levelSpecificId}
      modal={undefined}
      width={width}
    >
      {longInstructions && (
        <MainInstructionsContent
          instructionsText={longInstructions}
          markdownClassName={styles.markdown}
        />
      )}

      <NavigationArea
        levelProperties={levelProperties}
        markdownClassName={styles.markdown}
        isRunning={isRunning}
        hasRun={hasRun}
        hasEdited={hasEdited}
        hideContinueIfDisabled={true}
      />
    </Guide>
  );
};

export default GuideInstructions;
