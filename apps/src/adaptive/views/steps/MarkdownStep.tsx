// Shows a step's markdown on a canvas sized like a panel, the text centered
// vertically, with the step's button under the canvas at the end.

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

// A lone newline is a line break, so the card reads as authored.
const withLineBreaks = (markdown: string) =>
  markdown.replace(/(?<!\n)\n(?!\n)/g, '  \n');

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

  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    canvasRef.current?.focus();
  }, []);

  return (
    <div ref={host} className={styles.markdownHost}>
      {hostWidth > 0 && (
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
