import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React, {FC} from 'react';

import styles from './Loading.module.scss';

export const Loading: FC = () => {
  return (
    <div className={styles.loading}>
      <BodyTwoText noMargin>Loading...</BodyTwoText>
      <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
    </div>
  );
};
