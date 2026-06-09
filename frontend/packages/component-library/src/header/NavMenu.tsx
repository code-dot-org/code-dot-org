import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import type {FunctionComponent} from 'react';

import {HEADER_BREAKPOINTS} from './breakpoints';
import type {MenuItem} from './types';

/** Props for {@link NavMenu}. */
interface NavMenuProps {
  /** Ordered list of navigation links to render. */
  menuItems: MenuItem[];
}

/** Hidden below desktopNav breakpoint; the hamburger drawer covers that range. */
const menuListSx = {
  display: 'none',
  [`@media (min-width:${HEADER_BREAKPOINTS.desktopNav}px)`]: {display: 'flex'},
  flexDirection: 'row',
  alignItems: 'center',
  p: 0,
  m: 0,
  marginLeft: '16px',
  gap: '36px',
};

/** MUI sx styles for each list item — shrinks to content width. */
const menuListItemSx = {width: 'auto', p: 0};

/** MUI sx styles for each nav link — text-width anchor, full toolbar height for the underline. */
const menuListItemLinkSx = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  textDecoration: 'none',
  '&:hover, &:active': {
    boxShadow: 'inset 0 -2px 0 #ffa400',
  },
  // Match the header's other controls; without this the link falls back to the UA ring.
  '&:focus-visible': {
    outline: '2px solid var(--text-neutral-inverse)',
    outlineOffset: '2px',
  },
  fontWeight: 'normal',
};

/** Horizontal navigation link list rendered inside the header toolbar. */
const NavMenu: FunctionComponent<NavMenuProps> = ({menuItems}) => (
  <List sx={menuListSx}>
    {menuItems.map(item => (
      <ListItem key={item.label} sx={menuListItemSx}>
        <Link
          href={item.href}
          color="inherit"
          variant="body3"
          sx={menuListItemLinkSx}
        >
          {item.label}
        </Link>
      </ListItem>
    ))}
  </List>
);

export default NavMenu;
