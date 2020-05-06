/* global navigator */
import React from 'react';
import msg from '@cdo/locale';
import cookies from 'js-cookie';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import trackEvent from '../util/trackEvent';
import _ from 'lodash';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

const styles = {
  closeX: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 13,
    lineHeight: 0,
    boxShadow: 'unset',
    borderWidth: 0,
    backgroundColor: 'unset',
    paddingRight: 0,
    color: color.black,
    ':hover': {
      boxShadow: 'unset',
      backgroundColor: 'unset'
    }
  }
};

// Note that additional styling can be found in apps/style/HideToolbarHelper.scss.

const HideToolbarHelperCookieName = 'hide_toolbar_helper';

/**
 * An overlay with instrutions on hiding the toolbar for iPhone with iOS 13.
 */
export default class HideToolbarHelper extends React.Component {
  state = {
    shouldShowHelper: false
  };

  constructor(props) {
    super(props);

    // Track whether we knew the helper was shown last update, so that if we
    // no longer show it because the toolbar appears to be no longer be showing
    // in particular, we can track the event in analytics, and also write
    // the cookie so that it isn't shown again...
    this.wasHelperShowing = false;

    this.forceShowHelper = false;
    if (window.location.search.indexOf('force_show_toolbar_helper') !== -1) {
      cookies.remove(HideToolbarHelperCookieName, {path: '/'});
      this.forceShowHelper = true;
    }
  }

  isiOS13() {
    return navigator.userAgent.indexOf('iPhone OS 13') !== -1;
  }

  isHideCookieSet() {
    return cookies.get(HideToolbarHelperCookieName);
  }

  isLandscape() {
    return window.orientation !== 0;
  }

  isToolbarShowing() {
    // window.innerHeight is smaller than document.body.offsetHeight when
    // the iOS 13 Safari toolbar is showing.  It becomes equal when the toolbar
    // is hidden.  (Interestingly, document.documentElement.clientHeight is
    // the same as document.body.offsetHeight in both cases.)
    return window.innerHeight < document.body.offsetHeight;
  }

  updateLayout = () => {
    const isiOS13 = this.isiOS13();
    const isHideCookieSet = this.isHideCookieSet();
    const isLandscape = this.isLandscape();

    // Check if our environment is in a state where showing the helper would be
    // useful. i.e. we are on iOS 13 (or have used the override), are in
    // landscape, and we haven't hidden due to a cookie
    if (
      !((this.forceShowHelper || isiOS13) && isLandscape && !isHideCookieSet)
    ) {
      this.setState({shouldShowHelper: false});
      return;
    }

    // Let's show the helper if we think the toolbar is showing.
    const shouldShowHelper = this.isToolbarShowing() || this.forceShowHelper;

    // If we previously have shown the helper, and aren't now, and it's the
    // first time we've encountered this situation, then do a couple things.
    if (this.wasHelperShowing && !shouldShowHelper) {
      // Let's track the disapearance of the toolbar after we had previously
      // shown the helper.
      trackEvent('Research', 'HideToolbarHelper', 'hid-' + window.innerHeight);

      // And also set the cookie so this user doesn't see the helper again
      // for a year.
      this.setHideHelperCookie();
    }

    this.wasHelperShowing = shouldShowHelper;
    this.setState({shouldShowHelper});
  };

  componentDidMount() {
    this.updateLayout();

    this.updateLayoutListener = _.throttle(this.updateLayout, 1000);
    window.addEventListener('orientationchange', this.updateLayoutListener);

    /* These two events catch all viewport changes. */
    window.addEventListener('resize', this.updateLayoutListener);
    window.addEventListener('scroll', this.updateLayoutListener);
  }

  componentWillUnmount() {
    document.removeEventListener(
      'orientationchange',
      this.updateLayoutListener,
      false
    );
    document.removeEventListener('resize', this.updateLayoutListener, false);
    document.removeEventListener('scroll', this.updateLayoutListener, false);
  }

  dismissCallout = () => {
    this.setHideHelperCookie();
    this.setState({shouldShowHelper: false});

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
    if (this.state.shouldShowHelper) {
      return (
        <div className="hide_toolbar_helper" onClick={this.dismissCallout}>
          <SafeMarkdown markdown={msg.hideToolbarHelper()} />
          <Button
            style={styles.closeX}
            onClick={this.dismissCallout}
            icon={'times'}
            color={Button.ButtonColor.white}
            // Elements that display over minecraft can't use <button> right now
            // unless they want minecraft styling due to the use of !important
            // in the minecraft stylesheet.
            __useDeprecatedTag
          />
        </div>
      );
    } else {
      return null;
    }
  }
}
