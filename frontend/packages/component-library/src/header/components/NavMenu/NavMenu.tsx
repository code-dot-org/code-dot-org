import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import type {FunctionComponent} from 'react';

import type {MenuItem} from '../../shared/types';

import moduleStyles from './NavMenu.module.scss';

/** Props for {@link NavMenu}. */
interface NavMenuProps {
  /** Ordered list of navigation links to render. */
  menuItems: MenuItem[];
}

/** Horizontal navigation link list rendered inside the header toolbar. */
const NavMenu: FunctionComponent<NavMenuProps> = ({menuItems}) => (
  <List className={moduleStyles.navList}>
    {menuItems.map(item => (
      <ListItem key={item.label} className={moduleStyles.navItem}>
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

export default NavMenu;
