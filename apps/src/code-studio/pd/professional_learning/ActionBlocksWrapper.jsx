import {Typography, Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './actionBlocksWrapper.module.scss';

const OneColumnActionBlock = ({
  overline,
  imageUrl,
  heading,
  description,
  buttons,
}) => {
  return (
    <div className={styles.oneColumnActionBlock}>
      <div className={styles.contentWrapper}>
        {overline && (
          <Typography
            className={styles.overline}
            variant="overline2"
            gutterBottom
          >
            {overline}
          </Typography>
        )}
        {heading && (
          <Typography component="h2" variant="h4" gutterBottom>
            {heading}
          </Typography>
        )}
        {imageUrl && <img src={imageUrl} alt="" />}
        {description && (
          <Typography variant="body3" gutterBottom>
            {description}
          </Typography>
        )}
      </div>
      <div className={styles.buttonWrapper}>
        {buttons &&
          buttons.map((button, index) => (
            <MuiButton
              key={index}
              variant={button.variant || 'contained'}
              color={button.color || 'primary'}
              size="medium"
              aria-label={button.ariaLabel}
              href={button.url}
              target={button.target}
              rel={
                button.target === '_blank' ? 'noopener noreferrer' : undefined
              }
            >
              {button.text}
            </MuiButton>
          ))}
      </div>
    </div>
  );
};

OneColumnActionBlock.propTypes = {
  overline: PropTypes.string,
  imageUrl: PropTypes.string,
  heading: PropTypes.string,
  description: PropTypes.string,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      variant: PropTypes.string,
      color: PropTypes.string,
      url: PropTypes.string,
      text: PropTypes.string,
      target: PropTypes.string,
      ariaLabel: PropTypes.string,
    })
  ),
};

export default function ActionBlocksWrapper({actionBlocks}) {
  return (
    <div
      className={
        // This automatically adjusts the column count CSS
        // based on the number of blocks in an array.
        // If there are 3 or more, it'll use a 3-column layout.
        // For example: 6 blocks would result in a 3x2 grid.
        actionBlocks?.length >= 3
          ? styles.wrapperThreeCol
          : styles.wrapperTwoCol
      }
    >
      {actionBlocks.map((actionBlock, index) => (
        <OneColumnActionBlock
          key={index}
          overline={actionBlock.overline}
          heading={actionBlock.heading}
          imageUrl={actionBlock.imageUrl}
          description={actionBlock.description}
          buttons={actionBlock.buttons}
        />
      ))}
    </div>
  );
}

ActionBlocksWrapper.propTypes = {
  actionBlocks: PropTypes.arrayOf(PropTypes.object),
};
