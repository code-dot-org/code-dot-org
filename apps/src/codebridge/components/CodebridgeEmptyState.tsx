import Image, {ImageProps} from '@code-dot-org/component-library/image';
import {
  Box,
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import styles from './CodebridgeEmptyState.module.scss';

export interface CodebridgeEmptyStateProps {
  imageProps?: ImageProps;
  title?: string;
  description?: string;
  className?: string;
  buttonProps?: MuiButtonProps;
}

export const CodebridgeEmptyState: FC<CodebridgeEmptyStateProps> = ({
  imageProps,
  title,
  description,
  className,
  buttonProps,
}) => {
  return (
    <Box
      className={classNames(styles.codebridgeEmptyStateContainer, className)}
    >
      {imageProps && (
        <Image
          className={styles.emptyStateImage}
          role="presentation"
          alt=""
          {...imageProps}
        />
      )}
      <div className={styles.textContainer}>
        {title && (
          <Typography component="p" variant="h4" gutterBottom>
            {title}
          </Typography>
        )}
        {description && (
          <Typography variant="body3" gutterBottom>
            {description}
          </Typography>
        )}
      </div>
      {buttonProps && (
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          type="button"
          {...buttonProps}
        />
      )}
    </Box>
  );
};
