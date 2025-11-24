import {
  AppBar,
  Toolbar,
  IconButton,
  Link,
  List,
  ListItem,
  Box,
} from '@mui/material';
import {FunctionComponent} from 'react';

interface MenuItem {
  label: string;
  href: string;
}

export interface HeaderProps {
  brandName?: string;
  /** Site logo image source */
  logoImageUrl: string;
  menuItems: MenuItem[];
}

const styles = {
  appBar: {
    backgroundColor: 'var(--background-brand-teal-primary)',
  },
  logoBox: {
    width: '2.375rem',
    height: '2.375rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      display: 'block',
    },
  },
  logoIconButton: {
    marginLeft: 0,
    p: 0,
    paddingLeft: 1.5,
    paddingRight: 1.5,
  },
  menuList: {display: 'flex', flexDirection: 'row', p: 0, m: 0},
  menuListItem: {width: 'auto', p: 0},
  menuListItemLink: {
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
  },
};

const Header: FunctionComponent<HeaderProps> = ({
  logoImageUrl,
  brandName,
  menuItems,
}) => {
  return (
    <Box component="header">
      <AppBar
        component="nav"
        elevation={0}
        position="relative"
        aria-label="Main navigation"
        sx={styles.appBar}
      >
        <Toolbar variant="dense" disableGutters sx={{alignItems: 'stretch'}}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label={`${brandName} Home`}
            sx={styles.logoIconButton}
            href="/"
          >
            <Box sx={styles.logoBox}>
              <img src={logoImageUrl} alt={`${brandName} Logo`} />
            </Box>
          </IconButton>

          <List sx={styles.menuList}>
            {Array.isArray(menuItems) &&
              menuItems.map(item => (
                <ListItem key={item.label} sx={styles.menuListItem}>
                  <Link
                    href={item.href}
                    color="inherit"
                    variant="body3"
                    sx={styles.menuListItemLink}
                  >
                    {item.label}
                  </Link>
                </ListItem>
              ))}
          </List>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
