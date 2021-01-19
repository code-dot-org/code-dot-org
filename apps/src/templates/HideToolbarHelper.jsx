import React from 'react';
import msg from '@cdo/locale';
import cookies from 'js-cookie';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import trackEvent from '../util/trackEvent';
import _ from 'lodash';

const styles = {
  closeX: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 13
  }
};

// Note that additional styling can be found in apps/style/HideToolbarHelper.scss.

const HideToolbarHelperCookieName = 'hide_toolbar_helper';

/**
 * An overlay with instrutions on hiding the toolbar for iPhone with iOS 13.
 */
export default class HideToolbarHelper extends React.Component {
  state = {
    showHelper: false
  };

  constructor(props) {
    super(props);

    // Track whether we knew the helper was shown last update, so that if we
    // no longer show it because the toolbar appears to be no longer be showing
    // in particular, we can track the event in analytics, and also write
    // the cookie so that it isn't shown again...
    this.wasHelperShowing = false;

    // ...but only do these things once.
    this.didTrackToolbarHide = false;

    if (window.location.search.indexOf('force_show_toolbar_helper') !== -1) {
      cookies.remove(HideToolbarHelperCookieName, {path: '/'});
    }
  }

  isCompatibleiOS() {
    return (
      navigator.userAgent.indexOf('iPhone OS 13') !== -1 ||
      navigator.userAgent.indexOf('iPhone OS 14') !== -1
    );
  }

  isHideCookieSet() {
    return cookies.get(HideToolbarHelperCookieName);
  }

  isLandscape() {
    return window.orientation !== 0;
  }

  isToolbarShowing() {
    // window.innerHeight is smaller than document.body.offsetHeight when
    // a compatible iOS Safari toolbar is showing.  It becomes equal when the toolbar
    // is hidden.  (Interestingly, document.documentElement.clientHeight is
    // the same as document.body.offsetHeight in both cases.)
    return window.innerHeight < document.body.offsetHeight;
  }

  updateLayout = () => {
    const isCompatibleiOS = this.isCompatibleiOS();
    const isHideCookieSet = this.isHideCookieSet();
    const isLandscape = this.isLandscape();

    if (!isCompatibleiOS || !isLandscape || isHideCookieSet) {
      this.setState({showHelper: false});
      return;
    }

    // We are on a compatible iOS, in landscape, and we haven't hidden due to a cookie.
    // Let's show the helper if we think the toolbar is showing.
    const showHelper = this.isToolbarShowing();

    // If we previously have shown the helper, and aren't now, and it's the
    // first time we've encountered this situation, then do a couple things.
    if (this.wasHelperShowing && !showHelper && !this.didTrackToolbarHide) {
      // Let's track the disapearance of the toolbar after we had previously
      // shown the helper.
      trackEvent('Research', 'HideToolbarHelper', 'hid-' + window.innerHeight);

      // And also set the cookie so this user doesn't see the helper again
      // for a year.
      this.setHideHelperCookie();

      this.didTrackToolbarHide = true;
    }

    this.wasHelperShowing = showHelper;

    this.setState({showHelper});
  };

  componentDidMount() {
    this.updateLayout();

    this.updateLayoutListener = _.throttle(this.updateLayout, 200);
    window.addEventListener('resize', this.updateLayoutListener);
  }

  componentWillUnmount() {
    document.removeEventListener('resize', this.updateLayoutListener, false);
  }

  onClick = () => {
    this.setHideHelperCookie();
    this.updateLayout();

    // Let's track the click-to-dismiss event.
    trackEvent(
      'Research',
      'HideToolbarHelper',
      'click-' + window.innerHeight + '-' + document.body.offsetHeight
    );
  };

  setHideHelperCookie() {
    cookies.set(HideToolbarHelperCookieName, 'true', {expires: 365, path: '/'});
  }

  render() {
    if (this.state.showHelper) {
      return (
        <div className="hide_toolbar_helper" onClick={this.onClick}>
          <SafeMarkdown markdown={msg.hideToolbarHelper()} />
          <i className="fa fa-times" style={styles.closeX} />
        </div>
      );
    } else {
      return null;
    }
  }
}
