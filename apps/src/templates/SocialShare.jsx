/* global dashboard */

import PropTypes from 'prop-types';

import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '../util/color';
import testImageAccess from '../code-studio/url_test';

export default class SocialShare extends Component {
  static propTypes = {
    facebook: PropTypes.string.isRequired,
    twitter: PropTypes.string.isRequired,
    print: PropTypes.string.isRequired,
    under13: PropTypes.bool
  };

  state = {
    isTwitterAvailable: false,
    isFacebookAvailable: false
  };

  componentDidMount() {
    testImageAccess(
      'https://facebook.com/favicon.ico' + '?' + Math.random(),
      () => this.setState({isFacebookAvailable: true})
    );
    testImageAccess(
      'https://twitter.com/favicon.ico' + '?' + Math.random(),
      () => this.setState({isTwitterAvailable: true})
    );
  }

  render() {
    const {under13} = this.props;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?${
      this.props.facebook
    }`;
    const twitterShareUrl = `https://twitter.com/share?${this.props.twitter}`;

    return (
      <div>
        {!under13 && this.state.isFacebookAvailable && (
          <a
            href={facebookShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dashboard.popupWindow}
          >
            <button
              type="button"
              style={{background: color.facebook_blue, ...styles.shareButton}}
            >
              <i className="fa fa-facebook" />
            </button>
          </a>
        )}
        {!under13 && this.state.isTwitterAvailable && (
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dashboard.popupWindow}
          >
            <button
              type="button"
              style={{background: color.twitter_blue, ...styles.shareButton}}
            >
              <i className="fa fa-twitter" />
            </button>
          </a>
        )}
        <a href={this.props.print}>
          <button
            type="button"
            style={{background: color.charcoal, ...styles.shareButton}}
          >
            <i className="fa fa-print" />
            {' ' + i18n.print()}
          </button>
        </a>
      </div>
    );
  }
}

const styles = {
  shareButton: {
    color: color.white,
    minWidth: 40
  }
};
