import React from 'react';
import color from "../../util/color";
import ReactTooltip from 'react-tooltip';
import FontAwesome from '../FontAwesome';
import i18n from "@cdo/locale";
import _ from 'lodash';

const styles = {
  card: {
    overflow: 'hidden',
    borderRadius: 2,
    border: '1px solid gray',
    position: 'relative',
    height: 245,
    width: 520,
    margin: 25,
    float: 'left'
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
    width: 520
  },
  courseName: {
    paddingLeft: 25,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 18,
    fontFamily: '"Gotham 3r", sans-serif',
    color: 'rgba(255, 255, 255, .9)',
    zIndex: 2,
    position: 'absolute',
    display: 'inline'
  },
  description: {
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 20,
    paddingBottom: 5,
    marginTop: 115,
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: '"Gotham 3r", sans-serif',
    color: color.gray,
    background: color.white,
    height: 130,
    position: 'absolute',
    zIndex: 2,
    width: 520
  },
  checkIcon: {
    position: 'absolute',
    zIndex: 3,
    fontSize: 18,
    color: color.white,
    marginLeft: 460,
    background: color.teal,
    padding: 10,
    borderRadius: 100,
    border: '1px solid white',
    display: 'inline',
    marginTop: 15
  },
  continueLink: {
    color: color.teal,
    fontSize: 12,
    fontFamily: '"Gotham", sans-serif',
    fontWeight: 'bold',
    marginTop: -2,
    display: 'inline',
  },
  chevron: {
    display: 'inline',
    color: color.teal,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  linkBox: {
    display: 'block',
    paddingBottom: 10,
    marginTop: 20,
    textDecoration: 'none'
  },
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

  renderEnrollmentIcon() {
    const { cardData } = this.props;
    const tooltipId = _.uniqueId();

    if (cardData.assignedSections.length > 0) {
      return (
        <span>
          <FontAwesome icon="check" style={styles.checkIcon} data-tip data-for={tooltipId}/>

          <ReactTooltip
            id={tooltipId}
            role="tooltip"
            wrapper="span"
            effect="solid"
            place="top"
          >
            {this.tooltipContent()}
          </ReactTooltip>
        </span>
      );
    }
    return null;
  },

  tooltipContent() {
    const { cardData } = this.props;
    const sections = cardData.assignedSections.slice(0,2).join(", ");
    const ellipsis = (cardData.assignedSections.length > 2 ? " ..." : "");
    return (
      <span style={styles.tooltip}>
        {i18n.assignedTo()} {sections}{ellipsis}
      </span>
    );
  },

  render() {
    const { cardData } = this.props;

    return (
      <div style={styles.card}>
        <img src={require('../../../static/navcard-placeholder.png')} style={styles.image}/>

        {this.renderEnrollmentIcon()}

        <div style={styles.courseName}>
          {cardData.courseName}
        </div>

        <div style={styles.description}>
          {cardData.description}

          <a href={cardData.link} style={styles.linkBox}>
            <h3 style={styles.continueLink}>
              {i18n.viewCourse()}
            </h3>

            <FontAwesome icon="chevron-right" style={styles.chevron}/>
          </a>
        </div>

        <div style={styles.overlay}/>
      </div>
    );
  }

});

export default CourseCard;
