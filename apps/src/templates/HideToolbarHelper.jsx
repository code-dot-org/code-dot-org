import React from 'react';
import cookies from 'js-cookie';
import _ from 'lodash';

/**
 * An overlay with instrutions on hiding the toolbar for iPhone with iOS 13.
 */
export default class HideToolbarHelper extends React.Component {
  state = {
    isLandscape: false
  };

  updateOrientation = () => {
    this.setState({isLandscape: window.orientation !== 0});
  };

  componentDidMount() {
    this.updateOrientation();

    this.orientationListener = _.throttle(this.updateOrientation, 200);
    window.addEventListener('orientationchange', this.orientationListener);
    window.addEventListener('resize', this.orientationListener);
  }

  componentWillUnmount() {
    document.removeEventListener(
      'orientationchange',
      this.orientationListener,
      false
    );
    document.removeEventListener('resize', this.orientationListener, false);
  }

  render() {
    const isiOS13 = navigator.userAgent.indexOf('iPhone OS 13') !== -1;
    const isHideCookieSet = cookies.get('hide_toolbar_helper');
    const isToolbarShowing = window.innerHeight < document.body.offsetHeight;

    if (
      isiOS13 &&
      !isHideCookieSet &&
      this.state.isLandscape &&
      isToolbarShowing
    ) {
      return (
        <div className="hide_toolbar_helper">
          Press AA and choose Hide Toolbar for more space. }
        </div>
      );
    } else {
      return null;
    }
  }
}
