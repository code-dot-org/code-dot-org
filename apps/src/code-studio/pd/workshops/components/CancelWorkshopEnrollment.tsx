import Alert from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import Modal from '@code-dot-org/component-library/modal';
import React, {useState} from 'react';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import moduleStyles from './cancelWorkshopEnrollment.module.scss';

interface CancelWorkshopEnrollmentButtonProps {
  enrollmentCode: string;
  onCanceled?: () => void;
}

const CancelWorkshopEnrollmentButton: React.FC<
  CancelWorkshopEnrollmentButtonProps
> = ({enrollmentCode, onCanceled}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    text: string;
  } | null>(null);

  const handleCancel = async () => {
    setIsSubmitting(true);
    setAlert(null);
    try {
      const response = await fetch(`/api/v1/pd/enrollments/${enrollmentCode}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
      });
      if (response.ok) {
        setAlert({
          type: 'success',
          text: 'Your registration has been canceled.',
        });
        setShowConfirmation(false);
        if (onCanceled) onCanceled();
        else window.location.reload();
      } else {
        throw new Error('Failed to cancel enrollment.');
      }
    } catch (e) {
      setAlert({
        type: 'danger',
        text: 'Error canceling registration. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={moduleStyles.cancelWorkshopEnrollmentContainer}>
      {alert && (
        <Alert
          type={alert.type}
          text={alert.text}
          onClose={() => setAlert(null)}
        />
      )}
      <Button
        type="secondary"
        color="destructive"
        size="s"
        text="Unenroll from workshop"
        onClick={() => setShowConfirmation(true)}
        isPending={isSubmitting}
        className={moduleStyles.unenrollButton}
      />
      {showConfirmation && (
        <Modal
          title="Cancel Registration?"
          description="Are you sure you want to cancel your registration?"
          primaryButtonProps={{
            onClick: handleCancel,
            text: 'Yes, cancel registration',
            color: 'destructive',
          }}
          secondaryButtonProps={{
            onClick: () => setShowConfirmation(false),
            text: 'No, keep registration',
          }}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default CancelWorkshopEnrollmentButton;
