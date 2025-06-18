import classNames from 'classnames';
import {Key, ReactNode, HTMLAttributes} from 'react';

import {componentSizeToBodyTextSizeMap} from '@/common/constants';
import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import Typography from '@/typography';

import moduleStyles from './simpleList.module.scss';

export const SIMPLE_LIST_DEFAULT_ICON = 'circle-small';

export type SimpleListItem = {
  key: Key;
  label: string | ReactNode;
};

export interface SimpleListProps extends HTMLAttributes<HTMLUListElement> {
  /** SimpleList items */
  items: SimpleListItem[];
  /** SimpleList icon */
  icon?: FontAwesomeV6IconProps;
  /** SimpleList size */
  size?: ComponentSizeXSToL;
  /** SimpleList type */
  type?: 'primary' | 'secondary' | 'brand';
  /** SimpleList text weight */
  weight?: 'normal' | 'bold';
  /** Class of the list */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/SimpleList.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: SimpleList Component.
 * Renders a list of items.
 */
const SimpleList: React.FC<SimpleListProps> = ({
  items,
  className,
  size = 'm',
  type = 'primary',
  weight = 'normal',
  icon = {
    iconName: SIMPLE_LIST_DEFAULT_ICON,
    iconStyle: 'solid',
  },
  ...HTMLAttributes
}: SimpleListProps) => (
  <ul
    className={classNames(
      moduleStyles.simpleList,
      moduleStyles[`simpleList-type-${type}`],
      moduleStyles[`simpleList-size-${size}`],
      moduleStyles[`simpleList-weight-${weight}`],
      className,
    )}
    {...HTMLAttributes}
  >
    {items.map(({key, label}) => (
      <li key={key} className={classNames(moduleStyles.simpleListItem)}>
        <FontAwesomeV6Icon
          {...icon}
          aria-hidden="true"
          className={classNames(
            moduleStyles.simpleListItemIcon,
            icon.iconName == SIMPLE_LIST_DEFAULT_ICON &&
              moduleStyles.simpleListItemBullet,
            icon.className,
          )}
        />

        <Typography
          semanticTag="span"
          className={moduleStyles.simpleListItemLabel}
          visualAppearance={componentSizeToBodyTextSizeMap[size]}
        >
          {label}
        </Typography>
      </li>
    ))}
  </ul>
);

export default SimpleList;
