import React from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
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
  const {longInstructions, offerBrowserTts} = levelProperties;
  const showTts = offerBrowserTts || queryParams('show-tts') === 'true';

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
          showTts={showTts}
        />
      )}

      <NavigationArea
        levelProperties={levelProperties}
        markdownClassName={styles.markdown}
        isRunning={isRunning}
        hasRun={hasRun}
        hasEdited={hasEdited}
        hideContinueIfDisabled={true}
        variant={'simpleText'}
      />
    </Guide>
  );
};

export default GuideInstructions;
