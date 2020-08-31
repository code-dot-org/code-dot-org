import PropTypes from 'prop-types';
import React from 'react';
import Button from '../Button';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';

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

export default class GoogleClassroomShareButton extends React.Component {
  static propTypes = {
    buttonId: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    itemtype: PropTypes.string.isRequired,
    title: PropTypes.string,
    height: PropTypes.number,
    courseid: PropTypes.number,
    analyticsData: PropTypes.object
  };

  static defaultProps = {
    itemtype: 'assignment',
    height: Button.ButtonHeight.default
  };

  /*
   * The button doesn't render immediately, so we use its resize event to
   * detect when it's rendered and wait to display the label until then.
   */
  constructor(props) {
    super(props);
    this.onButtonResize = this.onButtonResize.bind(this);
    this.resizeObserver = new ResizeObserver(this.onButtonResize);

    this.onShareStart = this.onShareStart.bind(this);
    this.onShareComplete = this.onShareComplete.bind(this);
    this.logEvent = this.logEvent.bind(this);
  }

  buttonRef = null;
  state = {
    buttonRendered: false
  };

  componentDidMount() {
    this.renderButton();
    this.resizeObserver.observe(this.buttonRef);

    // Use unique callback names since we're adding to the global namespace
    window[this.onShareStartName()] = this.onShareStart;
    window[this.onShareCompleteName()] = this.onShareComplete;
  }

  onButtonResize() {
    this.setState({buttonRendered: true});
    this.resizeObserver.disconnect();
  }

  onShareStartName() {
    return 'onShareStart_' + this.props.buttonId;
  }

  onShareCompleteName() {
    return 'onShareComplete_' + this.props.buttonId;
  }

  onShareStart() {
    this.logEvent('share_started');
  }

  onShareComplete() {
    this.logEvent('share_completed');
  }

  logEvent(event) {
    firehoseClient.putRecord({
      study: 'google-classroom-share-button',
      study_group: 'v0',
      event: event,
      data_json: JSON.stringify(this.props.analyticsData)
    });
  }

  // https://developers.google.com/classroom/guides/sharebutton
  renderButton() {
    window.gapi.sharetoclassroom.render(this.props.buttonId, {
      theme: 'light',
      url: this.props.url,
      itemtype: this.props.itemtype,
      title: this.props.title,
      size: this.props.height,
      courseid: this.props.courseid,
      onsharestart: `${this.onShareStartName()}`,
      onsharecomplete: `${this.onShareCompleteName()}`
    });
  }

  render() {
    return (
      <span style={styles.container}>
        <span id={this.props.buttonId} ref={elem => (this.buttonRef = elem)} />
        {this.state.buttonRendered && (
          <span style={styles.label}>{i18n.shareToGoogleClassroom()}</span>
        )}
      </span>
    );
  }
}
