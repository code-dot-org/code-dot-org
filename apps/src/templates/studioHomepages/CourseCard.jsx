import React from 'react';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import i18n from "@cdo/locale";

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
    fontSize: 12,
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
  },

  render() {
    const { name, description, link } = this.props;

    return (
      <a href={link} style={styles.card}>
        <img src={require('@cdo/static/small_purple_icons.png')} style={styles.image}/>
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
      </a>
    );
  }
});

export default CourseCard;
