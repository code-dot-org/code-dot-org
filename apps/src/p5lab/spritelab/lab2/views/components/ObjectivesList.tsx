import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Markdown, extensions} from '@code-dot-org/markdown';
import classNames from 'classnames';
import React, {useRef} from 'react';

import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';

import {ObjectiveItemState} from '../useObjectives';

import styles from './objectives-list.module.scss';

interface ObjectivesListProps {
  title?: string;
  items: ObjectiveItemState[];
  /** Offer a button that reads the list aloud. */
  showTts?: boolean;
}

// Links in the text open in a new tab, as the instructions panel's do.
const MARKDOWN_EXTENSIONS = [extensions.externalLinks];

/** The level's checklist: each item with a circle that fills with a check
    when the student has done it. */
const ObjectivesList: React.FunctionComponent<ObjectivesListProps> = ({
  title,
  items,
  showTts,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={contentRef}
      className={classNames(styles.objectives, showTts && styles.withTts)}
    >
      {title && (
        <Markdown
          content={title}
          // Over a checklist the title is its headline; alone it is the
          // level's one line, at the body's size.
          className={classNames(
            styles.title,
            items.length === 0 && styles.titleOnly
          )}
          extensions={MARKDOWN_EXTENSIONS}
        />
      )}
      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li
              key={index}
              className={classNames(styles.item, item.done && styles.itemDone)}
            >
              <span className={styles.mark} aria-hidden="true">
                {item.done && (
                  <FontAwesomeV6Icon iconStyle="solid" iconName="check" />
                )}
              </span>
              <span className={styles.srOnly}>
                {item.done ? 'Done: ' : 'To do: '}
              </span>
              {/* Inline: a list item holds a span, not a paragraph. */}
              <Markdown
                inline
                content={item.text}
                className={styles.text}
                extensions={MARKDOWN_EXTENSIONS}
              />
            </li>
          ))}
        </ul>
      )}
      {showTts && (
        <div className={styles.tts}>
          <TextToSpeech contentRef={contentRef} />
        </div>
      )}
    </div>
  );
};

export default ObjectivesList;
