'use client';
import Linkedin from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import {usePathname, useRouter} from 'next/navigation';

import FooterMui, {FooterProps} from '@/components/footerMui';
import {LOCALIZE_JS_CONFIG_MAP} from '@/config/locale';

export const defaultProps: Omit<FooterProps, 'languages' | 'onLanguageChange'> =
  {
    // TODO - Update these links to point to the correct CSforAll pages
    siteLinks: [
      {key: 'issues', label: 'Issues', href: '/'},
      {key: 'take-action', label: 'Take Action', href: '/'},
      {key: 'hour-of-ai', label: 'Hour of AI', href: '/'},
      {key: 'donate', label: 'Donate', href: 'https://donate.code.org'},
      {key: 'news-and-resources', label: 'News & Resources', href: '/'},
      {key: 'privacy-policy', label: 'Privacy Policy', href: '/'},
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

interface GlobalFooterProps {
  locale: string;
}

const FooterCSforAll = ({locale}: GlobalFooterProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleLanguageChange = (localeCode: string) => {
    const newPathName = pathname.replace(
      /^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/,
      `/${localeCode}`,
    );

    router.push(newPathName);
    Localize.setLanguage(localeCode);
  };
  return (
    <FooterMui
      {...defaultProps}
      onLanguageChange={handleLanguageChange}
      selectedLocaleCode={locale}
      languages={LOCALIZE_JS_CONFIG_MAP}
    />
  );
};

export default FooterCSforAll;
