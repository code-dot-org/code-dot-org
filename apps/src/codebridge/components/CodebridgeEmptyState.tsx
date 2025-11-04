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
}

export const CodebridgeEmptyState: FC<CodebridgeEmptyStateProps> = ({
  imageProps,
  title,
  description,
  className,
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
    </Box>
  );
};
