import React from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

import ValidationStatusIcon from './ValidationStatusIcon';

import moduleStyles from '@codebridge/InfoPanel/styles/validated-instructions.module.scss';

interface MainInstructionsContentProps {
  instructionsText: string;
  handleInstructionsTextClick?: (id: string) => void;
  hasPassed: boolean;
}

/**
 * Component to display the main instructions content for a level.
 * This is extracted out to a component so it can be used both in ValidatedInstructions
 * and in MainInstructionsBubblePreview.
 */
const MainInstructionsContent: React.FunctionComponent<
  MainInstructionsContentProps
> = ({instructionsText, handleInstructionsTextClick, hasPassed}) => {
  return (
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
  );
};

export default MainInstructionsContent;
