import classNames from 'classnames';
import React, {forwardRef, useRef, MutableRefObject} from 'react';

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
 *
 * You can also get a reference to the rendered div, which can be useful when
 * passed to a TextToSpeech component to render the contents as audio.
 */
const MainInstructionsContent = forwardRef<
  HTMLElement,
  MainInstructionsContentProps
>(
  (
    {instructionsText, markdownClassName, handleInstructionsTextClick, showTts},
    ref
  ) => {
    const contentRef: MutableRefObject<HTMLElement | null> = useRef(null);

    return (
      <div
        ref={(ref || contentRef) as MutableRefObject<HTMLDivElement | null>}
        className={moduleStyles.mainInstructions}
      >
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
            <TextToSpeech
              contentRef={
                (ref || contentRef) as MutableRefObject<HTMLDivElement | null>
              }
            />
          </div>
        )}
      </div>
    );
  }
);

export default MainInstructionsContent;
