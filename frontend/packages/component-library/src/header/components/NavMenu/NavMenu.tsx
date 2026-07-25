import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import classnames from 'classnames';
import type {FunctionComponent} from 'react';

import type {MenuItem} from '../../shared/types';

import moduleStyles from './NavMenu.module.scss';

/** Props for {@link NavMenu}. */
interface NavMenuProps {
  /** Ordered list of navigation links to render. */
  menuItems: MenuItem[];
  /**
   * Marks this as the signed-out marketing item set: adds the durable
   * `marketing-nav` class (its own staged-collapse CSS) and lets the bar fill
   * the middle section so `alignEnd` items' auto margin reaches the edge.
   */
  marketingNav?: boolean;
}

/** Horizontal navigation link list rendered inside the header toolbar. */
const NavMenu: FunctionComponent<NavMenuProps> = ({
  menuItems,
  marketingNav = false,
}) => {
  const firstAlignEndIndex = menuItems.findIndex(item => item.alignEnd);

  return (
    <List
      className={classnames(
        moduleStyles.navList,
        marketingNav && 'marketing-nav',
      )}
    >
      {menuItems.map((item, index) => (
        <ListItem
          key={item.label}
          className={classnames(
            moduleStyles.navItem,
            item.alignEnd && moduleStyles.navItemAlignEnd,
            index === firstAlignEndIndex && moduleStyles.navItemAlignEndFirst,
          )}
        >
          <Link
            href={item.href}
            color="inherit"
            variant="body3"
            className={moduleStyles.navLink}
          >
            {item.label}
          </Link>
        </ListItem>
      ))}
    </List>
  );
};

export default NavMenu;
