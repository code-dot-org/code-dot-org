// The two thumbs over the picture, and after one is pressed the question
// of why, answered by picking from three reasons.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useId, useRef, useState} from 'react';

import {Verdict} from '../../sentence/verdict';

import ReasonOptions, {ReasonOption} from './ReasonOptions';

import styles from '../images-tab.module.scss';

interface RatingBarProps {
  verdict: Verdict | null;
  onJudge: (verdict: Verdict) => void;
  /** The reasons picked for the verdict, when the question is done. */
  onReasons: (reasons: string[]) => void;
  /** Called with true when the reasons dialog opens and false when it
      closes. */
  onAsking?: (open: boolean) => void;
  /** Put the strip away without a thumb; absent where a rating is required. */
  onDismiss?: () => void;
  disabled?: boolean;
}

/** The question and its three answers, by thumb. */
export const RATING_QUESTIONS: Record<
  Verdict,
  {question: string; options: ReasonOption[]}
> = {
  up: {
    question: 'What did AI do well?',
    options: [
      {value: 'matches', label: 'Matches my prompt'},
      {value: 'great', label: 'Looks great'},
      {value: 'unexpected-liked', label: 'Not what I expected, but I like it'},
    ],
  },
  down: {
    question: 'What went wrong?',
    options: [
      {value: 'mismatch', label: "Doesn't match my prompt"},
      {value: 'wrong', label: "Doesn't look right"},
      {value: 'unexpected', label: 'Not what I expected'},
    ],
  },
};

const RatingBar: React.FunctionComponent<RatingBarProps> = ({
  verdict,
  onJudge,
  onReasons,
  onAsking,
  onDismiss,
  disabled,
}) => {
  // Done can unmount this bar in the same render that closes the dialog,
  // so the unmount cleanup also reports it closed.
  const [asking, setAsking] = useState<Verdict | null>(null);
  const onAskingRef = useRef(onAsking);
  onAskingRef.current = onAsking;
  useEffect(() => {
    onAsking?.(!!asking);
  }, [asking, onAsking]);
  useEffect(() => () => onAskingRef.current?.(false), []);
  const [picked, setPicked] = useState<string[]>([]);
  const judge = (next: Verdict) => {
    onJudge(next);
    setPicked([]);
    setAsking(next);
  };
  const question = asking && RATING_QUESTIONS[asking];
  const questionId = useId();
  // Done, and the dialog's close button and Escape, all record what was
  // picked: there is no way to leave the question unanswered.
  const done = () => {
    onReasons(picked);
    setAsking(null);
  };
  return (
    <>
      <div
        className={styles.ratingBar}
        role="group"
        aria-labelledby={questionId}
      >
        <span id={questionId} className={styles.ratingQuestion}>
          How did AI do?
        </span>
        <MuiIconButton
          aria-label="Good"
          aria-pressed={verdict === 'up'}
          className={classNames(
            styles.thumb,
            verdict === 'up' && styles.thumbChosen
          )}
          disabled={disabled}
          onClick={() => judge('up')}
        >
          <FontAwesomeV6Icon
            iconName="thumbs-up"
            iconStyle="regular"
            aria-hidden
          />
        </MuiIconButton>
        <MuiIconButton
          aria-label="Not so good"
          aria-pressed={verdict === 'down'}
          className={classNames(
            styles.thumb,
            verdict === 'down' && styles.thumbChosen
          )}
          disabled={disabled}
          onClick={() => judge('down')}
        >
          <FontAwesomeV6Icon
            iconName="thumbs-down"
            iconStyle="regular"
            aria-hidden
          />
        </MuiIconButton>
        {onDismiss && (
          <MuiIconButton
            aria-label="Dismiss"
            className={styles.dismiss}
            disabled={disabled}
            onClick={onDismiss}
          >
            <FontAwesomeV6Icon iconName="xmark" aria-hidden />
          </MuiIconButton>
        )}
      </div>
      {question && asking && (
        <MuiDialog
          title={question.question}
          className={styles.ratingDialog}
          customContent={
            <>
              <p id="dsco-dialog-description" className={styles.ratingPrompt}>
                <FontAwesomeV6Icon
                  iconName={asking === 'up' ? 'thumbs-up' : 'thumbs-down'}
                  iconStyle="solid"
                  className={classNames(
                    styles.ratingPromptIcon,
                    asking === 'up'
                      ? styles.ratingPromptUp
                      : styles.ratingPromptDown
                  )}
                  aria-hidden
                />
                Pick any that fit.
              </p>
              <ReasonOptions
                name="rating-reasons"
                legend={question.question}
                options={question.options}
                values={picked}
                onChange={setPicked}
              />
            </>
          }
          onClose={done}
          primaryButtonProps={{children: 'Done', onClick: done}}
        />
      )}
    </>
  );
};

export default RatingBar;
