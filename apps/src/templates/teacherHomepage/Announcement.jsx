import React from 'react';
import color from "../../util/color";
import ProgressButton from '../progress/ProgressButton';


const styles = {
  container: {
    height: 250,
    width: 1000,
    border: '1px solid lightGray',
    borderRadius: 3,
    backgroundColor: color.white,
  },
  tealBar: {
    width: 1000,
    height: 60,
    backgroundColor: color.light_teal,
  },
  headingBox: {
    paddingTop: 20,
  },
  heading: {
    marginLeft: 350,
    color: color.white,
    fontSize: 18,
    fontFamily: '"Gotham 3r", sans-serif',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  description: {
    marginLeft: 350,
    marginRight: 25,
    marginTop: 25,
    fontSize: 14,
    fontFamily: '"Gotham 3r", sans-serif',
    lineHeight: 1.5,
    color: color.charcoal
  },
  button: {
    marginLeft: 350,
    marginTop: 25
  },
  image: {
    height: 210,
    width: 300,
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
    const { heading, buttonText, description, link } = this.props;

    return (
      <div style={styles.container}>
          <img src={require('../../../static/navcard-placeholder.png')} style={styles.image}/>
        <div style={styles.tealBar}>
          <div style={styles.headingBox}>
            <a href={link} style={styles.heading} >
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
