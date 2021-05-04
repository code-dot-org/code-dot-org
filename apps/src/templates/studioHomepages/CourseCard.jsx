import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import color from '../../util/color';
import FontAwesome from '../FontAwesome';
import i18n from '@cdo/locale';

/**
 * A card used on the homepage to display information about a particular course
 * or script for a user.
 */
class CourseCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  render() {
    const {title, description, link, isRtl} = this.props;
    const icon = isRtl ? 'chevron-left' : 'chevron-right';

    return (
      <a href={link} style={styles.card}>
        <img
          src={require('@cdo/static/small_purple_icons.png')}
          style={styles.image}
        />
        <div style={isRtl ? styles.titleRtl : styles.title}>{title}</div>
        <div style={styles.description}>
          {description}
          <div style={styles.linkBox}>
            <h3 style={styles.continueLink}>{i18n.viewCourse()}</h3>
            <FontAwesome
              icon={icon}
              style={isRtl ? styles.chevronRtl : styles.chevron}
            />
          </div>
        </div>
      </a>
    );
  }
}

const styles = {
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    position: 'relative',
    height: 245,
    width: 473,
    float: 'left',
    marginBottom: 20
  },
  image: {
    position: 'absolute',
    width: 473,
    height: 130
  },
  title: {
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 20,
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    zIndex: 2,
    position: 'absolute',
    display: 'inline',
    paddingLeft: 25,
    paddingRight: 10
  },
  titleRtl: {
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 20,
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    zIndex: 2,
    position: 'absolute',
    display: 'inline',
    paddingRight: 25,
    paddingLeft: 10
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
    width: '100%',
    boxSizing: 'border-box',
    position: 'absolute',
    zIndex: 2
  },
  continueLink: {
    color: color.teal,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold',
    marginTop: -5,
    display: 'inline'
  },
  chevron: {
    display: 'inline',
    color: color.teal,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8
  },
  chevronRtl: {
    display: 'inline',
    color: color.teal,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8
  },
  linkBox: {
    display: 'block',
    paddingBottom: 20,
    textDecoration: 'none'
  }
};

export default connect(state => ({
  isRtl: state.isRtl
}))(CourseCard);
