import logoImage from '@public/images/csforall-logo.svg';

import {CallToActionProps} from './CallToAction';
import {LinkItemProps} from './LinkItem';
import {SiteLogoProps} from './SiteLogo';

const SHARED_LINKS = {
  ABOUT: {
    href: '/about',
    label: 'About',
  },
  ADVOCACY: {
    href: '/advocacy',
    label: 'Advocacy',
  },
  AI_LITERACY: {
    href: '/ai-literacy',
    label: 'AI Literacy',
  },
  CS_ED_CON: {
    href: '/cs-ed-con',
    label: 'CSEdCon',
  },
  DONATE: {
    href: '/donate',
    label: 'Donate',
  },
  GENDER_GAP: {
    href: '/gender-gap',
    label: 'Gender Gap',
  },
  GET_INVOLVED: {
    href: '/get-involved',
    label: 'Get Involved',
  },
  GRAD_REQUIREMENTS: {
    href: '/grad-requirements',
    label: 'Grad Requirements',
  },
  HOME: {
    href: '/',
    label: 'Home',
  },
  HOUR_OF_AI: {
    href: '/hour-of-ai',
    label: 'Hour of AI',
  },
  ISSUES: {
    href: '/issues',
    label: 'Issues',
  },
  NEWS: {
    href: '/news',
    label: 'News',
  },
  NEWS_AND_RESOURCES: {
    href: '/news-and-resources',
    label: 'News & Resources',
  },
  STATE_OF_CS_REPORT: {
    href: '/state-of-cs-report',
    label: 'State of CS Report',
  },
  TAKE_ACTION: {
    href: '/take-action',
    label: 'Take Action',
  },
  UNLOCK8_PETITION: {
    href: '/unlock8-petition',
    label: 'Unlock8 Petition',
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

// Top Level Links used in Main Menu Desktop and Drawer
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
  linkList: [
    createLinkItem(SHARED_LINKS.GENDER_GAP),
    createLinkItem(SHARED_LINKS.GRAD_REQUIREMENTS),
    createLinkItem(SHARED_LINKS.AI_LITERACY),
  ],
};

// Main Menu Take Action Dropdown Links
export const TAKE_ACTION_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    createLinkItem(SHARED_LINKS.UNLOCK8_PETITION),
    createLinkItem(SHARED_LINKS.CS_ED_CON),
    createLinkItem(SHARED_LINKS.ADVOCACY),
    createLinkItem(SHARED_LINKS.STATE_OF_CS_REPORT),
  ],
};

// Main Menu News & Resources Dropdown Links
export const NEWS_AND_RESOURCES_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    createLinkItem(SHARED_LINKS.ABOUT),
    createLinkItem(SHARED_LINKS.NEWS),
  ],
};

// Main Menu Desktop Configuration
const [issuesLink, takeActionLink, hourOfAiLink, donateLink, newsLink] =
  TOP_LEVEL_LINKS.linkList;

export const MAIN_MENU_DESKTOP_ITEMS = [
  {
    type: 'dropdown' as const,
    topLevelLink: issuesLink,
    dropdownConfig: ISSUES_LINKS,
  },
  {
    type: 'dropdown' as const,
    topLevelLink: takeActionLink,
    dropdownConfig: TAKE_ACTION_LINKS,
  },
  {
    type: 'button' as const,
    topLevelLink: hourOfAiLink,
  },
  {
    type: 'button' as const,
    topLevelLink: donateLink,
  },
  {
    type: 'dropdown' as const,
    topLevelLink: newsLink,
    dropdownConfig: NEWS_AND_RESOURCES_LINKS,
  },
];
