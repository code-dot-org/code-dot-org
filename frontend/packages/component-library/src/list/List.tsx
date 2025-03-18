import classNames from 'classnames';
import {ReactNode, HTMLAttributes} from 'react';

import {componentSizeToBodyTextSizeMap} from '@/common/constants';
import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import Typography from '@/typography';

import moduleStyles from './list.module.scss';

export const LIST_DEFAULT_ICON = 'circle-small';

export type ListItem = {
  label: string | ReactNode;
};

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /** List items */
  items: ListItem[];
  /** List icon */
  icon?: FontAwesomeV6IconProps;
  /** List size */
  size?: ComponentSizeXSToL;
  /** List type */
  type?: 'primary' | 'secondary' | 'brand';
  /** List text weight */
  weight?: 'normal' | 'bold';
  /** Class of the list */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/List.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: List Component.
 * Renders a list of items.
 */
const List: React.FC<ListProps> = ({
  items,
  className,
  size = 'm',
  type = 'primary',
  weight = 'normal',
  icon = {
    iconName: LIST_DEFAULT_ICON,
    iconStyle: 'solid',
  },
  ...HTMLAttributes
}: ListProps) => (
  <ul
    className={classNames(
      moduleStyles.list,
      moduleStyles[`list-type-${type}`],
      moduleStyles[`list-size-${size}`],
      moduleStyles[`list-weight-${weight}`],
      className,
    )}
    {...HTMLAttributes}
  >
    {items.map(({label}, index) => (
      <li key={index} className={classNames(moduleStyles.listItem)}>
        <FontAwesomeV6Icon
          {...icon}
          aria-hidden="true"
          className={classNames(
            moduleStyles.listItemIcon,
            icon.iconName == LIST_DEFAULT_ICON && moduleStyles.listItemBullet,
            icon.className,
          )}
        />

        <Typography
          semanticTag="span"
          className={moduleStyles.listItemLabel}
          visualAppearance={componentSizeToBodyTextSizeMap[size]}
        >
          {label}
        </Typography>
      </li>
    ))}
  </ul>
);

export default List;
