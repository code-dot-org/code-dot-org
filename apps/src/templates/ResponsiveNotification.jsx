import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from "./Button";

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    width: '100%',
    backgroundColor: color.white,
    marginBottom: 20,
    display: "flex",
    flexWrap: 'wrap',
    borderColor: color.teal,
  },
  notice: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.2,
    marginTop: 16,
    width: '100%',
    color: color.teal,
    backgroundColor: color.white,
  },
  details: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    paddingTop: 2,
    paddingBottom: 10,
    color: color.charcoal,
  },
  wordBox: {
    marginLeft: 25,
    marginRight: 25,
    maxWidth: 620,
    display: "flex",
    flexWrap: 'wrap',
  },
  dismiss: {
    color: color.lighter_gray,
    marginTop: 5,
    marginRight: 10,
    marginLeft: 10,
    cursor: 'pointer',
  },
  iconBox: {
    width: 90,
    height: 90,
    backgroundColor: color.teal,
    textAlign: 'center'
  },
  icon: {
    color: 'rgba(255,255,255, .8)',
    fontSize: 40,
    lineHeight: 2
  },
  button: {
    margin: 25
  },
  clear: {
    clear: 'both'
  }
};

const ResponsiveNotification = React.createClass({
  propTypes: {
    notice: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    buttonText: PropTypes.string,
    buttonLink: PropTypes.string,
    newWindow: PropTypes.bool,
  },

  getInitialState() {
   return {open: true};
  },

  toggleContent() {
    this.setState({open: !this.state.open});
  },

  render() {
    const { notice, details, buttonText, buttonLink } = this.props;

    if (!this.state.open) {
      return null;
    }
    return (
      <div>
        <div style={styles.main}>
          <div style={styles.iconBox}>
            <FontAwesome icon="bullhorn" style={styles.icon}/>
          </div>
          <div style={styles.wordBox}>
            <div style={styles.notice}>
              {notice}
            </div>
            <div style={styles.details}>
              {details}
            </div>
          </div>
          <div>
            {buttonText && (
              <Button
                href={buttonLink}
                color={Button.ButtonColor.gray}
                text={buttonText}
                style={styles.button}
                onClick={this.onAnnouncementClick}
                newWindow={true}
              />
            )}
          </div>
        </div>
        <div style={styles.clear}/>
      </div>
    );
  }
});

export default ResponsiveNotification;
