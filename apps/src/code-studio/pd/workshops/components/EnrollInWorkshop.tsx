import Button, {LinkButton} from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import {
  Heading3,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {GetWorkshopInfoScriptDataResponse} from '@cdo/apps/code-studio/pd/workshops/types';

import moduleStyles from './../workshopMarketingPage.module.scss';

interface EnrollInWorkshopProps
  extends Pick<
    GetWorkshopInfoScriptDataResponse,
    'custom_registration_link' | 'num_enrollments' | 'capacity' | 'id'
  > {}

/** Component to display the enrollment information for a workshop. */
const EnrollInWorkshop: React.FC<EnrollInWorkshopProps> = ({
  id,
  custom_registration_link,
  num_enrollments,
  capacity,
}) => {
  const isFull = num_enrollments >= capacity;

  const renderEnrollmentAction = () => {
    if (isFull) {
      return (
        <Button
          className={moduleStyles.fullWidthButton}
          size="m"
          disabled
          text="Workshop is full"
          onClick={() => null}
        />
      );
    }

    if (custom_registration_link) {
      return (
        <>
          <BodyThreeText>
            This workshop’s registration is managed externally by the regional
            partner.
          </BodyThreeText>
          <LinkButton
            href={custom_registration_link}
            className={moduleStyles.fullWidthButton}
            type="primary"
            size="m"
            text="Go to partner enrollment"
            iconRight={{iconName: 'up-right-from-square'}}
          />
        </>
      );
    }

    return (
      <LinkButton
        className={moduleStyles.fullWidthButton}
        type="primary"
        size="m"
        href={`/pd/workshops/${id}/enroll`}
        text="Enroll in this workshop"
      />
    );
  };

  return (
    <div className={moduleStyles.card}>
      <Heading3 visualAppearance="heading-xs">Enroll in this workshop</Heading3>
      {renderEnrollmentAction()}
      <Link type="secondary" size="xs" href="#data-sharing-notice">
        Click to see data sharing notice
      </Link>
    </div>
  );
};

export default EnrollInWorkshop;
