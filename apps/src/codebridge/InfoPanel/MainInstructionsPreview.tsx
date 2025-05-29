import classNames from 'classnames';
import React from 'react';

import {Theme} from '@cdo/apps/lab2/types';

import MainInstructionsContent from './MainInstructionsContent';

import moduleStyles from '@codebridge/InfoPanel/styles/validated-instructions.module.scss';

interface MainInstructionsPreviewProps {
  instructionsText: string;
  handleInstructionsTextClick?: (id: string) => void;
  theme: Theme;
  hasPassed: boolean;
}

/**
 * Component for levelbuilder to preview the main instructions bubble (without predict answers or validation).
 */
const MainInstructionsPreview: React.FunctionComponent<
  MainInstructionsPreviewProps
> = ({instructionsText, handleInstructionsTextClick, theme, hasPassed}) => {
  return (
    <div
      key={instructionsText}
      id="instructions-text"
      className={classNames(
        moduleStyles['bubble-' + theme],
        moduleStyles.bubbleNoSlide
      )}
    >
      <MainInstructionsContent
        instructionsText={instructionsText}
        handleInstructionsTextClick={handleInstructionsTextClick}
        hasPassed={hasPassed}
      />
    </div>
  );
};

export default MainInstructionsPreview;
