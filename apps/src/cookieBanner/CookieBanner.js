import cookies from 'js-cookie';
import { getTopLevelDomainFromHostname } from '@cdo/apps/code-studio/utils';

window.setupCookieBanner = (cookieName) => {
  var banner = document.getElementById("cookie-banner");
  var topLevelDomain = getTopLevelDomainFromHostname(document.location.hostname);
  const value = cookies.get(cookieName);
  if (!value) {
    banner.style.display = "block";

    banner.onclick = () => {
      cookies.set(cookieName, '1', {expires: 10 * 365, domain: topLevelDomain});
      banner.style.display = "none";
    };
  } else {
    console.log("Cookie already set.");
  }
};
