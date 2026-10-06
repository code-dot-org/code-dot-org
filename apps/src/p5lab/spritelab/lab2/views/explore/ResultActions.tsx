// After a picture: the question about it, and what to do next.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './image-explore.module.scss';

/** Goes to analytics only. */
export type Verdict = 'up' | 'down';

interface ResultActionsProps {
  verdict: Verdict | null;
  onJudge: (verdict: Verdict) => void;
  onChangeWords: () => void;
  onGenerateAgain: () => void;
  onContinue: () => void;
  disabled?: boolean;
}

const ResultActions: React.FunctionComponent<ResultActionsProps> = ({
  verdict,
  onJudge,
  onChangeWords,
  onGenerateAgain,
  onContinue,
  disabled,
}) => (
  <>
    <hr className={styles.resultDivider} />
    <div className={styles.resultActions}>
      <div
        className={styles.resultQuestionRow}
        role="group"
        aria-labelledby="explore-result-label"
      >
        <span id="explore-result-label" className={styles.resultQuestion}>
          How did the AI do?
        </span>
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
          aria-pressed={verdict === 'down'}
          className={classNames(
            styles.verdictButton,
            verdict === 'down' && styles.verdictChosen
          )}
          disabled={disabled}
          onClick={() => onJudge('down')}
        >
          <FontAwesomeV6Icon iconName="thumbs-down" aria-hidden />
        </MuiIconButton>
      </div>
      <div className={styles.resultButtons}>
        <MuiButton
          variant="outlined"
          color="secondary"
          disabled={disabled}
          onClick={onChangeWords}
        >
          Change words
        </MuiButton>
        <MuiButton
          variant="outlined"
          color="secondary"
          startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
          disabled={disabled}
          onClick={onGenerateAgain}
        >
          Generate again
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
