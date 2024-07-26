import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import fontConstants from '@cdo/apps/fontConstants';
import i18n from '@cdo/locale';

import color from '../../util/color';

/**
 * A card used on the homepage to display information about a particular course
 * or script for a user.
 */
class CourseCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
  };

  render() {
    const {title, description, link, isRtl} = this.props;

    return (
      <div style={styles.card}>
        <div style={styles.header} />
        <div style={isRtl ? styles.titleRtl : styles.title}>{title}</div>
        <div style={styles.description}>
          <p>{description}</p>
          <Button
            useAsLink={true}
            href={link}
            ariaLabel={i18n.viewCourse()}
            color={buttonColors.gray}
            text={i18n.viewCourse()}
            type="secondary"
            size="s"
          />
        </div>
      </div>
    );
  }
}

const styles = {
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.neutral_dark20,
    position: 'relative',
    height: 245,
    width: 473,
    float: 'left',
    marginBottom: 20,
    backgroundColor: color.neutral_light,
  },
  header: {
    position: 'absolute',
    width: 473,
    height: 130,
    backgroundColor: color.brand_primary_default,
  },
  title: {
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 20,
    ...fontConstants['main-font-regular'],
    color: color.white,
    zIndex: 2,
    position: 'absolute',
    display: 'inline',
    paddingLeft: 25,
    paddingRight: 10,
  },
  titleRtl: {
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 20,
    ...fontConstants['main-font-regular'],
    color: color.white,
    zIndex: 2,
    position: 'absolute',
    display: 'inline',
    paddingRight: 25,
    paddingLeft: 10,
  },
  description: {
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 20,
    paddingBottom: 5,
    marginTop: 115,
    fontSize: 14,
    lineHeight: 1.5,
    ...fontConstants['main-font-regular'],
    color: color.neutral_dark,
    background: color.neutral_light,
    height: 130,
    width: '100%',
    boxSizing: 'border-box',
    position: 'absolute',
    zIndex: 2,
  },
  continueLink: {
    color: color.teal,
    fontSize: 14,
    ...fontConstants['main-font-regular'],
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
  chevronRtl: {
    display: 'inline',
    color: color.teal,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  linkBox: {
    display: 'block',
    textDecoration: 'none',
  },
};

export default connect(state => ({
  isRtl: state.isRtl,
}))(CourseCard);
