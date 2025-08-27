'use client';
import {Brand} from '@/config/brand';
import {LOCALIZE_JS_CONFIG_MAP} from '@/config/locale';

import {GlobalFooterProps} from '../common/types';
import {useFooterLocalization} from '../common/utils';
import FooterMui, {FooterProps} from '../footerMui';

import {
  COPYRIGHT_TEXT_CSFORALL,
  SITE_LINKS_CSFORALL,
  SOCIAL_LINKS_CSFORALL,
} from './config';

export const defaultProps: Omit<FooterProps, 'languages' | 'onLanguageChange'> =
  {
    brand: Brand.CS_FOR_ALL,
    siteLinks: SITE_LINKS_CSFORALL,
    socialLinks: SOCIAL_LINKS_CSFORALL,
    copyright: COPYRIGHT_TEXT_CSFORALL,
  };

const FooterCSforAll = ({locale}: GlobalFooterProps) => {
  const {handleLanguageChange} = useFooterLocalization();

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
