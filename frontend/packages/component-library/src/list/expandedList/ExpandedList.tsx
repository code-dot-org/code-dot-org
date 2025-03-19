import classNames from 'classnames';
import {Key, ReactNode, HTMLAttributes} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import {StrongText, BodyThreeText} from '@/typography';

import moduleStyles from './expandedList.module.scss';

export const EXPANDED_LIST_DEFAULT_ICON = 'smile';

export type ExpandedListItem = {
  key: Key;
  label: string | ReactNode;
  content: string | ReactNode;
};

export interface ExpandedListProps extends HTMLAttributes<HTMLUListElement> {
  /** ExpandedList items */
  items: ExpandedListItem[];
  /** ExpandedList icon */
  icon?: FontAwesomeV6IconProps;
  /** Class of the list */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/ExpandedList.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: ExpandedList Component.
 * Renders a list of items with content including a customizable icon, heading, description, and optional links.
 */
const ExpandedList: React.FC<ExpandedListProps> = ({
  items,
  className,
  icon = {
    iconName: EXPANDED_LIST_DEFAULT_ICON,
    iconStyle: 'solid',
  },
  ...HTMLAttributes
}: ExpandedListProps) => (
  <ul
    className={classNames(moduleStyles.expandedList, className)}
    {...HTMLAttributes}
  >
    {items.map(({key, label, content}) => (
      <li key={key} className={classNames(moduleStyles.expandedListItem)}>
        <FontAwesomeV6Icon
          {...icon}
          aria-hidden="true"
          className={classNames(
            moduleStyles.expandedListItemIcon,
            icon.className,
          )}
        />

        <StrongText
          visualAppearance="heading-sm"
          className={moduleStyles.expandedListItemLabel}
        >
          {label}
        </StrongText>

        <BodyThreeText className={moduleStyles.expandedListItemContent}>
          {content}
        </BodyThreeText>
      </li>
    ))}
  </ul>
);

export default ExpandedList;
