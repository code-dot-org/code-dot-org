import {LinkItemProps} from '../common/types';

// Function to create a link item used in the Header
export const createLinkItem = (
  link: LinkItemProps,
  overrides: Partial<LinkItemProps> = {},
): LinkItemProps => ({
  id: link.href?.replace(/\//g, '-') || 'home',
  label: link.label,
  href: link.href,
  ...overrides,
});
