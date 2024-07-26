import React from 'react';
import {Alert, Fade} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import FontAwesome from '@cdo/apps/templates/FontAwesome';

import './FeedbackBanner.scss';

export const BANNER_STATUS = Object.freeze({
  // The initial status of the banner. It means that the status has not been set yet.
  UNSET: '',
  // The status when the banner is not available. This is typically when the user does not have access to the feature.
  // e.g. the teacher is not an LTI teacher.
  UNAVAILABLE: 'unavailable',
  // The status when the banner is displayed but the user has not yet provided feedback.
  UNANSWERED: 'unanswered',
  // The status when the user has provided feedback.
  ANSWERED: 'answered',
  // The status when the user has previously submitted feedback and the banner is not shown.
  PREVIOUSLY_ANSWERED: 'previously_answered',
  // The status when the banner has been closed by the user.
  CLOSED: 'closed',
});

interface FeedbackBannerProps {
  alertKey: string;
  answerStatus: string;
  answer: (satisfied: boolean) => void;
  close: () => void;
  isLoading: boolean;
  closeLabel: string;
  question: string;
  positiveAnswer: string;
  negativeAnswer: string;
  shareMore: string;
  shareMoreLink: string;
  shareMoreLinkText: string;
}

const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  alertKey,
  answerStatus,
  answer,
  close,
  isLoading,
  closeLabel,
  question,
  positiveAnswer,
  negativeAnswer,
  shareMore,
  shareMoreLink,
  shareMoreLinkText,
}) => {
  const isBannerVisible = React.useMemo(
    () =>
      ([BANNER_STATUS.UNANSWERED, BANNER_STATUS.ANSWERED] as string[]).includes(
        answerStatus
      ),
    [answerStatus]
  );

  return (
    <Fade in={isBannerVisible} unmountOnExit={true}>
      <Alert
        key={alertKey}
        bsStyle="info"
        className={'feedback-banner'}
        aria-labelledby="feedback-banner-title"
        closeLabel={closeLabel}
        onDismiss={answerStatus === BANNER_STATUS.ANSWERED ? close : undefined}
      >
        <span className="feedback-banner-greeting">
          <FontAwesome
            icon="hand-wave"
            className="fa-fw"
            title=""
            aria-hidden="true"
          />
        </span>

        <Fade in={!isLoading}>
          {answerStatus === BANNER_STATUS.UNANSWERED ? (
            <span>
              <span
                id="feedback-banner-title"
                className="feedback-title"
                aria-hidden="true"
              >
                {question}
              </span>

              <span className="feedback">
                <button
                  type="button"
                  title={positiveAnswer}
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
                  title={negativeAnswer}
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
            <span className="share-more">
              <span id="feedback-banner-title" aria-hidden="true">
                {shareMore}
              </span>

              <span aria-hidden="true"> </span>

              <a
                id="feedback-banner-share-more-link"
                href={shareMoreLink}
                target="_blank"
                rel="noreferrer"
              >
                {shareMoreLinkText}
              </a>
            </span>
          )}
        </Fade>
      </Alert>
    </Fade>
  );
};

export default FeedbackBanner;
