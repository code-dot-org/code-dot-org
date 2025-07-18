import * as CookieBanner from '@c15t/react/cookie-banner';

import Button from '@code-dot-org/component-library/button';

const CookieConsentAcceptButton = () => {
  return (
    <CookieBanner.AcceptButton asChild themeKey={'banner.footer.accept-button'}>
      <Button text={'Accept All Cookies'} />
    </CookieBanner.AcceptButton>
  );
};

export default CookieConsentAcceptButton;
