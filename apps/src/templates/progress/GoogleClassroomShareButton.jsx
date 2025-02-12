import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/metrics/firehose';
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

    this.onShareStart = this.onShareStart.bind(this);
    this.onShareComplete = this.onShareComplete.bind(this);
    this.logEvent = this.logEvent.bind(this);
  }

  instanceId = componentCount++;
  buttonRef = null;
  state = {
    buttonMounted: false,
  };

  componentDidMount() {
    this.renderButton();
    this.setState({buttonMounted: true});

    // Use unique callback names since we're adding to the global namespace
    window[this.onShareStartName()] = this.onShareStart;
    window[this.onShareCompleteName()] = this.onShareComplete;
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props, prevProps)) {
      this.renderButton();
    }
  }

  onShareStartName() {
    return 'onShareStart_' + this.instanceId;
  }

  onShareCompleteName() {
    return 'onShareComplete_' + this.instanceId;
  }

  onShareStart() {
    this.logEvent('share_started');
  }

  onShareComplete() {
    this.logEvent('share_completed');
  }

  logEvent(event) {
    firehoseClient.putRecord(
      {
        study: 'google-classroom-share-button',
        study_group: 'v0',
        event: event,
        data_json: this.props.analyticsData,
      },
      {includeUserId: true}
    );
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
      onsharestart: `${this.onShareStartName()}`,
      onsharecomplete: `${this.onShareCompleteName()}`,
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
