// TEMPORARY WORKAROUND, patching studio.code.org from the app. It is here to
// learn whether the site itself should do this; if it should, move it into
// the site and delete this file.
//
// The site sets its Statsig stable ID, which is also the anonymous user ID
// for signed-out progress, as a session cookie, and the WebView forgets
// session cookies when the app's process ends. Each write of it is given a
// year's lifetime here; one that already has a lifetime, such as the site
// removing it without consent, passes unchanged. Each page also renews the
// cookie it finds, so the year counts from the last visit.
//
// Where the cookie exists, consent allowed it, and it carries this device's
// ID: MainActivity.kt derives codeaiStableId from ANDROID_ID, so events and
// anonymous progress keep one ID across updates, reinstalls and resets.
var STABLE_ID_COOKIE = 'statsig_stable_id';
var STABLE_ID_MAX_AGE_S = 365 * 24 * 60 * 60;
var DEVICE_STABLE_ID =
  typeof codeaiStableId === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(codeaiStableId)
    ? codeaiStableId
    : '';
var cookieProperty = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
if (cookieProperty && cookieProperty.set) {
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: function () {
      return cookieProperty.get.call(this);
    },
    set: function (value) {
      var text = String(value);
      if (text.indexOf(STABLE_ID_COOKIE + '=') === 0) {
        var written = text.slice(STABLE_ID_COOKIE.length + 1).split(';')[0];
        // An empty value is a removal, which passes as it is.
        if (DEVICE_STABLE_ID && written && written !== DEVICE_STABLE_ID) {
          text =
            STABLE_ID_COOKIE +
            '=' +
            DEVICE_STABLE_ID +
            text.slice(STABLE_ID_COOKIE.length + 1 + written.length);
        }
        if (!/;\s*(expires|max-age)=/i.test(text)) {
          text += '; max-age=' + STABLE_ID_MAX_AGE_S;
        }
      }
      cookieProperty.set.call(this, text);
    },
  });
}

// Renews only the stable ID cookie's expiry, and gives it the device's value,
// keeping the domain, path and other attributes the site gave it; the
// Cookie Store API reports those, document.cookie does not.
if (window.cookieStore) {
  window.cookieStore
    .get(STABLE_ID_COOKIE)
    .then(function (cookie) {
      if (!cookie) {
        return;
      }
      return window.cookieStore.set({
        name: cookie.name,
        value: DEVICE_STABLE_ID || cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        sameSite: cookie.sameSite,
        partitioned: cookie.partitioned,
        expires: Date.now() + STABLE_ID_MAX_AGE_S * 1000,
      });
    })
    .catch(function () {});
}
