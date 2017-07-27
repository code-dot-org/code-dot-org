import React from 'react';
import color from "../../util/color";
import styleConstants from '../../styleConstants';
import Button from '../Button';

const styles = {
  container: {
    height: 250,
    width: styleConstants['content-width'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    backgroundColor: color.white,
  },
  tealBar: {
    width: styleConstants['content-width'],
    height: 65,
    backgroundColor: color.teal,
  },
  headingBox: {
    paddingTop: 25,
  },
  heading: {
    marginLeft: 350,
    color: color.white,
    fontSize: 18,
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  headingRtl: {
    marginRight: 350,
    color: color.white,
    fontSize: 18,
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  description: {
    marginLeft: 350,
    marginRight: 20,
    marginTop: 15,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    lineHeight: 1.5,
    color: color.charcoal
  },
  descriptionRtl: {
    marginRight: 350,
    marginLeft: 20,
    marginTop: 15,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    lineHeight: 1.5,
    color: color.charcoal
  },
  button: {
    marginLeft: 350,
    marginTop: 50
  },
  buttonRtl: {
    marginRight: 350,
    marginTop: 50
  },
  image: {
    height: 210,
    width: 310,
    margin: 20,
    position: 'absolute',
  }
};

const Announcement = React.createClass({
  propTypes: {
    heading: React.PropTypes.string.isRequired,
    image: React.PropTypes.string,
    buttonText: React.PropTypes.string,
    description: React.PropTypes.string.isRequired,
    link: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    const { heading, buttonText, description, link, image, isRtl } = this.props;
    const filenameToImgUrl = {
      "redesign-screencast": require('@cdo/static/redesign-screencast.png'),
    };

    const imgSrc = filenameToImgUrl[image];

    return (
      <div style={styles.container}>
        <a href={link}>
          <img src={imgSrc} style={styles.image}/>
        </a>
        <div style={styles.tealBar}>
          <div style={styles.headingBox}>
            <a href={link} style={isRtl? styles.headingRtl : styles.heading}>
              {heading}
            </a>
          </div>
        </div>
        <div style={isRtl? styles.descriptionRtl : styles.description}>
          {description}
        </div>
        <Button
          href={link}
          color={Button.ButtonColor.gray}
          text={buttonText}
          style={isRtl? styles.buttonRtl : styles.button}
        />
      </div>
    );
  }
});

export default Announcement;
