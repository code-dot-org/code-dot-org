// The two thumbs over the picture, and after one is pressed the question
// of why, answered by picking from three reasons.

import {Chips} from '@code-dot-org/component-library/chips';
import {MuiCustomDialog as CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import useThemeMode from '@cdo/apps/pixelEditor/useThemeMode';

import {Verdict} from '../sentence/ResultActions';

import styles from './images-tab.module.scss';

interface RatingBarProps {
  verdict: Verdict | null;
  onJudge: (verdict: Verdict) => void;
  /** The reasons picked for the verdict, when the question is done. */
  onReasons: (reasons: string[]) => void;
  disabled?: boolean;
}

/** The question and its three answers, by thumb. */
export const RATING_QUESTIONS: Record<
  Verdict,
  {question: string; options: {value: string; label: string}[]}
> = {
  up: {
    question: 'What did AI do well?',
    options: [
      {value: 'matches', label: 'It matches my words'},
      {value: 'looks-right', label: 'It looks right'},
      {value: 'style', label: 'I like the style'},
    ],
  },
  down: {
    question: 'What went wrong?',
    options: [
      {value: 'mismatch', label: "It doesn't match my words"},
      {value: 'wrong', label: "It doesn't look right"},
      {value: 'colors', label: 'The colors are off'},
    ],
  },
};

const RatingBar: React.FunctionComponent<RatingBarProps> = ({
  verdict,
  onJudge,
  onReasons,
  disabled,
}) => {
  const mode = useThemeMode();
  // The question opens with the thumb and closes with Done.
  const [asking, setAsking] = useState<Verdict | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const judge = (next: Verdict) => {
    onJudge(next);
    setPicked([]);
    setAsking(next);
  };
  const question = asking && RATING_QUESTIONS[asking];
  return (
    <>
      <div
        className={styles.ratingBar}
        role="group"
        aria-label="How did the AI do?"
      >
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
          <FontAwesomeV6Icon iconName="thumbs-up" aria-hidden />
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
          <FontAwesomeV6Icon iconName="thumbs-down" aria-hidden />
        </MuiIconButton>
      </div>
      {question && (
        <div className={styles.ratingHost}>
          <CustomDialog
            aria-label={question.question}
            mode={mode}
            className={styles.ratingDialog}
          >
            <span id="dsco-dialog-description" className={styles.srOnly}>
              Pick any reasons that fit, then Done.
            </span>
            <h2 className={styles.ratingTitle}>{question.question}</h2>
            <div className={styles.ratingBody}>
              <Chips
                name="rating-reasons"
                label="Pick any that fit"
                options={question.options}
                values={picked}
                setValues={setPicked}
                size="m"
              />
            </div>
            <div className={styles.ratingFooter}>
              <MuiButton
                variant="contained"
                color="primary"
                onClick={() => {
                  onReasons(picked);
                  setAsking(null);
                }}
              >
                Done
              </MuiButton>
            </div>
          </CustomDialog>
        </div>
      )}
    </>
  );
};

export default RatingBar;
