import React from 'react';
import color from "../../util/color";
// import ReactTooltip from 'react-tooltip';
import FontAwesome from '../FontAwesome';
import i18n from "@cdo/locale";

const styles = {
  card: {
    overflow: 'hidden',
    borderRadius: 2,
    border: '1px solid gray',
    position: 'relative',
    height: 200,
    width: 400
  },
  overlay: {
    background: 'linear-gradient(to right, rgba(2,130,132,.95), rgba(2,130,132,0))',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  image: {
    position: 'absolute',
  },
  courseName: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 20,
    fontSize: 18,
    fontFamily: '"Gotham 3r", sans-serif',
    color: 'rgba(255, 255, 255, .9)',
    zIndex: 2,
    position: 'absolute',
    display: 'inline'
  },
  description: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 90,
    fontSize: 14,
    fontFamily: '"Gotham", sans-serif',
    color: color.gray,
    background: color.white,
    height: 100,
    position: 'absolute',
    zIndex: 2,
  },
  checkIcon: {
    position: 'absolute',
    zIndex: 3,
    fontSize: 18,
    color: color.white,
    marginLeft: 350,
    background: color.teal,
    padding: 10,
    borderRadius: 100,
    border: '1px solid white',
    display: 'inline',
    marginTop: 10
  },
  continueLink: {
    color: color.teal,
    fontSize: 12,
    fontFamily: '"Gotham", sans-serif',
    fontWeight: 'bold',
    marginTop: -2,
    display: 'inline'
  },
  chevron: {
    display: 'inline',
    color: color.teal,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  linkBox: {
    display: 'block',
    paddingBottom: 10
  }

};

const CourseCard = React.createClass({
  propTypes: {
    cardData: React.PropTypes.shape({
      courseName: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      image: React.PropTypes.string.isRequired,
      link: React.PropTypes.string.isRequired,
      assignedSections: React.PropTypes.array.isRequired
    })
  },

  checkEnrollment() {
    const { cardData } = this.props;
    if (cardData.assignedSections.length > 0) {
      //display the checkmark
      return (
        <FontAwesome icon="check" style={styles.checkIcon}/>
      );
        //the checkmark should have a tooltip that maps the assigned sections
    }
  },

  render() {
    const { cardData } = this.props;

    return (
      <div style={styles.card}>
        <img src={require('../../../static/navcard-placeholder.png')} style={styles.image}/>

        {this.checkEnrollment()}

        <h2 style={styles.courseName}>{cardData.courseName}</h2>

        <h4 style={styles.description}>
          {cardData.description}

          <span style={styles.linkBox}>
            <h3 style={styles.continueLink}>      {i18n.continueCourse()}
            </h3>

            <FontAwesome icon="chevron-right" style={styles.chevron}/>

          </span>

        </h4>


        <div style={styles.overlay}/>
      </div>
    );
  }

});

export default CourseCard;
