import DSCOFooter, {
  FooterProps,
} from '@code-dot-org/component-library/cms/footer';

import awsLogo from '@public/images/powered-by-aws.png';

const copyrightYear = new Date().getFullYear();

export const defaultProps: FooterProps = {
  copyright: `© Code.org, ${copyrightYear}. Code.org, the CODE logo, Hour of Code and CS Discoveries are trademarks of Code.org.\nBuilt on GitHub from Microsoft`,
  siteLinks: [
    {
      key: 'privacyPolicy',
      label: 'Privacy Policy',
      href: '/privacy',
    },
    {
      key: 'manageCookies',
      label: 'Manage Cookies',
      href: '/cookies',
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
  ],
  socialLinks: [
    {
      key: 'facebook',
      label: 'Facebook',
      href: 'https://www.facebook.com/Code.org/',
      icon: {iconFamily: 'brands', iconName: 'facebook'},
    },
    {
      key: 'xTwitter',
      label: 'X Twitter',
      href: 'https://twitter.com/codeorg',
      icon: {iconFamily: 'brands', iconName: 'x-twitter'},
    },
    {
      key: 'instagram',
      label: 'Instagram',
      href: 'https://www.instagram.com/codeorg/',
      icon: {iconFamily: 'brands', iconName: 'instagram'},
    },
    {
      key: 'medium',
      label: 'Medium',
      href: 'https://medium.com/@codeorg',
      icon: {iconFamily: 'brands', iconName: 'medium'},
    },
  ],
  imageLinks: [
    {
      key: 'poweredByAWS',
      label: 'Powered by AWS Cloud Computing',
      href: 'https://aws.amazon.com/what-is-cloud-computing',
      image: {
        src: awsLogo.src,
      },
    },
  ],
};

const Footer: React.FC = () => <DSCOFooter {...defaultProps} />;

export default Footer;
