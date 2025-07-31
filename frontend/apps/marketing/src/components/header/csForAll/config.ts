import logoImage from '@public/images/csforall-logo.svg';

import {CallToActionProps} from './CallToAction';
import {LinkItemProps} from './LinkItem';
import {SiteLogoProps} from './SiteLogo';

export const SITE_LOGO: {logo: SiteLogoProps} = {
  logo: {
    label: 'CSforAll',
    href: '/',
    imgSrc: logoImage.src,
  },
};

export const CALL_TO_ACTION: {callToAction: CallToActionProps} = {
  callToAction: {
    type: 'emphasized',
    size: 'small',
    text: 'Get Involved',
    href: '/get-involved',
  },
};

// Main Menu Issues Links
export const ISSUES_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    {
      id: 'unlock-8',
      label: 'Unlock 8',
      href: '/unlock-8',
    },
  ],
};

// Main Menu Take Action Links
export const TAKE_ACTION_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    {
      id: 'advocacy',
      label: 'Advocacy',
      href: '/advocacy',
    },
    {
      id: 'state-of-cs-report',
      label: 'State of CS Report',
      href: '/state-of-cs-report',
    },
    {
      id: 'advocacy-coalition',
      label: 'Advocacy Coalition',
      href: '/advocacy-coalition',
    },
    {
      id: 'policy-agenda',
      label: 'Policy Agenda',
      href: '/policy-agenda',
    },
    {
      id: 'unlock8-petition',
      label: 'Unlock8 petition',
      href: '/unlock8-petition',
    },
    {
      id: 'cs-ed-con',
      label: 'CSEdCon',
      href: '/cs-ed-con',
    },
  ],
};

// Main Menu News & Resources Links
export const NEWS_AND_RESOURCES_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    {
      id: 'about',
      label: 'About',
      href: '/about',
    },
    {
      id: 'donate',
      label: 'Donate',
      href: '/donate',
    },
    {
      id: 'news',
      label: 'News',
      href: '/news',
    },
    {
      id: 'stats',
      label: 'Stats',
      href: '/stats',
    },
  ],
};

// Drawer Links
export const DRAWER_LINKS: {linkList: LinkItemProps[]} = {
  linkList: [
    {id: 'issues', label: 'Issues', href: '/issues', typography: 'h4'},
    {
      id: 'take-action',
      label: 'Take Action',
      href: '/take-action',
      typography: 'h4',
    },
    {
      id: 'hour-of-ai',
      label: 'Hour of AI',
      href: '/hour-of-ai',
      typography: 'h4',
    },
    {
      id: 'donate',
      label: 'Donate',
      href: '/donate',
      typography: 'h4',
    },
    {
      id: 'news-and-resources',
      label: 'News & Resources',
      href: '/news-and-resources',
      typography: 'h4',
    },
  ],
};
