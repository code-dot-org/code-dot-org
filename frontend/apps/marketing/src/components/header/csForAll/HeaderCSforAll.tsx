'use client';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import React, {HTMLAttributes, useState} from 'react';

import CallToAction from './CallToAction';
import CloseButton from './CloseButton';
import {CALL_TO_ACTION, DESKTOP_LINKS, DRAWER_LINKS, SITE_LOGO} from './config';
import HamburgerButton from './HamburgerButton';
import LinkList, {LinkItem} from './LinkList';
import SiteLogo from './SiteLogo';
import {styles} from './styles';

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
    linkList: LinkItem[],
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
        sx={styles.appBar}
      >
        <Toolbar variant="dense" sx={styles.toolBar} disableGutters>
          <Box sx={styles.leftSide}>
            {/* Site Logo */}
            {siteLogo}
            {/* Desktop Links */}
            {getLinks('desktop', 'Main Links', DESKTOP_LINKS.linkList)}
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
          sx={styles.drawer}
        >
          {/* Close Button */}
          <CloseButton onClick={handleDrawerToggle} />
          {/* Drawer Content */}
          <Box onClick={handleDrawerToggle} sx={styles.drawerContent}>
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
