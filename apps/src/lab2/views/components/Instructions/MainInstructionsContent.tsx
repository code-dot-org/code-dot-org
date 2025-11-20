import classNames from 'classnames';
import React from 'react';

import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

import moduleStyles from './instructions.module.scss';

interface MainInstructionsContentProps {
  instructionsText: string;
  markdownClassName?: string;
  handleInstructionsTextClick?: (id: string) => void;
  showTts?: boolean;
}

/**
 * Component to display the main instructions content for a level.
 * This is extracted out to a component so it can be used both in Instructions
 * and in MainInstructionsBubblePreview.
 */
const MainInstructionsContent: React.FunctionComponent<
  MainInstructionsContentProps
> = ({
  instructionsText,
  markdownClassName,
  handleInstructionsTextClick,
  showTts,
}) => {
  return (
    <div className={moduleStyles.mainInstructions}>
      <EnhancedSafeMarkdown
        markdown={instructionsText}
        className={classNames(
          moduleStyles.markdownText,
          showTts ? moduleStyles.markdownTts : undefined,
          markdownClassName
        )}
        handleInstructionsTextClick={handleInstructionsTextClick}
      />
      {showTts && (
        <div className={moduleStyles.markdownTtsContainer}>
          <TextToSpeech text={instructionsText} />
        </div>
      )}
    </div>
  );
};

export default MainInstructionsContent;
