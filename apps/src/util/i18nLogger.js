function experimentEnabled() {
  return window.location.search.indexOf('i18nLogging') !== -1;
}

export default function localeWithI18nLogger(locale, source) {
  if (!experimentEnabled()) {
    return locale;
  }
  let loggingLocale = {};
  Object.keys(locale).forEach(function(key, index) {
    loggingLocale[key] = function(d) {
      let value = locale[key](d);
      console.log(`source=${source} key=${key} value=${value}`);
      return value;
    };
  });
  return loggingLocale;
}
