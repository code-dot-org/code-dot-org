import {get} from 'js-cookie';

import {DefaultLocale} from '@cdo/generated-scripts/sharedConstants';

export default () => {
  console.log("getting locale", document.querySelector("script#localize-js")?.getAttribute("data-locale"));
  return document.querySelector("script#localize-js")?.getAttribute("data-locale") || get('language_') || DefaultLocale;
};
