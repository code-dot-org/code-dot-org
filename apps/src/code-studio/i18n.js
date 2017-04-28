export default {
  t(...args) {
    if (window.dashboard && window.dashboard.i18n) {
      return window.dashboard.i18n.t(...args);
    } else {
      throw new Error('dashboard i18n has not been loaded yet');
    }
  }
};
