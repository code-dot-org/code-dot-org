'use client';

import * as CookieBanner from '@c15t/react/cookie-banner';

import Link from '@code-dot-org/component-library/link';

import CookieConsentAcceptButton from '@/components/cookieConsent/CookieConsentButton';
import Button from '@code-dot-org/component-library/button';

const CookieConsentBanner = () => {
  return (
    <CookieBanner.Root>
      <CookieBanner.Card>
        <CookieBanner.Header>
          <CookieBanner.Title>Our use of cookies</CookieBanner.Title>
          <CookieBanner.Description>
            <p>
              Click the "Cookies Settings" button to review the default cookie
              settings for this site and/or set your own cookie preferences.
            </p>
            <Link text={'Cookie Notice'} href={'/cookies'} />
          </CookieBanner.Description>
        </CookieBanner.Header>
        <CookieBanner.Footer>
          <CookieBanner.FooterSubGroup>
            <CookieBanner.RejectButton
              themeKey={'banner.footer.reject-button'}
              asChild
            >
              <Button text={'Reject All'} type={'secondary'} />
            </CookieBanner.RejectButton>
            <CookieBanner.CustomizeButton
              themeKey={'banner.footer.customize-button'}
              asChild
            >
              <Button text={'Preferences'} type={'tertiary'} />
            </CookieBanner.CustomizeButton>
          </CookieBanner.FooterSubGroup>
          <CookieBanner.AcceptButton
            asChild
            themeKey={'banner.footer.accept-button'}
          >
            <Button text={'Accept All '} />
          </CookieBanner.AcceptButton>
        </CookieBanner.Footer>
      </CookieBanner.Card>
    </CookieBanner.Root>
  );
};

export default CookieConsentBanner;
