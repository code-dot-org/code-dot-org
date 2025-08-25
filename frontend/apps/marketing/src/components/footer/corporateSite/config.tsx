import Icon from '@mui/material/Icon';

import awsLogo from '@public/images/powered-by-aws.webp';

const copyrightYear = new Date().getFullYear();

// Copyright text
export const COPYRIGHT_TEXT_CORPORATE_SITE = {
  value: `© Code.org, ${copyrightYear}. Code.org, the CODE logo, Hour of Code and CS Discoveries are trademarks of Code.org. Built on GitHub from Microsoft.`,
  showIcon: false,
};

// Site links
export const SITE_LINKS_CORPORATE_SITE = [
  {
    key: 'privacyPolicy',
    label: 'Privacy Policy',
    href: '/privacy',
  },
  {
    key: 'manageCookies',
    label: 'Manage Cookies',
    href: '/cookies',
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (window?.OneTrust) {
        e.preventDefault();
        // Displays the OneTrust cookie dialog
        window.OneTrust.ToggleInfoDisplay();
      }
    },
  },
  {
    key: 'about',
    label: 'About',
    href: '/about',
  },
  {
    key: 'partners',
    label: 'Partners',
    href: '/partners',
  },
  {
    key: 'blog',
    label: 'Blog',
    href: 'https://medium.com/@codeorg',
  },
  {
    key: 'donate',
    label: 'Donate',
    href: '/donate',
  },
  {
    key: 'store',
    label: 'Store',
    href: 'https://store.code.org/',
  },
  {
    key: 'support',
    label: 'Support',
    href: 'https://support.code.org/',
  },
  {
    key: 'terms',
    label: 'Terms',
    href: '/tos',
  },
];

// Social media links
export const SOCIAL_LINKS_CORPORATE_SITE = [
  {
    key: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/Code.org/',
    icon: <Icon baseClassName="fa-brands" className="fa-facebook" />,
  },
  {
    key: 'x-twitter',
    label: 'X',
    href: 'https://x.com/codeorg',
    icon: <Icon baseClassName="fa-brands" className="fa-x-twitter" />,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/codeorg/',
    icon: <Icon baseClassName="fa-brands" className="fa-instagram" />,
  },
  {
    key: 'medium',
    label: 'Medium',
    href: 'https://medium.com/@codeorg',
    icon: <Icon baseClassName="fa-brands" className="fa-medium" />,
  },
];

// Image link
export const IMAGE_LINK_CORPORATE_SITE = {
  imageSrc: awsLogo.src,
  label: 'Powered by AWS Cloud Computing',
  href: 'https://aws.amazon.com/what-is-cloud-computing',
  isLinkExternal: true,
};
