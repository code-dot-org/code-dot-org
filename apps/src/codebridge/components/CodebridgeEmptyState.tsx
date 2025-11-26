import {Button, ButtonProps} from '@code-dot-org/component-library/button';
import Image, {ImageProps} from '@code-dot-org/component-library/image';
import {
  BodyThreeText,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import {Box} from '@mui/material';
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
          <BodyTwoText visualAppearance="heading-md">{title}</BodyTwoText>
        )}
        {description && <BodyThreeText>{description}</BodyThreeText>}
        {buttonProps && <Button {...buttonProps} />}
      </div>
    </Box>
  );
};
