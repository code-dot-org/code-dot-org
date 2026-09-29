import {
  Box,
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import {type FC} from 'react';

import Image, {type ImageProps} from '@code-dot-org/component-library/image';

import styles from './codebridgeEmptyState.module.css';

export interface CodebridgeEmptyStateProps {
  imageProps?: ImageProps;
  title?: string;
  description?: string;
  className?: string;
  buttonProps?: MuiButtonProps;
}

/**
 * A centered image + title + description placeholder for an empty panel.
 * Ported from apps/src/codebridge/components/CodebridgeEmptyState.tsx.
 */
export const CodebridgeEmptyState: FC<CodebridgeEmptyStateProps> = ({
  imageProps,
  title,
  description,
  className,
  buttonProps,
}) => (
  <Box className={classNames(styles.container, className)}>
    {imageProps && (
      <Image
        className={styles.image}
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
