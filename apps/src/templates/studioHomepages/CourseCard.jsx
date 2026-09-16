import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import styles from './course-card.module.scss';

/**
 * A card used on the homepage to display information about a particular course
 * or script for a user.
 */
export default class CourseCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  };

  render() {
    const {title, description, link} = this.props;

    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <MuiTypography className={styles.title} component="h5" variant="h5">
            {title}
          </MuiTypography>
        </div>
        <div className={styles.description}>
          <MuiTypography component="p" variant="body3" gutterBottom>
            {description}
          </MuiTypography>
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
