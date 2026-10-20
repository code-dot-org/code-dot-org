import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import bookWithBulb from './images/book_with_bulb.png';

import styles from './teacherHomepage.module.scss';

const PermanentPromotions: React.FC = () => {
  const promotions = [
    {
      id: 'explore-pl',
      title: 'Grow your knowledge',
      description:
        'Empower your teaching with workshops and self-paced learning.',
      buttonLabel: 'Explore professional learning',
      buttonTarget: '/my-professional-learning',
      image: (
        <img
          src={bookWithBulb}
          alt=""
          className={styles.staticPromotionImage}
        />
      ),
    },
  ];

  return (
    <>
      {promotions.map(promotion => (
        <li key={promotion.id} className={styles.staticPromotion}>
          <div className={styles.staticPromotionText}>
            <Typography variant="body2" gutterBottom>
              <Typography variant="strong">{promotion.title}</Typography>
            </Typography>
            <Typography variant="body4" gutterBottom>
              {promotion.description}
            </Typography>
            <Link
              href={promotion.buttonTarget}
              size="xs"
              openInNewTab={true}
              onClick={() => {
                analyticsReporter.sendEvent(
                  EVENTS.PERMANENT_PROMOTION_CLICKED,
                  {id: promotion.id}
                );
              }}
            >
              {promotion.buttonLabel}
              <FontAwesomeV6Icon iconName="up-right-from-square" />
            </Link>
          </div>
          {promotion.image}
        </li>
      ))}
    </>
  );
};

export default PermanentPromotions;
