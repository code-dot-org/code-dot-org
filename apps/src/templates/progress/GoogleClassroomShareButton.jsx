import PropTypes from 'prop-types';
import React from 'react';
import Button from '../Button';
import i18n from '@cdo/locale';

// https://developers.google.com/classroom/brand
const styles = {
  label: {
    paddingLeft: 16,
    textAlign: 'left'
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'start'
  }
};

const GooglePlatformApiId = 'GooglePlatformApiId';

class GoogleClassroomShareButton extends React.Component {
  static propTypes = {
    buttonId: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    itemtype: PropTypes.string.isRequired,
    title: PropTypes.string,
    height: PropTypes.number,
    courseid: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.loadApi = this.loadApi.bind(this);
    this.waitForGapi = this.waitForGapi.bind(this);
    this.renderButton = this.renderButton.bind(this);
  }

  componentDidMount() {
    if (this.gapiReady()) {
      this.renderButton();
    } else {
      this.loadApi();
    }
  }

  /* The Google Classroom Share Button is only available through their js api,
   * so we have to add it to the page on load. Each instance of this
   * component will wait until the api is ready before rendering the button,
   * but only the first will kick of the loading process.
   */
  loadApi() {
    if (!document.getElementById(GooglePlatformApiId)) {
      window.___gcfg = {
        parsetags: 'explicit'
      };

      const gapi = document.createElement('script');
      gapi.src = 'https://apis.google.com/js/platform.js';
      gapi.id = GooglePlatformApiId;
      gapi.addEventListener('load', this.waitForGapi);
      document.body.appendChild(gapi);
    } else {
      this.waitForGapi();
    }
  }

  waitForGapi() {
    if (this.gapiReady()) {
      this.renderButton();
    } else {
      setTimeout(() => {
        this.waitForGapi();
      }, 100);
    }
  }

  gapiReady() {
    return !!window.gapi && typeof window.gapi.sharetoclassroom !== 'undefined';
  }

  // https://developers.google.com/classroom/guides/sharebutton
  renderButton() {
    window.gapi.sharetoclassroom.render(this.props.buttonId, {
      theme: 'light',
      url: this.props.url,
      itemtype: this.props.itemtype,
      title: this.props.title,
      size: this.props.height,
      courseid: this.props.courseid
    });
  }

  render() {
    return (
      <span style={styles.container}>
        <span id={this.props.buttonId} />
        <span style={styles.label}>{i18n.shareToGoogleClassroom()}</span>
      </span>
    );
  }
}

GoogleClassroomShareButton.defaultProps = {
  itemtype: 'assignment',
  height: Button.ButtonHeight.default
};

export default GoogleClassroomShareButton;
