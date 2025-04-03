import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {
  BodyFourText,
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import bookWithBulb from './images/book_with_bulb.png';
import magnifierWithBackground from './images/magnifier_with_background.png';

import styles from './teacherHomepage.module.scss';

const PermanentPromotions: React.FC = () => {
  const promotions = [
    {
      id: '1',
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
    {
      id: '2',
      title: 'Help improve Code.org',
      description:
        'Participate in user research to help us improve our platform for everyone.',
      buttonLabel: 'Join the user research program',
      buttonTarget: 'https://greatquestion.co/codedotorg/userresearch',
      image: (
        <img
          src={magnifierWithBackground}
          alt=""
          className={styles.staticPromotionImage}
        />
      ),
    },
  ];

  return (
    <div className={styles.staticPromotions}>
      {promotions.map(promotion => (
        <div key={promotion.id} className={styles.staticPromotion}>
          <div className={styles.staticPromotionText}>
            <BodyTwoText>
              <StrongText>{promotion.title}</StrongText>
            </BodyTwoText>
            <BodyFourText>{promotion.description}</BodyFourText>
            <Link href={promotion.buttonTarget} size="xs" openInNewTab={true}>
              {promotion.buttonLabel}
              <FontAwesomeV6Icon iconName="up-right-from-square" />
            </Link>
          </div>
          {promotion.image}
        </div>
      ))}
    </div>
  );
};

export default PermanentPromotions;
