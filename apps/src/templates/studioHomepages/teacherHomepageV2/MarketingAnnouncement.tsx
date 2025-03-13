import {LinkButton} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  Heading3,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import styles from './teacherHomepage.module.scss';

export interface MarketingAnnouncementInfo {
  announcementType: string;
  backgroundColor: string; //TODO(lfm) add background color
  buttonLabel: string;
  buttonTarget: string;
  title: string;
  description: string;
  image: string;
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
  buttonLabel,
  buttonTarget,
  image,
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
      <img src={image} alt={title} className={styles.announcementImage} />
      <Heading3>{title}</Heading3>
      <BodyThreeText>{description}</BodyThreeText>
      <LinkButton
        href={buttonTarget}
        color="black"
        text={buttonLabel}
        type="secondary"
        size="s"
        className={styles.announcementButton}
      />
    </div>
  );
};
