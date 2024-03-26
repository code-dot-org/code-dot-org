import React, {useState, useEffect, useReducer} from 'react';
import {Alert, Fade} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {LmsLinks} from '@cdo/apps/util/sharedConstants';
import {trySetLocalStorage, tryGetLocalStorage} from '@cdo/apps/utils';
import {getStore} from '@cdo/apps/redux';
import {
  ltiFeedbackReducer,
  fetchLtiFeedback,
  createLtiFeedback,
} from '@cdo/apps/redux/lti/ltiFeedbackReducer';
import i18n from '@cdo/locale';

import './LtiFeedbackBanner.scss';

// The initial status of the banner. It means that the status has not been set yet.
const UNSET = '';
// The status when the banner is not available. This is typically when the user is not an LTI teacher.
const UNAVAILABLE = 'unavailable';
// The status when the banner is displayed but the user has not yet provided feedback.
const UNANSWERED = 'unanswered';
// The status when the user has provided feedback.
const ANSWERED = 'answered';
// The status when the banner has been closed by the user.
const CLOSED = 'closed';

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
    if (!currentUser.isLti || !currentUser.isTeacher) return UNAVAILABLE;

    let status = tryGetLocalStorage(key, UNSET);
    if (status === UNAVAILABLE) status = UNSET;

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
      setStatus(UNANSWERED);
    } else if (ltiFeedback) {
      setStatus(ANSWERED);
    }
  }, [ltiFeedback]);

  /**
   * Effect for handling errors.
   */
  useEffect(() => {
    error && setStatus(UNSET);
  }, [error]);

  /**
   * Function for handling user feedback.
   */
  const answer = (satisfied: boolean) =>
    createLtiFeedback(ltiFeedbackAction, {satisfied});

  /**
   * Function for closing the banner.
   */
  const close = () => setStatus(CLOSED);

  return (
    <Fade in={[UNANSWERED, ANSWERED].includes(status)} unmountOnExit={true}>
      <Alert
        key={key}
        bsStyle="info"
        className="lti-feedback-banner"
        aria-labelledby="lti-feedback-banner-title"
        closeLabel={i18n.closeDialog()}
        onDismiss={status === ANSWERED ? close : undefined}
      >
        <span className="lti-feedback-banner-greeting">
          <FontAwesome
            icon="hand-wave"
            className="fa-fw"
            title=""
            aria-hidden="true"
          />
        </span>

        <Fade in={!isLoading}>
          {status === UNANSWERED ? (
            <span>
              <span id="lti-feedback-banner-title" aria-hidden="true">
                {i18n.lti_feedbackBanner_question()}
              </span>

              <span className="lti-feedback">
                <button
                  type="button"
                  title={i18n.lti_feedbackBanner_answer_positive()}
                  onClick={() => answer(true)}
                >
                  <FontAwesome
                    icon="thumbs-o-up"
                    className="fa-fw"
                    title=""
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  title={i18n.lti_feedbackBanner_answer_negative()}
                  onClick={() => answer(false)}
                >
                  <FontAwesome
                    icon="thumbs-o-down"
                    className="fa-fw"
                    title=""
                    aria-hidden="true"
                  />
                </button>
              </span>
            </span>
          ) : (
            <span>
              <span id="lti-feedback-banner-title" aria-hidden="true">
                {i18n.lti_feedbackBanner_shareMore_text()}
              </span>

              <span aria-hidden="true"> </span>

              <a
                id="lti-feedback-banner-share-more-link"
                href={LmsLinks.ADDITIONAL_FEEDBACK_URL}
                target="_blank"
                rel="noreferrer"
              >
                {i18n.lti_feedbackBanner_shareMore_link()}
              </a>
            </span>
          )}
        </Fade>
      </Alert>
    </Fade>
  );
};

export default LtiFeedbackBanner;
