import logoImage from '@public/images/csforall-logo.svg';

import {CallToActionProps} from './CallToAction';
import {LinkItemProps} from './LinkItem';
import {SiteLogoProps} from './SiteLogo';

const SHARED_LINKS = {
  HOME: {
    href: '/',
    label: 'Home',
  },
  HOUR_OF_AI: {
    href: '/hour-of-ai',
    label: 'Hour of AI',
  },
  DONATE: {
    href: '/donate',
    label: 'Donate',
  },
  UNLOCK_8: {
    href: '/unlock-8',
    label: 'Unlock 8',
  },
  ADVOCACY: {
    href: '/advocacy',
    label: 'Advocacy',
  },
  STATE_OF_CS_REPORT: {
    href: '/state-of-cs-report',
    label: 'State of CS Report',
  },
  ADVOCACY_COALITION: {
    href: '/advocacy-coalition',
    label: 'Advocacy Coalition',
  },
  POLICY_AGENDA: {
    href: '/policy-agenda',
    label: 'Policy Agenda',
  },
  UNLOCK8_PETITION: {
    href: '/unlock8-petition',
    label: 'Unlock8 petition',
  },
  CS_ED_CON: {
    href: '/cs-ed-con',
    label: 'CSEdCon',
  },
  ABOUT: {
    href: '/about',
    label: 'About',
  },
  NEWS: {
    href: '/news',
    label: 'News',
  },
  STATS: {
    href: '/stats',
    label: 'Stats',
  },
  GET_INVOLVED: {
    href: '/get-involved',
    label: 'Get Involved',
  },
  ISSUES: {
    href: '/issues',
    label: 'Issues',
  },
  TAKE_ACTION: {
    href: '/take-action',
    label: 'Take Action',
  },
  NEWS_AND_RESOURCES: {
    href: '/news-and-resources',
    label: 'News & Resources',
  },
} as const;

const createLinkItem = (
  link: (typeof SHARED_LINKS)[keyof typeof SHARED_LINKS],
  overrides: Partial<LinkItemProps> = {},
): LinkItemProps => ({
  id: link.href.replace('/', '').replace('/', '-') || 'home',
  label: link.label,
  href: link.href,
  ...overrides,
});

// Site Logo
export const SITE_LOGO: {logo: SiteLogoProps} = {
  logo: {
    label: 'CSforAll',
    href: SHARED_LINKS.HOME.href,
    imgSrc: logoImage.src,
  },
};

// Standalone Call to Action Button
export const CALL_TO_ACTION: {callToAction: CallToActionProps} = {
  callToAction: {
    type: 'emphasized',
    size: 'small',
    text: SHARED_LINKS.GET_INVOLVED.label,
    href: SHARED_LINKS.GET_INVOLVED.href,
  },
};

// Top Level Links
export const TOP_LEVEL_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    createLinkItem(SHARED_LINKS.ISSUES, {typography: 'h4'}),
    createLinkItem(SHARED_LINKS.TAKE_ACTION, {typography: 'h4'}),
    createLinkItem(SHARED_LINKS.HOUR_OF_AI, {typography: 'h4'}),
    createLinkItem(SHARED_LINKS.DONATE, {typography: 'h4'}),
    createLinkItem(SHARED_LINKS.NEWS_AND_RESOURCES, {typography: 'h4'}),
  ],
};

// Main Menu Issues Dropdown Links
export const ISSUES_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [createLinkItem(SHARED_LINKS.UNLOCK_8)],
};

// Main Menu Take Action Dropdown Links
export const TAKE_ACTION_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    createLinkItem(SHARED_LINKS.ADVOCACY),
    createLinkItem(SHARED_LINKS.STATE_OF_CS_REPORT),
    createLinkItem(SHARED_LINKS.ADVOCACY_COALITION),
    createLinkItem(SHARED_LINKS.POLICY_AGENDA),
    createLinkItem(SHARED_LINKS.UNLOCK8_PETITION),
    createLinkItem(SHARED_LINKS.CS_ED_CON),
  ],
};

// Main Menu News & Resources Dropdown Links
export const NEWS_AND_RESOURCES_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    createLinkItem(SHARED_LINKS.ABOUT),
    createLinkItem(SHARED_LINKS.DONATE),
    createLinkItem(SHARED_LINKS.NEWS),
    createLinkItem(SHARED_LINKS.STATS),
  ],
};
