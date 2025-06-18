import Button, {LinkButton} from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import {
  Heading3,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {GetWorkshopInfoScriptDataResponse} from '@cdo/apps/code-studio/pd/workshops/types';

import moduleStyles from './../workshopMarketingPage.module.scss';

const WORKSHOP_ENROLL_SOURCE_PAGE = 'workshop enroll';

interface EnrollInWorkshopProps
  extends Pick<
    GetWorkshopInfoScriptDataResponse,
    'custom_registration_link' | 'num_enrollments' | 'capacity' | 'id'
  > {
  is_signed_out: boolean;
  is_student: boolean;
}

/** Component to display the enrollment information for a workshop. */
const EnrollInWorkshop: React.FC<EnrollInWorkshopProps> = ({
  id,
  custom_registration_link,
  num_enrollments,
  capacity,
  is_signed_out,
  is_student,
}) => {
  const isFull = num_enrollments >= capacity;

  const buildEnrollButtonLink = (enrollLink: string) => {
    if (is_signed_out) {
      return `/logged_out?source_page=${encodeURIComponent(
        WORKSHOP_ENROLL_SOURCE_PAGE
      )}&return_to=${encodeURIComponent(enrollLink)}`;
    }

    if (is_student) {
      return `/teacher_account_required?source_page=${encodeURIComponent(
        WORKSHOP_ENROLL_SOURCE_PAGE
      )}&return_to=${encodeURIComponent(enrollLink)}`;
    }

    return enrollLink;
  };

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
            href={buildEnrollButtonLink(custom_registration_link)}
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
        href={buildEnrollButtonLink(`/pd/workshops/${id}/enroll`)}
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
