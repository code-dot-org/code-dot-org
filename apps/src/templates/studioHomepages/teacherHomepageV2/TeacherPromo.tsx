import {LinkButton} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  Heading5,
  OverlineTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

export interface TeacherPromoInfo {
  id: string;
  announcementType: string;
  backgroundColor: string;
  buttonLabel: string;
  buttonTarget: string;
  title: string;
  description: string;
  image: string;
  isClosable: boolean;
  partnerLogo: string | null;
}

interface TeacherPromoAdditionalProps {
  onClose: (id: string) => void;
}

const announcementTypes = [
  {text: 'New Curriculum', icon: 'book-open-cover'},
  {text: 'Announcement', icon: 'bullhorn'},
  {text: 'New Feature', icon: 'circle-plus'},
  {text: 'Hour of Code', icon: 'clock'},
  {text: 'Teacher Resources', icon: 'folder-open'},
  {text: 'Professional Learning', icon: 'head-side-gear'},
];

const getIconType = (announcementText: string): string => {
  const entry = announcementTypes.find(type => type.text === announcementText);
  return entry ? entry.icon : 'bullhorn';
};

type TeacherPromoProps = TeacherPromoInfo & TeacherPromoAdditionalProps;

export const TeacherPromo: React.FC<TeacherPromoProps> = ({
  id,
  announcementType,
  title,
  description,
  buttonLabel,
  buttonTarget,
  image,
  isClosable,
  partnerLogo,
  onClose,
}) => {
  return (
    <div className={styles.promotion} key={id}>
      {isClosable && (
        <CloseButton
          className={styles.closeButton}
          aria-label={i18n.closeDialog()}
          onClick={() => onClose(id)}
        />
      )}
      <OverlineTwoText className={styles.promotionType}>
        <FontAwesomeV6Icon iconName={getIconType(announcementType)} />{' '}
        {announcementType}
      </OverlineTwoText>
      <Heading5 className={styles.promotionTitle}>{title}</Heading5>
      <img src={image} alt={title} className={styles.promotionImage} />
      <BodyThreeText>{description}</BodyThreeText>
      {partnerLogo && (
        <BodyThreeText className={styles.promotionPartnerLogo}>
          <StrongText>{i18n.partnershipWith()}</StrongText>
          <img
            src={partnerLogo}
            alt="Partner Logo"
            className={styles.partnerLogo}
          />
        </BodyThreeText>
      )}
      <LinkButton
        href={buttonTarget}
        color="black"
        text={buttonLabel}
        iconRight={{iconName: 'up-right-from-square'}}
        type="secondary"
        size="s"
        className={styles.promotionButton}
      />
    </div>
  );
};
