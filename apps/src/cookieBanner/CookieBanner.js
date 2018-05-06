import cookies from 'js-cookie';
import { getRootDomainFromHostname } from '@cdo/apps/code-studio/utils';

window.setupCookieBanner = (cookieName) => {
  var banner = document.getElementById("cookie-banner");
  var rootDomain = getRootDomainFromHostname(document.location.hostname);
  const value = cookies.get(cookieName);
  if (!value) {
    banner.style.display = "block";

    banner.onclick = () => {
      cookies.set(cookieName, '1', {expires: 10 * 365, domain: rootDomain});
      banner.style.display = "none";
    };
  } else {
    console.log("Cookie already set.");
  }
};
