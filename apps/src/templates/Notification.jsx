import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Radium from 'radium';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from "./Button";
import styleConstants from '../styleConstants';
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
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    marginBottom: 20,
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
    width: styleConstants['content-width']-297,
    marginLeft: 25,
    marginRight: 25
  },
  dismiss: {
    color: color.lighter_gray,
    marginTop: 5,
    marginRight: 10,
    marginLeft: 10,
    cursor: 'pointer',
  },
  iconBox: {
    width: 72,
    height: 72,
    backgroundColor: color.lightest_gray,
    textAlign: 'center'
  },
  icon: {
    color: 'rgba(255,255,255, .8)',
    fontSize: 38,
    lineHeight: 2
  },
  button: {
    marginLeft: 25,
    marginRight: 25
  },
  colors: {
    [NotificationType.information]: {
      borderColor: color.teal,
      color: color.teal,
      backgroundColor: color.teal
    },
    [NotificationType.success]: {
      borderColor: color.level_perfect,
      color: color.level_perfect,
      backgroundColor: color.level_perfect
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
      borderColor: color.border_gray,
      color: color.teal,
      backgroundColor: color.teal
    },
    [NotificationType.bullhorn]: {
      borderColor: color.teal,
      color: color.teal,
      backgroundColor: color.teal
    }
  },
  ltr: {
    float: 'left',
  },
  rtl: {
    float: 'right',
  },
  clear: {
    clear: 'both'
  }
};

const Notification = React.createClass({
  propTypes: {
    type: PropTypes.oneOf(Object.keys(NotificationType)).isRequired,
    notice: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    buttonText: PropTypes.string,
    buttonLink: PropTypes.string,
    dismissible: PropTypes.bool.isRequired,
    newWindow: PropTypes.bool,
    analyticId: PropTypes.string,
    isRtl: PropTypes.bool.isRequired
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
    const { notice, details, type, buttonText, buttonLink, dismissible, newWindow, isRtl } = this.props;

    const icons = {
      information: 'info-circle',
      success: 'check-circle',
      failure: 'exclamation-triangle',
      warning: 'exclamation-triangle',
      bullhorn: 'bullhorn'
    };

    const localeStyle = isRtl ? styles.rtl : styles.ltr;
    const localeStyleButtons = isRtl ? styles.ltr : styles.rtl;
    const buttonSpacing = dismissible ? {marginTop:0} : {marginTop:18};

    if (!this.state.open) {
      return null;
    }
    return (
      <div>
        <div style={[styles.colors[type], styles.main, localeStyle]}>
          {type !== NotificationType.course && (
            <div style={[styles.iconBox, styles.colors[type], localeStyle]}>
              <FontAwesome icon={icons[type]} style={styles.icon}/>
            </div>
          )}
          {dismissible && (
            <div style={[styles.dismiss, localeStyleButtons]}>
              <FontAwesome
                icon="times"
                onClick={this.toggleContent}
              />
            </div>
          )}
          <div style={[styles.wordBox, localeStyle]}>
            <div style={[styles.colors[type], styles.notice]}>
              {notice}
            </div>
            <div style={styles.details}>
              {details}
            </div>
          </div>
          {buttonText && (
            <Button
              href={buttonLink}
              color={Button.ButtonColor.gray}
              text={buttonText}
              style={[styles.button, localeStyleButtons, buttonSpacing]}
              target={newWindow ? "_blank" : null}
              onClick={this.onAnnouncementClick}
            />
          )}
        </div>
        <div style={styles.clear}/>
      </div>
    );
  }
});

Notification.NotificationType = NotificationType;

export const UnconnectedNotification = Radium(Notification);

export default connect(state => ({
  isRtl: state.isRtl
}))(Radium(Notification));
