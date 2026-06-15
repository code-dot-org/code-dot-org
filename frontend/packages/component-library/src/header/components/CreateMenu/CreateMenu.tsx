import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './CreateMenu.module.scss';
import headerMenuStyles from '../../shared/headerMenu.module.scss';

export interface CreateMenuItem {
  id: string;
  label: string;
  href: string;
  iconUrl: string;
}

interface CreateMenuProps {
  items: CreateMenuItem[];
}

/** "New project +" button with a project-type picker. Hidden below the desktop-full breakpoint. */
const CreateMenu: FunctionComponent<CreateMenuProps> = ({items}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();

  return (
    <>
      <Button
        className={moduleStyles.createTrigger}
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
          paper: {elevation: 0, className: headerMenuStyles.menuPaper},
          list: {
            className: moduleStyles.createList,
            'aria-label': 'New project',
          },
        }}
      >
        {items.map(item => (
          <MenuItem
            key={item.id}
            className={moduleStyles.createTile}
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
