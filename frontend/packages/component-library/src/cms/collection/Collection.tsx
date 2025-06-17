import {HTMLAttributes, ReactNode} from 'react';

import moduleStyles from './collection.module.scss';

export interface CollectionProps extends HTMLAttributes<HTMLElement> {
  /** Collection items */
  items?: ReactNode[];
  // CSS grid columns
  columns?: number;
  // CSS grid gap
  gap?: string;
  /** Collection class */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Collection.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Collection Component.
 * A collection component that displays a list of content in a grid.
 */
const Collection: React.FC<CollectionProps> = ({
  items,
  columns = 3,
  gap = '1.5rem',
  className,
  ...HTMLAttributes
}) => (
  <div {...HTMLAttributes} className={className}>
    {items && items.length > 0 ? (
      <div
        className={moduleStyles.collection}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gap,
        }}
      >
        {items.map((item, index) => (
          <div key={index} className={moduleStyles.collectionItem}>
            {item}
          </div>
        ))}
      </div>
    ) : (
      <div className={moduleStyles.emptyCollection}>No items to display.</div>
    )}
  </div>
);

export default Collection;
