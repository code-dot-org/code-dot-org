import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './sectionSetup.module.scss';

const LoginTypeCard = ({title, subtitle, description, onClick, className}) => (
  <button
    type="button"
    onClick={onClick}
    className={[styles.card, className].filter(Boolean).join(' ')}
  >
    <div className={styles.cardText}>
      <Typography className={styles.cardTitle} variant="h4" component="span">
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body3"
          component="span"
          className={styles.cardSubtitle}
        >
          {subtitle}
        </Typography>
      )}
      {description && (
        <Typography
          className={styles.cardDescription}
          variant="body2"
          component="span"
        >
          {description}
        </Typography>
      )}
    </div>
  </button>
);

LoginTypeCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default LoginTypeCard;
