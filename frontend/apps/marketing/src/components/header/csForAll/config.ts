import logoImage from '@public/images/csforall-logo.webp';

import {CallToActionProps} from './CallToAction';
import {LinkItemProps} from './common/types';
import {createLinkItem} from './common/utils';
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
  CS_IS_EVERYTHING: {
    href: '/cs-is-everything',
    label: 'CS is Everything',
  },
  DONATE: {
    href: 'https://donate.code.org/campaign/708610/donate',
    label: 'Donate',
  },
  GET_INVOLVED: {
    href: '/unlock8/open-letter',
    label: 'Get Involved',
  },
  HOME: {
    href: '/',
    label: 'Home',
  },
  HOUR_OF_AI: {
    href: '/hour-of-ai',
    label: 'Hour of AI',
  },
  INITIATIVES: {
    href: '/initiatives',
    label: 'Initiatives',
  },
  NEWS_AND_RESOURCES: {
    href: '/news',
    label: 'News & Resources',
  },
  PRIVACY_POLICY: {
    href: '/privacy-policy',
    label: 'Privacy Policy',
  },
  STATE_OF_CS_REPORT: {
    href: 'https://advocacy.code.org/stateofcs/',
    label: 'State of CS Report',
  },
  TAKE_ACTION: {
    href: '/take-action',
    label: 'Take Action',
  },
  TEACH_AI: {
    href: 'https://www.teachai.org/',
    label: 'Teach AI',
  },
  UNLOCK8: {
    href: '/unlock8',
    label: 'Unlock8',
  },
  UNLOCK8_PETITION: {
    href: '/unlock8/open-letter',
    label: 'Unlock8 Petition',
  },
} as const;

// Site Logo
export const SITE_LOGO: {logo: SiteLogoProps} = {
  logo: {
    label: 'Go to homepage',
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
    createLinkItem(SHARED_LINKS.INITIATIVES, {typography: 'h4'}),
    createLinkItem(SHARED_LINKS.TAKE_ACTION, {typography: 'h4'}),
    createLinkItem(SHARED_LINKS.HOUR_OF_AI, {typography: 'h4'}),
    // Marketing does not have permission to collect donations yet
    //createLinkItem(SHARED_LINKS.DONATE, {typography: 'h4'}),
    createLinkItem(SHARED_LINKS.NEWS_AND_RESOURCES, {typography: 'h4'}),
  ],
};

// Main Menu Initiatives Dropdown Links
export const INITIATIVES_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    createLinkItem(SHARED_LINKS.UNLOCK8),
    createLinkItem(SHARED_LINKS.CS_IS_EVERYTHING),
    createLinkItem(SHARED_LINKS.TEACH_AI),
  ],
};

// Main Menu Take Action Dropdown Links
export const TAKE_ACTION_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    createLinkItem(SHARED_LINKS.UNLOCK8_PETITION),
    createLinkItem(SHARED_LINKS.STATE_OF_CS_REPORT),
  ],
};

// Main Menu Desktop Configuration
const [initiativesLink, takeActionLink, hourOfAiLink, newsLink] =
  TOP_LEVEL_LINKS.linkList;

export const MAIN_MENU_DESKTOP_ITEMS = [
  {
    type: 'dropdown' as const,
    topLevelLink: initiativesLink,
    dropdownConfig: INITIATIVES_LINKS,
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
  // Marketing does not have permission to collect donations yet
  //{
  //type: 'button' as const,
  //topLevelLink: donateLink,
  //},
  {
    type: 'button' as const,
    topLevelLink: newsLink,
  },
];
