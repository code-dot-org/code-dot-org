import type {FunctionComponent} from 'react';

import CustomDropdown from '@/dropdown/CustomDropdown';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {HEADER_BREAKPOINTS} from './breakpoints';

import moduleStyles from './createMenu.module.scss';

export interface CreateMenuItem {
  id: string;
  label: string;
  href: string;
  iconUrl: string;
}

interface CreateMenuProps {
  items: CreateMenuItem[];
}

const triggerSx = {
  '&&': {
    display: 'none',
    [`@media (min-width:${HEADER_BREAKPOINTS.desktopFull}px)`]: {
      display: 'inline-flex',
    },
    backgroundColor: 'transparent',
    color: 'var(--neutral-base-white)',
    border: '1px solid var(--neutral-base-white)',
    borderRadius: '4px',
    boxShadow: 'none',
    textTransform: 'none' as const,
    columnGap: '8.46875px',
    height: '35px',
    marginTop: '-1px',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '6.5px',
    paddingBottom: '6.5px',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  '&&:hover, &&:active, &&:focus-visible': {
    backgroundColor: 'rgba(255,255,255,0.1)',
    boxShadow: 'none',
  },
  '&& .MuiButton-endIcon, && .MuiButton-endIcon i': {
    fontSize: '14px',
    width: 'auto',
  },
};

/** "New project +" button with a project-type picker dropdown. Hidden below desktopFull breakpoint. */
const CreateMenu: FunctionComponent<CreateMenuProps> = ({items}) => (
  <CustomDropdown
    name="create-menu"
    labelText="New project"
    size="m"
    menuPlacement="right"
    aria-label="New project menu"
    useMuiButtonAsTrigger
    triggerButtonProps={{
      'aria-label': 'New project menu',
      disableElevation: true,
      sx: triggerSx,
      endIcon: <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />,
      children: 'New project',
    }}
  >
    <ul className={moduleStyles.list}>
      {items.map(item => (
        <li key={item.id}>
          <a href={item.href} className={moduleStyles.tile}>
            <img src={item.iconUrl} alt="" className={moduleStyles.icon} />
            <span>{item.label}</span>
          </a>
        </li>
      ))}
    </ul>
  </CustomDropdown>
);

export default CreateMenu;
