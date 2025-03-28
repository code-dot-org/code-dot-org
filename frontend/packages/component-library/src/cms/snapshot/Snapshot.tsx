import classNames from 'classnames';
import {Key, HTMLAttributes, ReactNode} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import moduleStyles from './snapshot.module.scss';

export type SnapshotItem = {
  key: Key;
  icon: FontAwesomeV6IconProps;
  label: string | ReactNode;
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
  <dl
    className={classNames(moduleStyles.snapshot, className)}
    {...HTMLAttributes}
  >
    {items?.map(({key, icon, label, content}) => (
      <div key={key} className={moduleStyles.snapshotItem}>
        <FontAwesomeV6Icon
          {...icon}
          aria-hidden="true"
          className={classNames(moduleStyles.snapshotItemIcon, icon.className)}
        />

        <dt className={moduleStyles.snapshotItemLabel}>
          {label}
          <span aria-hidden="true">:&nbsp;</span>
        </dt>

        <dd className={moduleStyles.snapshotItemContent}>{content}</dd>
      </div>
    ))}
  </dl>
);

export default Snapshot;
