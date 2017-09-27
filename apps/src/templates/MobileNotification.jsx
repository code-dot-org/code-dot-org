import React, { PropTypes, Component } from 'react';
import color from "@cdo/apps/util/color";
import Button from "./Button";
import trackEvent from '../util/trackEvent';

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    width: '100%',
    backgroundColor: color.white,
    borderColor: color.teal,
    marginBottom: 20,
    display: 'flex',
    flexFlow: 'wrap',
  },
  notice: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    backgroundColor: color.white,
    color: color.teal,
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
    marginLeft: 25,
    marginRight: 25
  },
  button: {
    marginLeft: 25,
    marginRight: 25,
    marginTop: 18,
    marginBottom: 18,
  },
  clear: {
    clear: 'both'
  }
};

export default class MobileNotification extends Component {
  static propTypes = {
    notice: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    buttonText: PropTypes.string,
    buttonLink: PropTypes.string,
    newWindow: PropTypes.bool,
    analyticId: PropTypes.string,
    onButtonClick: PropTypes.func,
  };


  onAnnouncementClick() {
    if (this.props.analyticId) {
      trackEvent('mobile_announcement','click', this.props.analyticId);
    }
    if (this.props.onButtonClick) {
      this.props.onButtonClick();
    }
  }

  render() {
    const { notice, details, buttonText, buttonLink, newWindow } = this.props;

    return (
      <div>
        <div style={styles.main}>
          <div style={styles.wordBox}>
            <div style={styles.notice}>
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
              onClick={this.onAnnouncementClick}
            />
          )}
        </div>
        <div style={styles.clear}/>
      </div>
    );
  }
}
