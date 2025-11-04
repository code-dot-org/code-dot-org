import classNames from 'classnames';
import React from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

import moduleStyles from './instructions.module.scss';

interface MainInstructionsContentProps {
  instructionsText: string;
  markdownClassName?: string;
  handleInstructionsTextClick?: (id: string) => void;
}

/**
 * Component to display the main instructions content for a level.
 * This is extracted out to a component so it can be used both in Instructions
 * and in MainInstructionsBubblePreview.
 */
const MainInstructionsContent: React.FunctionComponent<
  MainInstructionsContentProps
> = ({instructionsText, markdownClassName, handleInstructionsTextClick}) => {
  return (
    <div className={moduleStyles.mainInstructions}>
      <EnhancedSafeMarkdown
        markdown={instructionsText}
        className={classNames(moduleStyles.markdownText, markdownClassName)}
        handleInstructionsTextClick={handleInstructionsTextClick}
      />
    </div>
  );
};

export default MainInstructionsContent;
