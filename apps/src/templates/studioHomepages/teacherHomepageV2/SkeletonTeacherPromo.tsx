import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import Skeleton from '@cdo/apps/util/loadingSkeleton';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

export const SkeletonTeacherPromo: React.FC = () => {
  return (
    <li
      className={classNames(styles.promotion, styles['promotion-skeleton'])}
      aria-label={i18n.loading()}
      key="skeleton"
    >
      <Typography
        className={styles.promotionType}
        variant="overline2"
        gutterBottom
      >
        <Skeleton />
      </Typography>
      <Typography className={styles.promotionTitle} variant="h5" gutterBottom>
        <Skeleton />
      </Typography>
      <div className={classNames(styles.promotionImage, styles.imageSkeleton)}>
        <Skeleton />
      </div>
      <Typography variant="body3" gutterBottom>
        <Skeleton count={4} />
      </Typography>
    </li>
  );
};
