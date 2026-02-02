import type {FunctionComponent} from 'react';

import type {LevelProperties} from '@code-dot-org/core/api';

import MainInstructionsContent from '../../instructions/components/MainInstructionsContent';
import NavigationArea from '../../instructions/components/NavigationArea';
import {queryParams} from '../../utils/queryParams';

import Guide from '../Guide';

import styles from './guideInstructions.module.scss';

export interface GuideInstructionsProps {
  width?: 'narrow' | 'normal';
  levelProperties: LevelProperties;
  isRunning: boolean;
  hasRun: boolean;
  hasEdited: boolean;
}

const GuideInstructions: FunctionComponent<GuideInstructionsProps> = ({
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
      />
    </Guide>
  );
};

export default GuideInstructions;
