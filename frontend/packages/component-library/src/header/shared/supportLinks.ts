import type {MenuItem, UserType} from './types';

/**
 * Help/support links shown in both the Help menu and the hamburger panel.
 * All open in a new tab; teachers additionally get the forum.
 */
export function getSupportLinks(userType?: UserType): MenuItem[] {
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
