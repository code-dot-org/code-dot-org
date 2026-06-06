import type {FunctionComponent} from 'react';

import CustomDropdown from '@/dropdown/CustomDropdown';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {HEADER_BREAKPOINTS} from './breakpoints';

import moduleStyles from './helpButton.module.scss';

interface SupportLink {
  label: string;
  href: string;
}

function getSupportLinks(
  userType?: 'student' | 'teacher' | 'admin',
): SupportLink[] {
  return [
    {label: 'Help and support', href: 'https://support.code.org'},
    {
      label: 'Report a problem',
      href: 'https://support.code.org/hc/en-us/requests/new',
    },
    ...(userType === 'teacher'
      ? [{label: 'Teacher forum', href: 'https://forum.code.org'}]
      : []),
  ];
}

interface HelpButtonProps {
  userType?: 'student' | 'teacher' | 'admin';
}

const triggerSx = {
  '&&': {
    display: 'none',
    [`@media (min-width:${HEADER_BREAKPOINTS.desktopNav}px)`]: {
      display: 'inline-flex',
    },
    color: 'var(--neutral-base-white)',
    paddingLeft: '11px',
    paddingRight: '2px',
    paddingTop: '6.5px',
    paddingBottom: '6.5px',
    fontSize: '22px',
    minWidth: 0,
    minHeight: 0,
  },
  '&&:hover, &&:active, &&:focus-visible': {
    backgroundColor: 'transparent',
  },
};

/** "?" icon button with a support-links dropdown. Hidden below desktopNav breakpoint. */
const HelpButton: FunctionComponent<HelpButtonProps> = ({userType}) => {
  const links = getSupportLinks(userType);
  return (
    <CustomDropdown
      name="help-menu"
      labelText="Help menu"
      size="m"
      menuPlacement="right"
      aria-label="Help menu"
      useMuiIconButtonAsTrigger
      triggerButtonProps={{
        'aria-label': 'Help menu',
        sx: triggerSx,
        children: (
          <FontAwesomeV6Icon
            iconName="circle-question"
            iconStyle="solid"
            style={{fontSize: '22px'}}
          />
        ),
      }}
    >
      <ul className={moduleStyles.list}>
        {links.map(link => (
          <li key={link.label}>
            <a
              href={link.href}
              className={moduleStyles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </CustomDropdown>
  );
};

export default HelpButton;
