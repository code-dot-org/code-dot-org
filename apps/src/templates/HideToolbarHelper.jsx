import React from 'react';
import msg from '@cdo/locale';
import cookies from 'js-cookie';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import _ from 'lodash';

const styles = {
  closeX: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 13
  }
};

/**
 * An overlay with instrutions on hiding the toolbar for iPhone with iOS 13.
 */
export default class HideToolbarHelper extends React.Component {
  state = {
    showHelper: false
  };

  updateLayout = () => {
    const isiOS13 = navigator.userAgent.indexOf('iPhone OS 13') !== -1;
    const isHideCookieSet = cookies.get('hide_toolbar_helper');
    const isLandscape = window.orientation !== 0;

    // window.innerHeight is smaller than document.body.offsetHeight when
    // the iOS 13 Safari toolbar is showing.  It becomes equal when the toolbar
    // is hidden.  (Interestingly, document.documentElement.clientHeight is
    // the same as document.body.offsetHeight in both cases.)
    const isToolbarShowing = window.innerHeight < document.body.offsetHeight;

    const showHelper =
      isiOS13 && !isHideCookieSet && isLandscape && isToolbarShowing;

    this.setState({showHelper});
  };

  componentDidMount() {
    this.updateLayout();

    this.updateLayoutListener = _.throttle(this.updateLayout, 200);
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

  onClick = () => {
    cookies.set('hide_toolbar_helper', 'true', {expires: 365, path: '/'});
    this.updateLayout();
  };

  render() {
    const forceShowHelper =
      window.location.search.indexOf('force_show_toolbar_helper') !== -1;

    if (this.state.showHelper || forceShowHelper) {
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
