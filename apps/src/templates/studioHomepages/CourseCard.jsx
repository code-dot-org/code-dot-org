import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
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
          <MuiButton
            variant="outlined"
            color="tertiary"
            size="small"
            aria-label={i18n.viewCourse()}
            href={link}
          >
            {i18n.viewCourse()}
          </MuiButton>
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
    borderColor: 'var(--borders-neutral-primary)',
    position: 'relative',
    height: 245,
    width: 473,
    float: 'left',
    marginBottom: 20,
    backgroundColor: 'var(--background-neutral-secondary)',
  },
  header: {
    position: 'absolute',
    width: 473,
    height: 130,
    backgroundColor: 'var(--background-brand-teal-primary)',
  },
  title: {
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 20,
    ...fontConstants['main-font-regular'],
    color: 'var(--text-neutral-white-fixed)',
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
    color: 'var(--text-neutral-white-fixed)',
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
    color: 'var(--text-neutral-primary)',
    background: 'var(--background-neutral-secondary)',
    height: 130,
    width: '100%',
    boxSizing: 'border-box',
    position: 'absolute',
    zIndex: 2,
  },
};

export default connect(state => ({
  isRtl: state.isRtl,
}))(CourseCard);
