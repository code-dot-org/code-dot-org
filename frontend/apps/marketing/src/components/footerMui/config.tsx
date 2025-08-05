import Linkedin from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';

// Copyright text
export const COPYRIGHT_TEXT = 'All rights reserved';

// Main site links
export const SITE_LINKS = [
  {key: 'issues', label: 'Issues', href: '/issues'},
  {key: 'take-action', label: 'Take Action', href: '/take-action'},
  {key: 'hour-of-ai', label: 'Hour of AI', href: '/hour-of-ai'},
  {
    key: 'donate',
    label: 'Donate',
    href: 'https://donate.code.org/campaign/708610/donate',
  },
  {
    key: 'news-and-resources',
    label: 'News & Resources',
    href: '/news-and-resources',
  },
  {key: 'privacy-policy', label: 'Privacy Policy', href: '/privacy-policy'},
];

// Social media links
export const SOCIAL_LINKS = [
  {
    key: 'x-twitter',
    label: 'X',
    href: 'https://x.com/codeorg',
    icon: <XIcon />,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/code-org',
    icon: <Linkedin />,
  },
];
