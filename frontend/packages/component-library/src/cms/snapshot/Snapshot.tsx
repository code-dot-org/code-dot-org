import classNames from 'classnames';
import {Key, HTMLAttributes, ReactNode} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import {BodyTwoText, StrongText} from '@/typography';

import moduleStyles from './snapshot.module.scss';

export type SnapshotItem = {
  key: Key;
  icon: FontAwesomeV6IconProps;
  label: string;
  content: string | ReactNode;
};

export interface SnapshotProps extends HTMLAttributes<HTMLDListElement> {
  /** Snapshot items */
  items: SnapshotItem[];
  /** Snapshot class */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Snapshot.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Snapshot Component.
 * Acts as a container for snapshot details.
 */
const Snapshot: React.FC<SnapshotProps> = ({
  items,
  className,
  ...HTMLAttributes
}: SnapshotProps) => (
  <ul
    className={classNames(moduleStyles.snapshot, className)}
    {...HTMLAttributes}
  >
    {items?.map(({key, icon, label, content}) => (
      <li key={key} className={moduleStyles.snapshotItem}>
        <FontAwesomeV6Icon
          {...icon}
          aria-hidden="true"
          className={classNames(moduleStyles.snapshotItemIcon, icon.className)}
        />

        <BodyTwoText className={moduleStyles.snapshotItemContent}>
          <StrongText>{label}:</StrongText> {content}
        </BodyTwoText>
      </li>
    ))}
  </ul>
);

export default Snapshot;
