import {
  BodyThreeText,
  Heading5,
  OverlineTwoText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import Skeleton from '@cdo/apps/util/loadingSkeleton';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

export const SkeletonTeacherPromo: React.FC = () => {
  return (
    <div className={styles.promotion} aria-label={i18n.loading()}>
      <OverlineTwoText className={styles.promotionType}>
        <Skeleton />
      </OverlineTwoText>
      <Heading5 className={styles.promotionTitle}>
        <Skeleton />
      </Heading5>
      <div className={classNames(styles.promotionImage, styles.imageSkeleton)}>
        <Skeleton />
      </div>
      <BodyThreeText>
        <Skeleton count={4} />
      </BodyThreeText>
    </div>
  );
};
