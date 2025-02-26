import classNames from 'classnames';
import React from 'react';

import {Theme} from '@cdo/apps/lab2/types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

import ValidationStatusIcon from './ValidationStatusIcon';

import moduleStyles from '@codebridge/InfoPanel/styles/validated-instructions.module.scss';

interface MainInstructionsBubblePreviewProps {
  instructionsText: string;
  handleInstructionsTextClick?: (id: string) => void;
  theme: Theme;
  hasPassed: boolean;
}

/**
 * Component for levelbuilder to preview the main instructions bubble (without predict answers or validation).
 */
const MainInstructionsBubblePreview: React.FunctionComponent<
  MainInstructionsBubblePreviewProps
> = ({instructionsText, handleInstructionsTextClick, theme, hasPassed}) => {
  return (
    <div
      key={instructionsText}
      id="instructions-text"
      className={classNames(moduleStyles['bubble-' + theme])}
    >
      <div className={moduleStyles.mainInstructions}>
        <ValidationStatusIcon
          status={hasPassed ? 'passed' : 'pending'}
          className={moduleStyles.validationIcon}
        />
        <EnhancedSafeMarkdown
          markdown={instructionsText}
          className={moduleStyles.markdownText}
          handleInstructionsTextClick={handleInstructionsTextClick}
        />
      </div>
    </div>
  );
};

export default MainInstructionsBubblePreview;
