import React, { PropTypes } from 'react';
import Radium from 'radium';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ProgressButton from "./progress/ProgressButton";
import trackEvent from '../util/trackEvent';

const NotificationType = {
  information: 'information',
  success: 'success',
  failure: 'failure',
  warning: 'warning',
  bullhorn: 'bullhorn'
};

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 3,
    height: 100,
    backgroundColor: color.white,
    marginTop: 20,
    marginBottom: 20
  },
  notice: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.2,
    marginTop: 16,
    backgroundColor: color.white,
  },
  details: {
    fontFamily: 'Gotham-Book',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 16,
    color: color.charcoal,
  },
  wordBox: {
    width: 'calc(100% - 320px)',
    marginLeft: 25,
    float: 'left'
  },
  dismiss: {
    color: color.lighter_gray,
    float: 'right',
    marginTop: 16,
    marginRight: 14
  },
  iconBox: {
    width: 100,
    height: 100,
    backgroundColor: color.lightest_gray,
    float: 'left',
    textAlign: 'center'
  },
  icon: {
    color: color.white,
    fontSize: 48,
    lineHeight: 2
  },
  button: {
    float: 'left',
    marginLeft: 50,
    marginTop: 33
  },
  colors: {
    [NotificationType.information]: {
      borderColor: color.teal,
      color: color.teal,
      backgroundColor: color.teal
    },
    [NotificationType.success]: {
      borderColor: color.green,
      color: color.green,
      backgroundColor: color.green
    },
    [NotificationType.failure]: {
      borderColor: color.red,
      color: color.red,
      backgroundColor: color.red
    },
    [NotificationType.warning]: {
      borderColor: color.mustardyellow,
      color: color.charcoal,
      backgroundColor: color.mustardyellow
    },
    [NotificationType.bullhorn]: {
      borderColor: color.teal,
      color: color.teal,
      backgroundColor: color.teal
    },
  }
};

const Notification = React.createClass({
  propTypes: {
    type: PropTypes.oneOf(Object.keys(NotificationType)).isRequired,
    notice: React.PropTypes.string.isRequired,
    details: React.PropTypes.string.isRequired,
    buttonText: React.PropTypes.string,
    buttonLink: React.PropTypes.string,
    dismissible: React.PropTypes.bool.isRequired,
    analyticId: React.PropTypes.string
  },

  getInitialState() {
   return {open: true};
  },

  toggleContent() {
    this.setState({open: !this.state.open});
  },

  onAnnouncementClick: function () {
    if (this.props.analyticId) {
      trackEvent('teacher_announcement','click', this.props.analyticId);
    }
  },

  render() {
    const { notice, details, type, buttonText, buttonLink, dismissible } = this.props;
    const icons = {
      information: 'info-circle',
      success: 'check-circle',
      failure: 'exclamation-triangle',
      warning: 'exclamation-triangle',
      bullhorn: 'bullhorn'
    };

    if (!this.state.open) {
      return null;
    }
    return (
      <div style={[styles.colors[type], styles.main]}>
        <div style={[styles.iconBox, styles.colors[type]]}>
          <FontAwesome icon={icons[type]} style={styles.icon}/>
        </div>
        {dismissible && (
          <FontAwesome
            icon="times"
            style={styles.dismiss}
            onClick={this.toggleContent}
          />
        )}
        <div style={styles.wordBox}>
          <div style={[styles.colors[type], styles.notice]}>
            {notice}
          </div>
          <div style={styles.details}>
            {details}
          </div>
        </div>
        {buttonText && (
          <ProgressButton
            href={buttonLink}
            color={ProgressButton.ButtonColor.gray}
            text={buttonText}
            style={styles.button}
            target="_blank"
            onClick={this.onAnnouncementClick}
          />
        )}
      </div>
    );
  }
});

Notification.NotificationType = NotificationType;

export default Radium(Notification);
