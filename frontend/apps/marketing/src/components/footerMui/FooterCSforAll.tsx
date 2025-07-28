import Linkedin from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';

import FooterMui, {FooterProps} from '@/components/footerMui';

export const defaultProps: FooterProps = {
  siteLinks: [
    {key: 'home', label: 'Home', href: '/'},
    {key: 'about', label: 'About', href: '/about'},
  ],
  socialLinks: [
    {
      key: 'twitter',
      label: 'Twitter',
      href: 'https://twitter.com/codeorg',
      icon: <XIcon />,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      href: 'https://facebook.com/codeorg',
      icon: <Linkedin />,
    },
  ],
  copyright: 'All rights reserved',
};

const FooterCSforAll: React.FC<FooterProps> = () => {
  return <FooterMui {...defaultProps} />;
};

export default FooterCSforAll;
