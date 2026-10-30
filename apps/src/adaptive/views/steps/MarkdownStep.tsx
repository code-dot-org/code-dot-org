// Shows a step's markdown on a canvas sized like a panel, the text centered
// vertically, with the step's button under the canvas at the end.

import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useMemo, useRef} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import useElementSize from '@cdo/apps/util/hooks/useElementSize';

import {MarkdownStep as MarkdownStepContent} from '../../types';

import styles from './stepPlayer.module.scss';

// The panels view's geometry, so a markdown card sits where a panel would.
const HORIZONTAL_MARGIN = 40;
const VERTICAL_MARGIN = 50;
const ACTIONS_HEIGHT = 70;
const ASPECT_RATIO = 16 / 9;

interface MarkdownStepProps {
  step: MarkdownStepContent;
  continueLabel: string;
  onComplete: () => void;
}

// A lone newline is a line break, so the card reads as authored.
const withLineBreaks = (markdown: string) =>
  markdown.replace(/(?<!\n)\n(?!\n)/g, '  \n');

/** The largest 16:9 box that fits the host beside its margins and the button row. */
function canvasSize(hostWidth: number, hostHeight: number) {
  const maxWidth = hostWidth - HORIZONTAL_MARGIN * 2;
  const maxHeight = hostHeight - VERTICAL_MARGIN * 2 - ACTIONS_HEIGHT;
  if (maxWidth / maxHeight > ASPECT_RATIO) {
    return {width: maxHeight * ASPECT_RATIO, height: maxHeight};
  }
  return {width: maxWidth, height: maxWidth / ASPECT_RATIO};
}

const MarkdownStep: React.FunctionComponent<MarkdownStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => {
  const host = useRef<HTMLDivElement>(null);
  const [hostWidth, hostHeight] = useElementSize(host);
  const size = useMemo(
    () => canvasSize(hostWidth, hostHeight),
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
            style={{width: size.width, height: ACTIONS_HEIGHT}}
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
