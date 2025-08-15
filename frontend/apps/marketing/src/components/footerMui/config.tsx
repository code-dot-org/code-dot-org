import Linkedin from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';

// Copyright text
export const COPYRIGHT_TEXT = 'All rights reserved';

// Main site links
export const SITE_LINKS = [
  {key: 'initiatives', label: 'Initiatives', href: '/initiatives'},
  {key: 'take-action', label: 'Take Action', href: '/take-action'},
  {key: 'hour-of-ai', label: 'Hour of AI', href: '/hour-of-ai'},
  // Marketing does not have permission to collect donations yet
  //{ key: 'donate', label: 'Donate', href: 'https://donate.code.org/campaign/708610/donate',},
  {
    key: 'news-and-resources',
    label: 'News & Resources',
    href: '/news',
  },
  {key: 'privacy-policy', label: 'Privacy Policy', href: '/privacy-policy'},
];

// Social media links
export const SOCIAL_LINKS = [
  {
    key: 'x-twitter',
    label: 'X',
    href: 'https://x.com/csforall',
    icon: <XIcon />,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/csforall',
    icon: <Linkedin />,
  },
];
