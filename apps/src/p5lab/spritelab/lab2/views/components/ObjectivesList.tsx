import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

import {ObjectiveItemState} from '../useObjectives';

import styles from './objectives-list.module.scss';

interface ObjectivesListProps {
  title?: string;
  items: ObjectiveItemState[];
  /** Shown under the list once every item is done. */
  doneText?: string;
  allDone: boolean;
}

/** The level's checklist: each item with a circle that fills with a check
    when the student has done it. */
const ObjectivesList: React.FunctionComponent<ObjectivesListProps> = ({
  title,
  items,
  doneText,
  allDone,
}) => (
  <div className={styles.objectives}>
    {title && (
      <EnhancedSafeMarkdown
        markdown={title}
        className={styles.title}
        openExternalLinksInNewTab
      />
    )}
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
    {allDone && doneText && (
      <EnhancedSafeMarkdown
        markdown={doneText}
        className={styles.done}
        openExternalLinksInNewTab
      />
    )}
  </div>
);

export default ObjectivesList;
