import Image, {ImageProps} from '@code-dot-org/component-library/image';
import {
  BodyThreeText,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import {Box} from '@mui/material';
import React, {FC} from 'react';

import styles from './CodebridgeEmptyState.module.scss';

export interface CodebridgeEmptyStateProps {
  imageProps: ImageProps;
  title: string;
  description: string;
}

export const CodebridgeEmptyState: FC<CodebridgeEmptyStateProps> = ({
  imageProps,
  title,
  description,
}) => {
  return (
    <Box className={styles.emptyStateContainer}>
      {/* empty state images generally do not convey additional meaning.
      using alt="" by default so screen readers will ignore the image */}
      <Image className={styles.emptyStateImage} alt="" {...imageProps} />
      <div className={styles.textContainer}>
        <BodyTwoText visualAppearance="heading-md">{title}</BodyTwoText>
        <BodyThreeText noMargin>{description}</BodyThreeText>
      </div>
    </Box>
  );
};
