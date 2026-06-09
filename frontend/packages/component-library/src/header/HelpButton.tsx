import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {getSupportLinks} from './supportLinks';
import type {UserType} from './types';

import menuStyles from './headerMenu.module.scss';
import moduleStyles from './helpButton.module.scss';

interface HelpButtonProps {
  userType?: UserType;
}

/** "?" icon button with a support-links menu. Hidden below the desktop-nav breakpoint. */
const HelpButton: FunctionComponent<HelpButtonProps> = ({userType}) => {
  const links = getSupportLinks(userType);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();
  const newTabId = useId();

  return (
    <>
      <IconButton
        className={moduleStyles.trigger}
        aria-label="Help menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <FontAwesomeV6Icon iconName="circle-question" iconStyle="solid" />
      </IconButton>
      <span id={newTabId} className={menuStyles.visuallyHidden}>
        Opens in a new tab
      </span>
      <Menu
        id={menuId}
        className={menuStyles.menu}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{paper: {elevation: 0}, list: {'aria-label': 'Help'}}}
      >
        {links.map(link => (
          <MenuItem
            key={link.label}
            component="a"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-describedby={newTabId}
            onClick={() => setAnchorEl(null)}
          >
            {link.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default HelpButton;
