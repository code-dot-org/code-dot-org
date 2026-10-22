// After a picture: the question about it, and what to do next.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './sentence-scene.module.scss';

/** Goes to analytics only. */
export type Verdict = 'up' | 'down';
/** Why the thumb went down; analytics only. */
export type VerdictReason = 'mismatch' | 'wrong';

const VERDICT_REASONS: {value: VerdictReason; text: string}[] = [
  {value: 'mismatch', text: "Doesn't match my prompt"},
  {value: 'wrong', text: "Doesn't look right"},
];

interface VerdictRowProps {
  verdict: Verdict | null;
  onJudge: (verdict: Verdict) => void;
  /** Chosen once, after a thumb down. */
  reason: VerdictReason | null;
  onReason: (reason: VerdictReason) => void;
  disabled?: boolean;
  /** In the tip's box, for a panel that holds it alone. */
  boxed?: boolean;
}

/** The question about the picture and the two thumbs; after a thumb down,
    the two reasons it could be, on a row under the question. */
export const VerdictRow: React.FunctionComponent<VerdictRowProps> = ({
  verdict,
  onJudge,
  reason,
  onReason,
  disabled,
  boxed,
}) => (
  <div
    className={classNames(
      styles.resultQuestionRow,
      boxed && styles.verdictBoxed
    )}
    role="group"
    aria-labelledby="sentence-result-label"
  >
    <span id="sentence-result-label" className={styles.resultQuestion}>
      How did the AI do?
    </span>
    {verdict === 'down' ? (
      <div className={styles.reasonRow}>
        {VERDICT_REASONS.map(r => (
          <MuiButton
            key={r.value}
            variant="outlined"
            color="secondary"
            size="small"
            className={classNames(
              styles.reasonButton,
              reason === r.value && styles.reasonChosen
            )}
            aria-pressed={reason === r.value}
            disabled={disabled || (!!reason && reason !== r.value)}
            onClick={() => onReason(r.value)}
          >
            {r.text}
          </MuiButton>
        ))}
      </div>
    ) : (
      <>
        <MuiIconButton
          aria-label="Good"
          aria-pressed={verdict === 'up'}
          className={classNames(
            styles.verdictButton,
            verdict === 'up' && styles.verdictChosen
          )}
          disabled={disabled}
          onClick={() => onJudge('up')}
        >
          <FontAwesomeV6Icon iconName="thumbs-up" aria-hidden />
        </MuiIconButton>
        <MuiIconButton
          aria-label="Not so good"
          aria-pressed={false}
          className={styles.verdictButton}
          disabled={disabled}
          onClick={() => onJudge('down')}
        >
          <FontAwesomeV6Icon iconName="thumbs-down" aria-hidden />
        </MuiIconButton>
      </>
    )}
  </div>
);

interface ResultActionsProps {
  /** The question about the picture, while it is asked. */
  verdict: React.ReactNode;
  disabled?: boolean;
  onChangeWords: () => void;
  onGenerateAgain: () => void;
  onContinue: () => void;
  /** No generations left: Regenerate alone goes off. */
  regenerateDisabled?: boolean;
}

const ResultActions: React.FunctionComponent<ResultActionsProps> = ({
  verdict,
  onChangeWords,
  onGenerateAgain,
  onContinue,
  disabled,
  regenerateDisabled,
}) => (
  <>
    <hr className={styles.resultDivider} />
    <div className={styles.resultActions}>
      {verdict}
      <div className={styles.resultButtons}>
        <MuiButton
          variant="outlined"
          color="secondary"
          disabled={disabled}
          onClick={onChangeWords}
        >
          Modify prompt
        </MuiButton>
        <MuiButton
          variant="outlined"
          color="secondary"
          startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
          disabled={disabled || regenerateDisabled}
          onClick={onGenerateAgain}
        >
          Regenerate
        </MuiButton>
        <MuiButton
          variant="contained"
          color="primary"
          endIcon={
            <FontAwesomeV6Icon
              iconName="arrow-right"
              iconStyle="solid"
              aria-hidden
            />
          }
          disabled={disabled}
          onClick={onContinue}
        >
          Continue
        </MuiButton>
      </div>
    </div>
  </>
);

export default ResultActions;
