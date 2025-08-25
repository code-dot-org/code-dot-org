import Image, {ImageProps} from '@code-dot-org/component-library/image';
import {
  BodyThreeText,
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Box} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import styles from '../../workshop.module.scss';

export interface EmptyStateProps {
  imageProps: ImageProps;
  title: string;
  description: string;
  large?: boolean;
}

export const EmptyState: FC<EmptyStateProps> = ({
  imageProps,
  title,
  description,
  large,
}) => {
  return (
    <Box
      className={classNames(styles.emptyStateContainer, {
        [styles.large]: large,
      })}
    >
      {/* empty state images generally do not convey additional meaning. 
      using alt="" by default so screen readers will ignore the image */}
      <Image className={styles.emptyStateImage} alt="" {...imageProps} />
      <BodyTwoText noMargin>
        <StrongText>{title}</StrongText>
      </BodyTwoText>
      <BodyThreeText noMargin>{description}</BodyThreeText>
    </Box>
  );
};
