import logoImage from '@public/images/csforall-logo.svg';

import {CallToActionProps} from './CallToAction';
import {LinkItem} from './LinkList';
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

// Desktop Main Links
export const DESKTOP_LINKS: {linkList: LinkItem[]} = {
  linkList: [
    {key: 'issues', label: 'Issues', href: '/issues', typography: 'body3'},
    {
      key: 'take-action',
      label: 'Take Action',
      href: '/take-action',
      typography: 'body3',
    },
    {
      key: 'hour-of-ai',
      label: 'Hour of AI',
      href: '/hour-of-ai',
      typography: 'body3',
    },
    {
      key: 'donate',
      label: 'Donate',
      href: '/donate',
      typography: 'body3',
    },
    {
      key: 'news-and-resources',
      label: 'News & Resources',
      href: '/news-and-resources',
      typography: 'body3',
    },
  ],
};

// Drawer Links
export const DRAWER_LINKS: {linkList: LinkItem[]} = {
  linkList: [
    {key: 'issues', label: 'Issues', href: '/issues', typography: 'h4'},
    {
      key: 'take-action',
      label: 'Take Action',
      href: '/take-action',
      typography: 'h4',
    },
    {
      key: 'hour-of-ai',
      label: 'Hour of AI',
      href: '/hour-of-ai',
      typography: 'h4',
    },
    {
      key: 'donate',
      label: 'Donate',
      href: '/donate',
      typography: 'h4',
    },
    {
      key: 'news-and-resources',
      label: 'News & Resources',
      href: '/news-and-resources',
      typography: 'h4',
    },
  ],
};
