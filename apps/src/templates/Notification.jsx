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
  course: 'course',
  bullhorn: 'bullhorn'
};

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    height: 72,
    width: 970,
    backgroundColor: color.white,
    marginBottom: 20,
    float: 'left'
  },
  notice: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.2,
    marginTop: 16,
    backgroundColor: color.white,
  },
  details: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    lineHeight: 2.5,
    marginBottom: 16,
    color: color.charcoal,
  },
  wordBox: {
    //width: 'calc(100% - 320px)',
    width: 640,
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
    width: 72,
    height: 72,
    backgroundColor: color.lightest_gray,
    float: 'left',
    textAlign: 'center'
  },
  icon: {
    color: 'rgba(255,255,255, .8)',
    fontSize: 38,
    lineHeight: 2
  },
  button: {
    float: 'left',
    marginLeft: 50,
    marginTop: 15
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
    [NotificationType.course]: {
      borderColor: color.charcoal,
      color: color.teal,
      backgroundColor: color.teal
    },
    [NotificationType.bullhorn]: {
      borderColor: color.teal,
      color: color.teal,
      backgroundColor: color.teal
    }
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
      course: 'plus',
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
