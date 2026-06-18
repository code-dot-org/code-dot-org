import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {visuallyHidden} from '@mui/utils';
import {useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import type {MenuItem as SupportLink} from '../../shared/types';

import moduleStyles from './HelpButton.module.scss';
import headerMenuStyles from '../../shared/headerMenu.module.scss';

interface HelpButtonProps {
  /** Help/support links rendered in the menu. */
  supportLinks: SupportLink[];
}

/** "?" icon button with a support-links menu. Hidden below the desktop-nav breakpoint. */
const HelpButton: FunctionComponent<HelpButtonProps> = ({supportLinks}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();
  const newTabId = useId();

  return (
    <>
      <IconButton
        className={moduleStyles.helpTrigger}
        aria-label="Help menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <FontAwesomeV6Icon iconName="circle-question" iconStyle="solid" />
      </IconButton>
      <Box component="span" id={newTabId} sx={visuallyHidden}>
        Opens in a new tab
      </Box>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
        marginThreshold={0}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{
          paper: {elevation: 0, className: headerMenuStyles.menuPaper},
          list: {className: headerMenuStyles.menuList, 'aria-label': 'Help'},
        }}
      >
        {supportLinks.map(link => (
          <MenuItem
            key={link.label}
            className={headerMenuStyles.menuItem}
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
