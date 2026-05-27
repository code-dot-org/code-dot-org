import {Typography, Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './twoColumnActionBlock.module.scss';

export default function TwoColumnActionBlock({
  id,
  imageUrl,
  heading,
  subHeading,
  description,
  buttons,
  marginBottom = '64px',
}) {
  return (
    <div
      id={id}
      className={styles.container}
      // eslint-disable-next-line react/forbid-dom-props
      data-testid="two-column-action-block"
    >
      {heading && (
        <Typography variant="h2" gutterBottom>
          {heading}
        </Typography>
      )}
      <div
        className={styles.actionBlockWrapper}
        style={{marginBottom: marginBottom}}
      >
        <img
          src={imageUrl}
          alt=""
          className={styles.image}
          // eslint-disable-next-line react/forbid-dom-props
          data-testid="two-column-action-block-img"
        />
        <div className={styles.contentWrapper}>
          {subHeading && (
            <Typography
              className="two-column-action-block--sub-heading"
              component="p"
              variant="h5"
              gutterBottom
            >
              {subHeading}
            </Typography>
          )}
          <Typography variant="body3" gutterBottom>
            {description}
          </Typography>
          <div
            className={classNames(
              styles.buttonsContainer,
              buttons.some(button => button.extraText) &&
                styles.buttonsContainerVerticalButtons
            )}
          >
            {buttons.map((button, index) => (
              <div key={index}>
                <MuiButton
                  variant="contained"
                  color="purple"
                  href={button.url}
                  target={button.target}
                  id={button.id}
                  onClick={button.onClick}
                  aria-label={button.ariaLabel}
                >
                  {button.text}
                </MuiButton>
                {button.extraText && (
                  <Typography variant="body4" gutterBottom>
                    {button.extraText}
                  </Typography>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

TwoColumnActionBlock.propTypes = {
  id: PropTypes.string,
  imageUrl: PropTypes.string.isRequired,
  heading: PropTypes.string,
  subHeading: PropTypes.string,
  description: PropTypes.string.isRequired,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      extraText: PropTypes.string,
      target: PropTypes.string,
      id: PropTypes.string,
    })
  ),

  marginBottom: PropTypes.string,
};
