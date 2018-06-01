import cookies from 'js-cookie';
import { getRootDomainFromHostname } from '@cdo/apps/code-studio/utils';

// Note that on the code.org homepage, jQuery is not yet available, since its
// load is deferred.

window.setupCookieBanner = (environment) => {
  const cookieName = '_cookieBanner' +
    (environment === 'production' ? '' : ('_' + environment));
  const banner = document.getElementById("cookie-banner");
  const bannerButton = document.getElementById("accept-cookies");
  const rootDomain = getRootDomainFromHostname(document.location.hostname);
  const userHasDismissedBanner = cookies.get(cookieName);

  // Only show the cookie banner on test environment if there is a special
  // URL parameter, which will be used for UI testing.
  const hideCookieBanner =
    environment === 'test' &&
    window.location.search.indexOf("show_cookie_banner_on_test") === -1;

  if (!userHasDismissedBanner && !hideCookieBanner) {
    banner.style.display = "block";

    bannerButton.onclick = () => {
      cookies.set(cookieName, '1', {expires: 10 * 365, domain: rootDomain});
      banner.style.display = "none";
    };
  }
};
