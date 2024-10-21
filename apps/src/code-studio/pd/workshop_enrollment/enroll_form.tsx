
type EnrollmentResponse = {
  workshop_enrollment_status: string;
  account_exists: boolean;
  sign_up_url: string;
  cancel_url: string;
};

  onSubmissionComplete: (response?: EnrollmentResponse) => void;
    // must refactor this now
    $.ajax({
      method: 'POST',
      url: `/api/v1/pd/workshops/${props.workshop_id}/enrollments`,
      contentType: 'application/json',
      data: JSON.stringify(params),
      complete: result => {
        setIsSubmitting(false);
        result?.responseJSON?.workshop_enrollment_status === 'error' &&
          setSubmissionErrorMessage(
            result?.responseJSON?.error_message || 'unknown error'
          );
        props.onSubmissionComplete(result?.responseJSON);
      },
    });
