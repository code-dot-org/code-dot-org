'use client';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import React, {HTMLAttributes, useState} from 'react';

import CallToAction from './CallToAction';
import CloseButton from './CloseButton';
import {headerStyles} from './common/styles';
import {LinkItemProps} from './common/types';
import {
  CALL_TO_ACTION,
  TOP_LEVEL_LINKS,
  SITE_LOGO,
  MAIN_MENU_DESKTOP_ITEMS,
} from './config';
import HamburgerButton from './HamburgerButton';
import LinkList from './LinkList';
import MainMenuDesktop from './MainMenuDesktop';
import SiteLogo from './SiteLogo';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Custom class */
  className?: string;
}

const HeaderCSforAll: React.FC<HeaderProps> = ({className}) => {
  // State for Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Toggle Drawer
  const handleDrawerToggle = () => {
    setDrawerOpen(prevState => !prevState);
  };

  // Get Site Logo Component
  const siteLogo = <SiteLogo {...SITE_LOGO.logo} />;

  // Get Call to Action Component
  const callToAction = (
    <CallToAction className="call-to-action" {...CALL_TO_ACTION.callToAction} />
  );

  // Get Link List
  const getDrawerLinks = (
    className: string,
    ariaLabel: string,
    linkList: LinkItemProps[],
  ) => (
    <LinkList
      className={`link-list-${className}`}
      ariaLabel={ariaLabel}
      linkList={linkList}
    />
  );

  return (
    <Box component="header" className={className}>
      <AppBar
        component="nav"
        elevation={0}
        position="relative"
        aria-label="Main navigation"
        sx={headerStyles.appBar}
      >
        <Toolbar variant="dense" sx={headerStyles.toolBar} disableGutters>
          <Box sx={headerStyles.leftSide}>
            {/* Site Logo */}
            {siteLogo}
            {/* Main Menu Desktop with Dropdowns */}
            <MainMenuDesktop mainMenuDesktopItems={MAIN_MENU_DESKTOP_ITEMS} />
          </Box>
          {/* Call to Action */}
          {callToAction}
          {/* Hamburger Button */}
          <HamburgerButton onClick={handleDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" aria-label="Main mobile navigation">
        <Drawer
          variant="temporary"
          open={drawerOpen}
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
          sx={headerStyles.drawer}
        >
          {/* Close Button */}
          <CloseButton onClick={handleDrawerToggle} />
          {/* Drawer Content */}
          <Box onClick={handleDrawerToggle} sx={headerStyles.drawerContent}>
            <Box>
              {siteLogo}
              {getDrawerLinks('drawer', 'Main Links', TOP_LEVEL_LINKS.linkList)}
            </Box>
            {callToAction}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};

export default HeaderCSforAll;
