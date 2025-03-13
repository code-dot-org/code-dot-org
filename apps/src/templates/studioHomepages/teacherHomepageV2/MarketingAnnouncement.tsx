import {LinkButton} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  Heading3,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import styles from './teacherHomepage.module.scss';

export interface MarketingAnnouncementInfo {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageURL: string;
  isCloseable: boolean;
}

interface MarketingAnnouncementAdditionalProps {
  closeAnnouncementCallback: () => void;
}

type MarketingAnnouncementProps = MarketingAnnouncementInfo &
  MarketingAnnouncementAdditionalProps;

export const MarketingAnnouncement: React.FC<MarketingAnnouncementProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageURL,
  isCloseable,
  closeAnnouncementCallback,
}) => {
  return (
    <div className={styles.announcement}>
      {isCloseable && (
        <div className={styles.closeButton}>
          <button type="button" onClick={closeAnnouncementCallback}>
            <FontAwesomeV6Icon iconName="close" />
          </button>
        </div>
      )}
      <img src={imageURL} alt={title} className={styles.announcementImage} />
      <Heading3>{title}</Heading3>
      <BodyThreeText>{description}</BodyThreeText>
      <LinkButton
        href={buttonLink}
        color="black"
        text={buttonText}
        type="secondary"
        size="s"
        className={styles.announcementButton}
      />
    </div>
  );
};
