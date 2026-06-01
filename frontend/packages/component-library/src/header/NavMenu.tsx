import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import type {FunctionComponent} from 'react';

/** A single navigation link entry. */
interface MenuItem {
  /** Display label for the link. */
  label: string;
  /** Destination href. */
  href: string;
}

/** Props for {@link NavMenu}. */
interface NavMenuProps {
  /** Ordered list of navigation links to render. */
  menuItems: MenuItem[];
}

/** MUI sx styles for the horizontal menu list. */
const menuListSx = {display: 'flex', flexDirection: 'row', p: 0, m: 0};

/** MUI sx styles for each list item — shrinks to content width. */
const menuListItemSx = {width: 'auto', p: 0};

/** MUI sx styles for each nav link — fills the list item and highlights on hover. */
const menuListItemLinkSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  paddingLeft: 2,
  paddingRight: 2,
  textDecoration: 'none',
  '&:hover': {
    backgroundColor: 'var(--background-brand-teal-strong)',
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
