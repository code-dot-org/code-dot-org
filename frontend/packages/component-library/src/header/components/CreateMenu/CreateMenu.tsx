import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type {SxProps} from '@mui/material/styles';
import {useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {headerTriggerBase} from '../../shared/headerMenu';

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
  ...headerTriggerBase,
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
  '@media (max-width: 1200px)': {
    display: 'none',
  },
  '&:hover, &:active, &:focus-visible': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  '& .MuiButton-endIcon, & .MuiButton-endIcon i': {
    width: 'auto',
    fontSize: '14px',
  },
};

/**
 * Project-type picker. Same panel surface as the other header menus, but the
 * rows are icon + label tiles (heavier weight, neutral-tertiary hover). Applied
 * to the Menu's paper/list slots and each MenuItem, qualified by the MUI class
 * (compound, on-element) so it wins regardless of stylesheet order or portal
 * nesting.
 */
const createPaperSx: SxProps = {
  '&.MuiPaper-root': {
    marginTop: '4px',
    backgroundColor: 'var(--background-neutral-primary)',
    border: '1px solid var(--borders-neutral-primary)',
    borderRadius: '4px',
    boxShadow:
      'rgb(0 0 0 / 0.1) 0 10px 15px -3px, rgb(0 0 0 / 0.05) 0 4px 6px -2px',
  },
};

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

const tileIconSx = {
  width: '2.5rem',
  height: '2.5rem',
  flexShrink: 0,
  objectFit: 'contain',
  borderRadius: '4px',
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
          paper: {elevation: 0, sx: createPaperSx},
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
            <Box component="img" src={item.iconUrl} alt="" sx={tileIconSx} />
            <span>{item.label}</span>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CreateMenu;
