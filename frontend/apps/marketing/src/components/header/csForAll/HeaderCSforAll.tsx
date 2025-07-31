'use client';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import {alpha} from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import React, {HTMLAttributes, useState} from 'react';

import theme from '@/themes/csforall';
import logoImage from '@public/images/csforall-logo.svg';

import CallToAction, {CallToActionProps} from './CallToAction';
import CloseButton from './CloseButton';
import {mobileBreakpoint} from './common/constants';
import LinkList, {LinkItem} from './LinkList';
import MenuButton from './MenuButton';
import SiteLogo, {SiteLogoProps} from './SiteLogo';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
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
  callToAction: {
    type: 'emphasized',
    size: 'small',
    text: 'Get Involved',
    href: '/get-involved',
  },
};

const desktopLinks: {linkList: LinkItem[]} = {
  linkList: [
    {key: 'issues', label: 'Issues', href: '/issues', typography: 'body3'},
    {
      key: 'take-action',
      label: 'Take Action',
      href: '/take-action',
      typography: 'body3',
    },
    {
      key: 'hour-of-ai',
      label: 'Hour of AI',
      href: '/hour-of-ai',
      typography: 'body3',
    },
    {
      key: 'donate',
      label: 'Donate',
      href: '/donate',
      typography: 'body3',
    },
    {
      key: 'news-and-resources',
      label: 'News & Resources',
      href: '/news-and-resources',
      typography: 'body3',
    },
  ],
};

const drawerLinks: {linkList: LinkItem[]} = {
  linkList: [
    {key: 'issues', label: 'Issues', href: '/issues', typography: 'h4'},
    {
      key: 'take-action',
      label: 'Take Action',
      href: '/take-action',
      typography: 'h4',
    },
    {
      key: 'hour-of-ai',
      label: 'Hour of AI',
      href: '/hour-of-ai',
      typography: 'h4',
    },
    {
      key: 'donate',
      label: 'Donate',
      href: '/donate',
      typography: 'h4',
    },
    {
      key: 'news-and-resources',
      label: 'News & Resources',
      href: '/news-and-resources',
      typography: 'h4',
    },
  ],
};

const HeaderMui: React.FC<HeaderProps> = ({className}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toggle Drawer
  const handleDrawerToggle = () => {
    setMobileOpen(prevState => !prevState);
  };

  // Get Site Logo Component
  const siteLogo = <SiteLogo {...defaultProps.logo} />;

  // Get Call to Action Component
  const callToAction = (
    <CallToAction className="call-to-action" {...defaultProps.callToAction} />
  );

  const getDesktopLinks = (size: string) => (
    <LinkList
      className={`link-list-${size}`}
      ariaLabel="Main Links"
      linkList={desktopLinks.linkList}
    />
  );

  // Get Links for Drawer
  const getDrawerLinks = (size: string) => (
    <LinkList
      className={`link-list-${size}`}
      ariaLabel="Main Links"
      linkList={drawerLinks.linkList}
    />
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
            {siteLogo}
            {/* Site Links */}
            {getDesktopLinks('desktop')}
          </Box>
          {/* Call to Action Button */}
          {callToAction}
          {/* Menu Button */}
          <MenuButton onClick={handleDrawerToggle} />
        </Toolbar>
      </AppBar>
      {/* Drawer */}
      <Box component="nav">
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
          <CloseButton onClick={handleDrawerToggle} />
          {/* Drawer Content */}
          <Box onClick={handleDrawerToggle} sx={styles.drawerContent}>
            <Box>
              {siteLogo}
              {getDrawerLinks('mobile')}
            </Box>
            {callToAction}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};

const styles = {
  appBar: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4),
    [`@media (max-width: ${mobileBreakpoint}px)`]: {
      '.link-list-desktop, .call-to-action': {
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
      [`@media (max-width: ${mobileBreakpoint}px)`]: {
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
};

const HeaderCSforAll = () => {
  return <HeaderMui {...defaultProps} />;
};

export default HeaderCSforAll;
