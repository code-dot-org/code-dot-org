'use client';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import {alpha} from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import React, {
  AnchorHTMLAttributes,
  HTMLAttributes,
  Key,
  useState,
} from 'react';

import theme from '@/themes/csforall';
import logoImage from '@public/images/csforall-logo.svg';

import CallToAction, {CallToActionProps} from './CallToAction';
import SiteLogo, {SiteLogoProps} from './SiteLogo';

export interface SiteLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
}
export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Site links */
  siteLinks?: SiteLink[];
  /** Custom class */
  className?: string;
}

const defaultProps: HeaderProps & {logo: SiteLogoProps} & {
  callToAction: CallToActionProps;
} = {
  logo: {
    label: 'CSforAll',
    href: '/',
    imgSrc: logoImage.src,
  },
  siteLinks: [
    {key: 'issues', label: 'Issues', href: '/issues'},
    {key: 'take-action', label: 'Take Action', href: '/take-action'},
    {key: 'hour-of-ai', label: 'Hour of AI', href: '/hour-of-ai'},
    {key: 'donate', label: 'Donate', href: '/donate'},
    {
      key: 'news-and-resources',
      label: 'News & Resources',
      href: '/news-and-resources',
    },
  ],
  callToAction: {
    type: 'emphasized',
    size: 'small',
    text: 'Get Involved',
    href: '/get-involved',
  },
};

const HeaderMui: React.FC<HeaderProps> = ({siteLinks, className}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(prevState => !prevState);
  };

  // Get Site Logo Component
  const getSiteLogo = () => <SiteLogo {...defaultProps.logo} />;

  // Get Call to Action Component
  const getCallToAction = () => (
    <CallToAction className="call-to-action" {...defaultProps.callToAction} />
  );

  const getSiteLinks = (size: string) => (
    <List
      className={`site-links-${size}`}
      component="ul"
      aria-label="Site links"
    >
      {siteLinks?.map(({key, label, href}) => (
        <ListItem key={key}>
          <Link href={href} aria-label={label}>
            {label}
          </Link>
        </ListItem>
      ))}
    </List>
  );

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={styles.drawerContent}>
      <Box>
        {getSiteLogo()}
        {getSiteLinks('mobile')}
      </Box>
      {getCallToAction()}
    </Box>
  );

  return (
    <Box component="header">
      <AppBar
        className={className}
        component="nav"
        elevation={0}
        position="relative"
        sx={styles.appBar}
      >
        <Toolbar variant="dense" sx={styles.toolBar} disableGutters>
          <Box sx={styles.leftSide}>
            {/* Site Logo */}
            {getSiteLogo()}
            {/* Site Links */}
            {getSiteLinks('desktop')}
          </Box>
          {/* Call to Action Button */}
          {getCallToAction()}
          {/* Menu Button */}
          <IconButton
            aria-label="Open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={styles.menuButton}
            disableRipple
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* Drawer */}
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          anchor={
            typeof document !== 'undefined' &&
            document.documentElement.dir === 'rtl'
              ? 'left'
              : 'right'
          }
          ModalProps={{
            keepMounted: true,
          }}
          sx={styles.drawer}
        >
          {/* Close Button */}
          <IconButton
            aria-label="Close drawer"
            onClick={handleDrawerToggle}
            disableRipple
            sx={styles.closeButton}
          >
            <CloseIcon fontSize="large" />
          </IconButton>
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
};

const breakpoint = 1075; // px
const styles = {
  appBar: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4),
    [`@media (max-width: ${breakpoint}px)`]: {
      '.site-links-desktop, .call-to-action': {
        display: 'none',
      },
    },
  },
  toolBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSide: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(4),
    '& .MuiList-root': {
      display: 'flex',
      flexDirection: 'row',
      gap: theme.spacing(1),
      [`@media (max-width: ${breakpoint}px)`]: {
        display: 'none',
      },
    },
    '.MuiListItem-root': {
      margin: 0,
      padding: 0,
      width: 'auto',
      '& a': {
        textDecoration: 'none',
        marginBottom: 0,
        padding: theme.spacing(1, 2),
        borderRadius: theme.shape.borderRadius,
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
        },
      },
    },
  },
  menuButton: {
    display: 'none',
    [`@media (max-width: ${breakpoint}px)`]: {
      display: 'flex',
    },
    '& svg': {
      color: theme.palette.common.black,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
  drawer: {
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      maxWidth: '430px',
      width: '100%',
      paddingBlock: theme.spacing(3.5),
      paddingInline: theme.spacing(4),
      '& .MuiListItem-root': {
        padding: 0,
        paddingBottom: theme.spacing(4),
        '& a': {
          margin: 0,
        },
      },
      '& .logo-link': {
        display: 'none',
        [`@media (max-width: 494px)`]: {
          display: 'block',
          marginBottom: theme.spacing(4),
        },
      },
      '& .call-to-action': {
        width: '100%',
      },
    },
  },
  drawerContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 'inherit',
  },
  closeButton: {
    width: 'auto',
    position: 'absolute',
    insetBlockStart: theme.spacing(2.25),
    insetInlineEnd: theme.spacing(1.5),
    zIndex: 1000,
    '& svg': {
      color: theme.palette.common.black,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
};

const HeaderCSforAll = () => {
  return <HeaderMui {...defaultProps} />;
};

export default HeaderCSforAll;
