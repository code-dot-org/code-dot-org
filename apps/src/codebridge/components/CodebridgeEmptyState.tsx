import {Button, ButtonProps} from '@code-dot-org/component-library/button';
import Image, {ImageProps} from '@code-dot-org/component-library/image';
import {Box, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import styles from './CodebridgeEmptyState.module.scss';

export interface CodebridgeEmptyStateProps {
  imageProps?: ImageProps;
  title?: string;
  description?: string;
  className?: string;
  buttonProps?: ButtonProps;
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
      {buttonProps && <Button {...buttonProps} />}
    </Box>
  );
};
