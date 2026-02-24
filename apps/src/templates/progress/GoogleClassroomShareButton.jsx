import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

// used to give each instance a unique id to use for callback names
let componentCount = 0;

export default class GoogleClassroomShareButton extends React.PureComponent {
  static propTypes = {
    url: PropTypes.string.isRequired,
    itemtype: PropTypes.string.isRequired,
    title: PropTypes.string,
    theme: PropTypes.string,
    height: PropTypes.number,
    courseid: PropTypes.number,
    analyticsData: PropTypes.string,
  };

  static defaultProps = {
    itemtype: 'assignment',
    theme: 'light',
    height: Button.ButtonHeight.default,
  };

  constructor(props) {
    super(props);
  }

  instanceId = componentCount++;
  buttonRef = null;
  state = {
    buttonMounted: false,
  };

  componentDidMount() {
    this.renderButton();
    this.setState({buttonMounted: true});
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props, prevProps)) {
      this.renderButton();
    }
  }

  // https://developers.google.com/classroom/guides/sharebutton
  renderButton() {
    window.gapi.sharetoclassroom.render(this.buttonRef, {
      theme: this.props.theme,
      url: this.props.url,
      itemtype: this.props.itemtype,
      title: this.props.title,
      size: this.props.height,
      courseid: this.props.courseid,
    });
  }

  render() {
    return (
      <span style={styles.container}>
        <span ref={elem => (this.buttonRef = elem)} />
        {this.state.buttonMounted && (
          <span style={styles.label}>{i18n.shareToGoogleClassroom()}</span>
        )}
      </span>
    );
  }
}

// https://developers.google.com/classroom/brand
const styles = {
  label: {
    paddingLeft: 16,
    textAlign: 'left',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'start',
  },
};
