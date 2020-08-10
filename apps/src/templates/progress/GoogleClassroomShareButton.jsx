import PropTypes from 'prop-types';
import React from 'react';

// https://developers.google.com/classroom/brand
const styles = {
  container: {
    display: 'flex',
    listStyle: 'none'
  },
  button: {
    padding: '8px 16px'
  },
  label: {
    paddingLeft: 16,
    fontFamily: 'Roboto',
    fontWeight: 700
  }
};
class GoogleClassroomShareButton extends React.Component {
  static propTypes = {
    buttonId: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    itemtype: PropTypes.string.isRequired,
    title: PropTypes.string
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

  loadApi() {
    if (!document.getElementById('gapi')) {
      window.___gcfg = {
        parsetags: 'explicit'
      };

      const gapi = document.createElement('script');
      gapi.src = 'https://apis.google.com/js/platform.js';
      gapi.id = 'gapi';
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

  gapiReady = () =>
    window.gapi && typeof window.gapi.sharetoclassroom !== 'undefined';

  renderButton() {
    window.gapi.sharetoclassroom.render(this.props.buttonId, {
      url: this.props.url,
      itemtype: this.props.itemtype,
      title: this.props.title
    });
  }

  render() {
    return (
      <ul style={styles.container}>
        <li>
          <div id={this.props.buttonId} style={styles.button} />
        </li>
        <li>
          <p style={styles.label}>Google Classroom</p>
        </li>
      </ul>
    );
  }
}

GoogleClassroomShareButton.defaultProps = {
  itemtype: 'assignment'
};

export default GoogleClassroomShareButton;
