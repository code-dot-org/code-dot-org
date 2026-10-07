import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useRef} from 'react';

import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

import {ObjectiveItemState} from '../useObjectives';

import styles from './objectives-list.module.scss';

interface ObjectivesListProps {
  title?: string;
  items: ObjectiveItemState[];
  /** Offer a button that reads the list aloud. */
  showTts?: boolean;
}

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
        <EnhancedSafeMarkdown
          markdown={title}
          className={styles.title}
          openExternalLinksInNewTab
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
              <EnhancedSafeMarkdown
                markdown={item.text}
                className={styles.text}
                openExternalLinksInNewTab
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
