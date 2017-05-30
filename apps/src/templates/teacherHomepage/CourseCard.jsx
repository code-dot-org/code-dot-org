import React from 'react';
import color from "../../util/color";
import ReactTooltip from 'react-tooltip';
import FontAwesome from '../FontAwesome';
import i18n from "@cdo/locale";
import _ from 'lodash';

const styles = {
  card: {
    overflow: 'hidden',
    border: '1px solid gray',
    position: 'relative',
    height: 245,
    width: 458,
    float: 'left',
    marginBottom: 20
  },
  image: {
    position: 'absolute',
    width: 458,
    height: 130
  },
  name: {
    paddingLeft: 25,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 20,
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
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
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    background: color.white,
    height: 130,
    width: "100%",
    boxSizing: "border-box",
    position: 'absolute',
    zIndex: 2,
  },
  checkIcon: {
    position: 'absolute',
    zIndex: 3,
    fontSize: 18,
    color: color.teal,
    marginLeft: 400,
    background: color.white,
    padding: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: color.gray,
    borderStyle: 'solid',
    display: 'inline',
    marginTop: 15
  },
  continueLink: {
    color: color.teal,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold',
    marginTop: -5,
    display: 'inline',
  },
  chevron: {
    display: 'inline',
    color: color.teal,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  linkBox: {
    display: 'block',
    paddingBottom: 20,
    textDecoration: 'none'
  },
};

/**
 * A card used on the homepage to display information about a particular course
 * or script for a user.
 */
const CourseCard = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
    link: React.PropTypes.string.isRequired,
    assignedSections: React.PropTypes.array.isRequired,
    image: React.PropTypes.string.isRequired
  },

  renderEnrollmentIcon() {
    const { assignedSections } = this.props;
    const tooltipId = _.uniqueId();
    const sections = assignedSections.slice(0,2).join(", ");
    const ellipsis = (assignedSections.length > 2 ? " ..." : "");

    if (assignedSections.length > 0) {
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
            <span style={styles.tooltip}>
              {i18n.assignedTo()} {sections}{ellipsis}
            </span>
          </ReactTooltip>
        </span>
      );
    }
  },

  render() {
    const { name, description, link, image } = this.props;
    const filenameToImgUrl = {
      "small_teal_icons": require('@cdo/static/small_teal_icons.png')
    };
    const imgSrc = filenameToImgUrl[image];

    return (
      <div href={link} style={styles.card}>
        <img src={imgSrc} style={styles.image}/>
        {this.renderEnrollmentIcon()}
        <div style={styles.name}>
          {name}
        </div>
        <div style={styles.description}>
          {description}
          <div style={styles.linkBox}>
            <h3 style={styles.continueLink}>
              {i18n.viewCourse()}
            </h3>
            <FontAwesome icon="chevron-right" style={styles.chevron}/>
          </div>
        </div>
      </div>
    );
  }
});

export default CourseCard;
