'use client';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import React, {HTMLAttributes, useState} from 'react';

import CallToAction from './CallToAction';
import CloseButton from './CloseButton';
import {commonStyles} from './common/styles';
import {CALL_TO_ACTION, DRAWER_LINKS, SITE_LOGO} from './config';
import HamburgerButton from './HamburgerButton';
import {LinkItemProps} from './LinkItem';
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
  const getLinks = (
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
        sx={commonStyles.appBar}
      >
        <Toolbar variant="dense" sx={commonStyles.toolBar} disableGutters>
          <Box sx={commonStyles.leftSide}>
            {/* Site Logo */}
            {siteLogo}
            {/* Main Menu Desktop with Dropdowns */}
            <MainMenuDesktop />
          </Box>
          {/* Call to Action */}
          {callToAction}
          {/* Hamburger Button */}
          <HamburgerButton onClick={handleDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav">
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
          sx={commonStyles.drawer}
        >
          {/* Close Button */}
          <CloseButton onClick={handleDrawerToggle} />
          {/* Drawer Content */}
          <Box onClick={handleDrawerToggle} sx={commonStyles.drawerContent}>
            <Box>
              {siteLogo}
              {getLinks('drawer', 'Main Links', DRAWER_LINKS.linkList)}
            </Box>
            {callToAction}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};

export default HeaderCSforAll;
