'use client';
import {Brand} from '@/config/brand';
import {SUPPORTED_LOCALES_CONFIG} from '@/config/locale';

import {GlobalFooterProps} from '../common/types';
import {useFooterLocalization} from '../common/utils';
import FooterMui, {FooterProps} from '../footerMui';

import {
  COPYRIGHT_TEXT_CORPORATE_SITE,
  IMAGE_LINK_CORPORATE_SITE,
  SITE_LINKS_CORPORATE_SITE,
  SOCIAL_LINKS_CORPORATE_SITE,
} from './config';

export const defaultProps: Omit<FooterProps, 'languages' | 'onLanguageChange'> =
  {
    brand: Brand.CODE_DOT_ORG,
    siteLinks: SITE_LINKS_CORPORATE_SITE,
    socialLinks: SOCIAL_LINKS_CORPORATE_SITE,
    copyright: COPYRIGHT_TEXT_CORPORATE_SITE,
  };

const FooterCSforAll = ({locale}: GlobalFooterProps) => {
  const {handleLanguageChange} = useFooterLocalization();

  return (
    <FooterMui
      {...defaultProps}
      onLanguageChange={handleLanguageChange}
      selectedLocaleCode={locale}
      languages={SUPPORTED_LOCALES_CONFIG}
      imageLink={IMAGE_LINK_CORPORATE_SITE}
    />
  );
};

export default FooterCSforAll;
