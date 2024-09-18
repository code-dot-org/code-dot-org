import React, {useState, useEffect, useReducer} from 'react';

import {getStore} from '@cdo/apps/redux';
import {
  ltiFeedbackReducer,
  fetchLtiFeedback,
  createLtiFeedback,
} from '@cdo/apps/redux/lti/ltiFeedbackReducer';
import {trySetLocalStorage, tryGetLocalStorage} from '@cdo/apps/utils';
import {LmsLinks} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import FeedbackBanner, {
  BANNER_STATUS,
} from '../../../sharedComponents/userFeedback/FeedbackBanner';

/**
 * LtiFeedbackBanner component
 * This component is responsible for displaying the LMS Feedback banner for LTI teachers.
 * The banner asks the teacher for feedback and provides options to respond.
 * The banner's visibility and state are managed through local storage and state variables.
 *
 * @component
 */
const LtiFeedbackBanner: React.FC = () => {
  const currentUser = getStore().getState().currentUser;
  const key = `lti-fb-${currentUser.uuid}`;

  /**
   * Reducer for managing the state of the LTI feedback.
   */
  const [{isLoading, error, ltiFeedback}, ltiFeedbackAction] = useReducer(
    ltiFeedbackReducer,
    {
      isLoading: false,
    }
  );

  /**
   * State variable for managing the status of the banner.
   * The status is stored in local storage to persist across sessions.
   */
  const [status, setStatus] = useState<string>(() => {
    if (!currentUser.isLti || !currentUser.isTeacher)
      return BANNER_STATUS.UNAVAILABLE;

    let status = tryGetLocalStorage(key, BANNER_STATUS.UNSET);
    if (status === BANNER_STATUS.UNAVAILABLE) status = BANNER_STATUS.UNSET;

    !status && fetchLtiFeedback(ltiFeedbackAction);

    return status;
  });

  /**
   * Effect for updating the local storage whenever the status changes.
   */
  useEffect(() => {
    trySetLocalStorage(key, status);
  }, [key, status]);

  /**
   * Effect for updating the status based on the LTI feedback.
   */
  useEffect(() => {
    if (ltiFeedback === null) {
      setStatus(BANNER_STATUS.UNANSWERED);
    } else if (ltiFeedback) {
      setStatus(BANNER_STATUS.ANSWERED);
    }
  }, [ltiFeedback]);

  /**
   * Effect for handling errors.
   */
  useEffect(() => {
    error && setStatus(BANNER_STATUS.UNSET);
  }, [error]);

  /**
   * Function for handling user feedback.
   */
  const answer = (satisfied: boolean) =>
    createLtiFeedback(ltiFeedbackAction, {satisfied});

  /**
   * Function for closing the banner.
   */
  const close = () => setStatus(BANNER_STATUS.CLOSED);

  return (
    <FeedbackBanner
      alertKey={key}
      answerStatus={status}
      answer={answer}
      close={close}
      isLoading={isLoading}
      closeLabel={i18n.closeDialog()}
      question={i18n.lti_feedbackBanner_question()}
      positiveAnswer={i18n.lti_feedbackBanner_answer_positive()}
      negativeAnswer={i18n.lti_feedbackBanner_answer_negative()}
      shareMore={i18n.lti_feedbackBanner_shareMore_text()}
      shareMoreLink={LmsLinks.ADDITIONAL_FEEDBACK_URL}
      shareMoreLinkText={i18n.lti_feedbackBanner_shareMore_link()}
    />
  );
};

export default LtiFeedbackBanner;
