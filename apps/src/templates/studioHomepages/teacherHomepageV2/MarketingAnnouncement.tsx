import {LinkButton} from '@code-dot-org/component-library/button';
import {
  BodyThreeText,
  Heading3,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import styles from './teacherHomepage.module.scss';

export interface MarketingAnnouncementProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageURL: string;
}

export const MarketingAnnouncement: React.FC<MarketingAnnouncementProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageURL,
}) => {
  return (
    <div className={styles.announcement}>
      <img src={imageURL} alt={title} className={styles.announcementImage} />
      <Heading3>{title}</Heading3>
      <BodyThreeText>{description}</BodyThreeText>
      <LinkButton
        href={buttonLink}
        color="black"
        text={buttonText}
        type="secondary"
        size="xs"
      />
    </div>
  );
};
