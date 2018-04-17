import testImageAccess from '../code-studio/url_test';
import trackEvent from '../util/trackEvent';
import _ from 'lodash';

export async function measureVideoConnectivity() {
  const providers = {
    "vc": "https://videos.code.org/retrieval-test.ico",
    "yt": "https://www.youtube.com/favicon.ico",
    "yc": "https://www.youtube-nocookie.com/favicon.ico",
    "pn": "https://code.hosted.panopto.com/Panopto/Styles/Less/Application/Images/Header/panopto_logo_20px.png"
  };

  await Promise.all(
    Object.keys(providers).map(key => {
      return new Promise(function (resolve, reject) {
        testImageAccess(
          providers[key] + "?" + Math.random(),
          resolve.bind(this, key),
          resolve.bind(this, null)
        );
      });
    })
  ).then(values => {
    const filteredValues = values.filter(n => n);   // Remove null entries.
    const sortedValues = _.sortBy(filteredValues);
    const comboString = sortedValues.join("-");
    trackEvent("Research", "VideoSiteAccessibility", comboString);
  });
}
