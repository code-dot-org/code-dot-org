import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type {SxProps} from '@mui/material/styles';
import {useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {HEADER_BREAKPOINTS} from '../../shared/breakpoints';
import {headerMenuPaperSx} from '../../shared/headerMenu';

import moduleStyles from './CreateMenu.module.scss';

export interface CreateMenuItem {
  id: string;
  label: string;
  href: string;
  iconUrl: string;
}

interface CreateMenuProps {
  items: CreateMenuItem[];
}

/**
 * "New project" trigger (transparent outline pill on the teal bar). Authored
 * default-visible + hidden below the desktop-full breakpoint via a max-width
 * query so jsdom (which ignores @media) keeps the button testable.
 */
const createTriggerSx: SxProps = {
  color: 'var(--neutral-base-white)',
  '&:focus-visible': {
    outline: '2px solid var(--text-neutral-white-fixed)',
    outlineOffset: '2px',
  },
  display: 'inline-flex',
  minWidth: 0,
  height: '35px',
  padding: '6.5px 1rem',
  columnGap: '8px',
  border: '1px solid var(--neutral-base-white)',
  borderRadius: '4px',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: 1.5,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  [`@media (max-width: ${HEADER_BREAKPOINTS.desktopFull - 1}px)`]: {
    display: 'none',
  },
  '&:hover, &:active, &:focus-visible': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    // Re-pin the white outline; the theme's Button :active rule recolors it otherwise.
    border: '1px solid var(--neutral-base-white)',
  },
  '& .MuiButton-endIcon, & .MuiButton-endIcon i': {
    width: 'auto',
    fontSize: '14px',
  },
};

/**
 * Project-type picker rows: icon + label tiles (heavier weight,
 * neutral-tertiary hover). The panel surface reuses the shared headerMenuPaperSx;
 * the list/tiles are qualified by the MUI class (compound, on-element) so they
 * win regardless of stylesheet order or portal nesting.
 */
const createListSx: SxProps = {
  '&.MuiList-root': {
    minWidth: '240px',
    padding: '4px 0',
  },
};

const createTileSx: SxProps = {
  '&.MuiMenuItem-root': {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    minHeight: 0,
    padding: '0.375rem',
    color: 'var(--text-neutral-primary)',
    fontSize: '14px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    '&:visited, &:active': {
      color: 'var(--text-neutral-primary)',
    },
    '&:hover': {
      backgroundColor: 'var(--background-neutral-tertiary)',
    },
  },
};

/** "New project +" button with a project-type picker. Hidden below the desktop-full breakpoint. */
const CreateMenu: FunctionComponent<CreateMenuProps> = ({items}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();

  return (
    <>
      <Button
        sx={createTriggerSx}
        aria-label="New project menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        color="inherit"
        disableElevation
        onClick={event => setAnchorEl(event.currentTarget)}
        endIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
      >
        New project
      </Button>
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
          list: {sx: createListSx, 'aria-label': 'New project'},
        }}
      >
        {items.map(item => (
          <MenuItem
            key={item.id}
            sx={createTileSx}
            component="a"
            href={item.href}
            onClick={() => setAnchorEl(null)}
          >
            <Box
              component="img"
              src={item.iconUrl}
              alt=""
              className={moduleStyles.tileIcon}
            />
            <span>{item.label}</span>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CreateMenu;
