import classNames from 'classnames';
import React, {forwardRef, useRef, MutableRefObject} from 'react';

import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

import moduleStyles from './instructions.module.scss';

interface BaseMainInstructionsContentProps {
  /** Custom classname for the markdown container */
  markdownClassName?: string;
  /** The callback for interactions with 'clickable text' */
  handleInstructionsTextClick?: (id: string) => void;
  /** When true, renders a TextToSpeech play button to read the text */
  showTts?: boolean;
}

interface MainInstructionsContentWithMarkdown
  extends BaseMainInstructionsContentProps {
  /** Markdown to form the basis of the rendered instructions */
  instructionsText: string;
  heading?: never;
  content?: never;
}

interface MainInstructionsContentSimple
  extends BaseMainInstructionsContentProps {
  instructionsText?: never;
  /** The heading for the content, when not using instructionsText */
  heading: string;
  /** The simple paragraph content, when not using instructionsText */
  content: string;
}

export type MainInstructionsContentProps =
  | MainInstructionsContentWithMarkdown
  | MainInstructionsContentSimple;

/**
 * Component to display the main instructions content for a level.
 * This is extracted out to a component so it can be used both in Instructions
 * and in MainInstructionsBubblePreview.
 *
 * It assumes the `instructionsText` field is markdown. Otherwise, you can
 * specify a `heading` and `content` which will render the equivalent markdown
 * with a 3rd level heading and paragraph content.
 *
 * You can also get a reference to the rendered div, which can be useful when
 * passed to a TextToSpeech component to render the contents as audio. Just
 * pass in a `ref` to capture the element.
 *
 * If you pass showTts as `true`, then it will render its own TextToSpeech play
 * button at the top-right of the container. It will ensure that the first item
 * in the markdown content is rendered with enough of a margin to accommodate
 * the button. It is therefore best if that is a header of some kind.
 *
 * If you want to use your own TextToSpeech button component, just pass the
 * `ref` from this component along to the TextToSpeech's `contentRef`
 * property and the TextToSpeech will read the text content of this component
 * aloud when played.
 */
const MainInstructionsContent = forwardRef<
  HTMLElement,
  MainInstructionsContentProps
>(
  (
    {
      instructionsText,
      heading,
      content,
      markdownClassName,
      handleInstructionsTextClick,
      showTts,
    },
    ref
  ) => {
    const contentRef: MutableRefObject<HTMLElement | null> = useRef(null);

    const markdown = instructionsText || `### ${heading}\n\n${content}`;

    return (
      <div
        ref={(ref || contentRef) as MutableRefObject<HTMLDivElement | null>}
        className={moduleStyles.mainInstructions}
      >
        <EnhancedSafeMarkdown
          markdown={markdown}
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
