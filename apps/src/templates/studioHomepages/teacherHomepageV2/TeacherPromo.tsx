import {LinkButton} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import _ from 'lodash';
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
  image: string | null;
  isClosable: boolean;
  partnerLogo: string | null;
  isExternal: boolean;
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

const TeacherPromo: React.FC<TeacherPromoProps> = ({
  id,
  announcementType,
  backgroundColor,
  title,
  description,
  buttonLabel,
  buttonTarget,
  image,
  isClosable,
  partnerLogo,
  isExternal,
  onClose,
}) => {
  return (
    <li
      className={classNames(
        styles.promotion,
        styles[`promotion-${_.lowerCase(backgroundColor)}`]
      )}
      key={id}
    >
      {isClosable && (
        <CloseButton
          className={styles.closeButton}
          aria-label={i18n.closeDialog()}
          onClick={() => onClose(id)}
        />
      )}
      <Typography
        className={styles.promotionType}
        variant="overline2"
        gutterBottom
      >
        <FontAwesomeV6Icon iconName={getIconType(announcementType)} />{' '}
        {announcementType}
      </Typography>
      <Typography className={styles.promotionTitle} variant="h5" gutterBottom>
        {title}
      </Typography>
      {image && (
        <img src={image} alt={title} className={styles.promotionImage} />
      )}
      <Typography variant="body3" gutterBottom>
        {description}
      </Typography>
      {partnerLogo && (
        <Typography
          className={styles.promotionPartnerLogo}
          variant="body3"
          gutterBottom
        >
          <Typography variant="strong">{i18n.partnershipWith()}</Typography>
          <img
            src={partnerLogo}
            alt="Partner Logo"
            className={styles.partnerLogo}
          />
        </Typography>
      )}
      <LinkButton
        href={buttonTarget}
        color="black"
        text={buttonLabel}
        iconRight={isExternal ? {iconName: 'up-right-from-square'} : undefined}
        type="secondary"
        size="s"
        className={styles.promotionButton}
      />
    </li>
  );
};

export default TeacherPromo;
