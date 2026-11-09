// Shows a step's markdown on a canvas sized like a panel, the text centered
// vertically, with the step's button and an optional outside link under the
// canvas at the end.

import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useMemo, useRef} from 'react';

import {PANEL_CONTROLS_HEIGHT, fitPanel} from '@cdo/apps/panels/fitPanel';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import useElementSize from '@cdo/apps/util/hooks/useElementSize';

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
  const host = useRef<HTMLDivElement>(null);
  const [hostWidth, hostHeight] = useElementSize(host);
  const size = useMemo(
    () => fitPanel(hostWidth, hostHeight),
    [hostWidth, hostHeight]
  );

  // The canvas mounts once the host is measured, so focus waits for that.
  const ready = hostWidth > 0;
  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ready) canvasRef.current?.focus();
  }, [ready]);
  // The site's stylesheet sets every image's height to auto, over the
  // height written on an <img> tag; a style on the element wins it back.
  useEffect(() => {
    canvasRef.current
      ?.querySelectorAll<HTMLImageElement>('img[height]')
      .forEach(img => {
        img.style.height = `${img.getAttribute('height')}px`;
      });
  }, [ready, step.markdown]);

  return (
    <div ref={host} className={styles.markdownHost}>
      {ready && (
        <>
          <div
            className={styles.markdownCanvas}
            style={size}
            tabIndex={-1}
            ref={canvasRef}
          >
            <div className={styles.markdownBody}>
              <SafeMarkdown markdown={withLineBreaks(step.markdown)} />
            </div>
          </div>
          <div
            className={styles.markdownActions}
            style={{width: size.width, height: PANEL_CONTROLS_HEIGHT}}
          >
            {step.link && (
              <MuiButton
                variant="outlined"
                color="secondary"
                size="medium"
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
              size="medium"
              type="button"
              onClick={onComplete}
            >
              {step.continueLabel ?? continueLabel}
            </MuiButton>
          </div>
        </>
      )}
    </div>
  );
};

export default MarkdownStep;
