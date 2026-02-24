import classNames from 'classnames';
import React from 'react';

import {Theme} from '@cdo/apps/lab2/types';

import MainInstructionsContent from './MainInstructionsContent';

import moduleStyles from './instructions.module.scss';

interface MainInstructionsPreviewProps {
  instructionsText: string;
  handleInstructionsTextClick?: (id: string) => void;
  theme: Theme;
}

/**
 * Component for levelbuilder to preview the main instructions bubble (without predict answers or validation).
 * This is rendered outside of the usual lab2 container, hence why we need to provide a data-theme.
 */
const MainInstructionsPreview: React.FunctionComponent<
  MainInstructionsPreviewProps
> = ({instructionsText, handleInstructionsTextClick, theme}) => {
  return (
    <div
      key={instructionsText}
      id="instructions-text"
      className={classNames(moduleStyles.bubble, moduleStyles.bubbleNoSlide)}
      data-theme={theme}
    >
      <MainInstructionsContent
        instructionsText={instructionsText}
        handleInstructionsTextClick={handleInstructionsTextClick}
      />
    </div>
  );
};

export default MainInstructionsPreview;
