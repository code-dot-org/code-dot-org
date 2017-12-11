import React, { PropTypes, Component } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from "./Button";
import styleConstants from '../styleConstants';
import trackEvent from '../util/trackEvent';

export const NotificationType = {
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
    minHeight: 72,
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    marginBottom: 20,
    display: 'flex',
    flexFlow: 'wrap',
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
    lineHeight: 1.5,
    paddingTop: 6,
    paddingBottom: 6,
    color: color.charcoal,
  },
  wordBox: {
    // flex priority
    flex: 1,
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
    marginRight: 25,
    marginTop: 18,
    marginBottom: 18,
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
  clear: {
    clear: 'both'
  }
};

class Notification extends Component {
  static propTypes = {
    type: PropTypes.oneOf(Object.keys(NotificationType)).isRequired,
    notice: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    buttonText: PropTypes.string,
    buttonLink: PropTypes.string,
    dismissible: PropTypes.bool.isRequired,
    newWindow: PropTypes.bool,
    analyticId: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    onButtonClick: PropTypes.func,
    buttonClassName: PropTypes.string,

    // Can be specified to override default width
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };

  state = {open: true};

  toggleContent() {
    this.setState({open: !this.state.open});
  }

  onAnnouncementClick() {
    if (this.props.analyticId) {
      trackEvent('teacher_announcement','click', this.props.analyticId);
    }
    if (this.props.onButtonClick) {
      this.props.onButtonClick();
    }
  }

  render() {
    const { notice, details, type, buttonText, buttonLink, dismissible, newWindow, isRtl, width, buttonClassName } = this.props;

    const icons = {
      information: 'info-circle',
      success: 'check-circle',
      failure: 'exclamation-triangle',
      warning: 'exclamation-triangle',
      bullhorn: 'bullhorn'
    };

    const mainStyle = {
      ...styles.main,
      direction: isRtl ? 'rtl' : 'ltr',
      width: width || styles.main.width
    };

    if (!this.state.open) {
      return null;
    }
    return (
      <div>
        <div style={[styles.colors[type], mainStyle]}>
          {type !== NotificationType.course && (
            <div style={[styles.iconBox, styles.colors[type]]}>
              <FontAwesome icon={icons[type]} style={styles.icon}/>
            </div>
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
            <Button
              href={buttonLink}
              color={Button.ButtonColor.gray}
              text={buttonText}
              style={styles.button}
              target={newWindow ? "_blank" : null}
              onClick={this.onAnnouncementClick.bind(this)}
              className={buttonClassName}
            />
          )}
          {dismissible && (
            <div style={styles.dismiss}>
              <FontAwesome
                icon="times"
                onClick={this.toggleContent.bind(this)}
              />
            </div>
          )}
        </div>
        <div style={styles.clear}/>
      </div>
    );
  }
}

export default connect(state => ({
  isRtl: state.isRtl,
}))(Radium(Notification));
