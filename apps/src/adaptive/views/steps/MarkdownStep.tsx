// Shows a step's markdown on a card, under a logo when the content names
// one, with the step's button and an optional outside link under the card
// at the end.

import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useRef} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {MarkdownStep as MarkdownStepContent} from '../../types';

import styles from './stepPlayer.module.scss';

interface MarkdownStepProps {
  step: MarkdownStepContent;
  continueLabel: string;
  onComplete: () => void;
}

// A lone newline is a line break, so the card reads as authored. No
// lookaround: Safari before 16.4 cannot parse it, and a bad regex literal
// fails the whole module.
const withLineBreaks = (markdown: string) =>
  markdown.replace(/\n+/g, run => (run.length === 1 ? '  \n' : run));

const MarkdownStep: React.FunctionComponent<MarkdownStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cardRef.current?.focus();
  }, []);
  // The site's stylesheet sets every image's height to auto, over the
  // height written on an <img> tag; a style on the element wins it back.
  useEffect(() => {
    cardRef.current
      ?.querySelectorAll<HTMLImageElement>('img[height]')
      .forEach(img => {
        img.style.height = `${img.getAttribute('height')}px`;
      });
  }, [step.markdown]);

  return (
    <div className={styles.questionsStep}>
      <div className={styles.markdownCard} tabIndex={-1} ref={cardRef}>
        {step.logoUrl && (
          <img src={step.logoUrl} alt="" className={styles.cardLogo} />
        )}
        <div className={styles.markdownBody}>
          <SafeMarkdown markdown={withLineBreaks(step.markdown)} />
        </div>
      </div>
      <div className={styles.markdownActions}>
        {step.link && (
          <MuiButton
            variant="outlined"
            color="secondary"
            size="large"
            href={step.link.href}
            target="_blank"
            rel="noopener"
          >
            {step.link.label}
          </MuiButton>
        )}
        <MuiButton
          variant="contained"
          color="primary"
          size="large"
          type="button"
          onClick={onComplete}
        >
          {step.continueLabel ?? continueLabel}
        </MuiButton>
      </div>
    </div>
  );
};

export default MarkdownStep;
