import Alert from '@code-dot-org/component-library/alert';
import Button, {LinkButton} from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import {
  Heading3,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {GetWorkshopInfoScriptDataResponse} from '@cdo/apps/code-studio/pd/workshops/types';

import {useWorkshopEnrollment} from './../hooks/useWorkshopEnrollment';

import moduleStyles from './../workshopMarketingPage.module.scss';

type WorkshopProps = Pick<
  GetWorkshopInfoScriptDataResponse,
  | 'custom_registration_link'
  | 'num_enrollments'
  | 'capacity'
  | 'id'
  | 'regional_partner_name'
  | 'course'
  | 'sessions'
  | 'name'
  | 'format'
  | 'subject'
>;

// Dipslay for users that cannot enroll in workshops: signed-out users or students.
const EnrollInWorkshopForNonTeachers: React.FC<{
  workshop_id: number;
  is_student: boolean;
}> = ({workshop_id, is_student}) => {
  const accountUpdateTypePath = is_student
    ? 'teacher_account_required'
    : 'logged_out';
  const needTeacherAccountLink = `/${accountUpdateTypePath}?source_page=${encodeURIComponent(
    'workshop enroll'
  )}&return_to=/professional-learning/workshops/${workshop_id}`;

  return (
    <LinkButton
      className={moduleStyles.fullWidthButton}
      type="primary"
      size="m"
      href={needTeacherAccountLink}
      text={is_student ? 'Switch to teacher account' : 'Sign-in to enroll'}
      iconRight={{iconName: 'right-to-bracket'}}
    />
  );
};

// Display for users that can enroll in workshops: teachers.
const EnrollInWorkshopForTeachers: React.FC<
  WorkshopProps & {user_id: number}
> = ({
  id,
  custom_registration_link,
  num_enrollments,
  capacity,
  sessions,
  regional_partner_name,
  course,
  format,
  name,
  subject,
  user_id,
}) => {
  const {handleClick, isSubmitting, alertState, setAlertState} =
    useWorkshopEnrollment({
      workshopId: id,
      userId: user_id,
      regional_partner_name,
      course,
      format,
      name,
      subject,
      sessions,
    });
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
            This workshop's registration is managed externally by the regional
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
      <Button
        className={moduleStyles.fullWidthButton}
        type="primary"
        size="m"
        isPending={isSubmitting}
        onClick={handleClick}
        text="Enroll in this workshop"
      />
    );
  };

  return (
    <div className={moduleStyles.card}>
      <Heading3 visualAppearance="heading-xs">Enroll in this workshop</Heading3>
      {alertState.show && (
        <Alert
          type={'danger'}
          text={alertState.text}
          link={alertState.link}
          onClose={() =>
            setAlertState({show: false, text: '', link: undefined})
          }
        />
      )}
      {renderEnrollmentAction()}
      <Link type="secondary" size="xs" href="#data-sharing-notice">
        Click to see data sharing notice
      </Link>
    </div>
  );
};

/** Component to display the enrollment information for a workshop. */
const EnrollInWorkshop: React.FC<
  WorkshopProps & {user_id?: number; is_student: boolean}
> = ({
  id,
  custom_registration_link,
  num_enrollments,
  capacity,
  sessions,
  regional_partner_name,
  course,
  format,
  name,
  subject,
  user_id,
  is_student,
}) => {
  return !user_id || is_student ? (
    <EnrollInWorkshopForNonTeachers workshop_id={id} is_student={is_student} />
  ) : (
    <EnrollInWorkshopForTeachers
      id={id}
      custom_registration_link={custom_registration_link}
      num_enrollments={num_enrollments}
      capacity={capacity}
      sessions={sessions}
      regional_partner_name={regional_partner_name}
      course={course}
      format={format}
      name={name}
      subject={subject}
      user_id={user_id}
    />
  );
};

export default EnrollInWorkshop;
