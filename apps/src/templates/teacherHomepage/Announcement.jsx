import React from 'react';
import color from "../../util/color";
import ProgressButton from '../progress/ProgressButton';

const styles = {
  container: {
    height: 250,
    width: 940,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    borderRadius: 3,
    backgroundColor: color.white,
  },
  tealBar: {
    width: 940,
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
    fontFamily: 'Gotham 3r',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  description: {
    marginLeft: 350,
    marginRight: 20,
    marginTop: 15,
    fontSize: 14,
    fontFamily: 'Gotham 3r',
    lineHeight: 1.5,
    color: color.charcoal
  },
  button: {
    marginLeft: 350,
    marginTop: 10
  },
  image: {
    height: 210,
    width: 310,
    borderRadius: 3,
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
    link: React.PropTypes.string.isRequired
  },

  render() {
    const { heading, buttonText, description, link, image } = this.props;
    const filenameToImgUrl = {
      "navcard-placeholder.png": require('../../../static/navcard-placeholder.png'),
    };

    const imgSrc = filenameToImgUrl[image];

    return (
      <div style={styles.container}>
        <a href={link}>
          <img src={imgSrc} style={styles.image}/>
        </a>
        <div style={styles.tealBar}>
          <div style={styles.headingBox}>
            <a href={link} style={styles.heading}>
              {heading}
            </a>
          </div>
        </div>
        <div style={styles.description}>
          {description}
        </div>
        <ProgressButton
          href={link}
          color={ProgressButton.ButtonColor.gray}
          text={buttonText}
          style={styles.button}
        />
      </div>
    );
  }
});

export default Announcement;
