import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type {SxProps} from '@mui/material/styles';
import {visuallyHidden} from '@mui/utils';
import {useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {HEADER_BREAKPOINTS} from '../../shared/breakpoints';
import {
  headerMenuItemSx,
  headerMenuListSx,
  headerMenuPaperSx,
} from '../../shared/headerMenu';
import type {MenuItem as SupportLink} from '../../shared/types';

interface HelpButtonProps {
  /** Help/support links rendered in the menu. */
  supportLinks: SupportLink[];
}

/**
 * Help-menu trigger. Authored default-visible + hidden below the desktop-nav
 * breakpoint via a max-width query, so the button is present in jsdom (which
 * ignores @media) where the unit tests drive it.
 */
const helpTriggerSx: SxProps = {
  color: 'var(--neutral-base-white)',
  '&:focus-visible': {
    outline: '2px solid var(--text-neutral-white-fixed)',
    outlineOffset: '2px',
  },
  display: 'inline-flex',
  minWidth: 0,
  minHeight: 0,
  // Symmetric padding centers the glyph so the focus ring frames it evenly.
  padding: '6.5px 5px',
  fontSize: '22px',
  [`@media (max-width: ${HEADER_BREAKPOINTS.desktopNav - 1}px)`]: {
    display: 'none',
  },
  '&:hover, &:active': {
    backgroundColor: 'transparent',
  },
  // Match prod's 22px "?" — the FA glyph otherwise renders at 16px.
  '& i': {
    fontSize: '22px',
  },
};

/** "?" icon button with a support-links menu. Hidden below the desktop-nav breakpoint. */
const HelpButton: FunctionComponent<HelpButtonProps> = ({supportLinks}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();
  const newTabId = useId();

  return (
    <>
      <IconButton
        sx={helpTriggerSx}
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
          paper: {elevation: 0, sx: headerMenuPaperSx},
          list: {sx: headerMenuListSx, 'aria-label': 'Help'},
        }}
      >
        {supportLinks.map(link => (
          <MenuItem
            key={link.label}
            sx={headerMenuItemSx}
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
