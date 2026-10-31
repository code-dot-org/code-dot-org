// The tab's right column: the sentence scene's controls, laid out as a thin
// pane beside the frame.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {imageKindLabel} from '../../ai/images/types';
import {SentenceSceneParts} from '../sentence/SentenceScene';

import styles from './images-tab.module.scss';

interface MakePaneProps {
  parts: SentenceSceneParts;
  /** The pane's width, px: the preview column's. */
  width: number;
  /** The image has pixels no prompt made, which a generation would replace;
      Generate asks first. */
  overwriteWarns?: boolean;
  /** Open the drawing tools; absent where drawing is not offered. */
  onDraw?: () => void;
  /** The drawing button's text. */
  drawLabel?: string;
}

const MakePane: React.FunctionComponent<MakePaneProps> = ({
  parts,
  width,
  overwriteWarns,
  onDraw,
  drawLabel = 'Draw my own',
}) => {
  const [confirming, setConfirming] = useState(false);
  const result = parts.mode === 'result';
  const generating = parts.mode === 'generating';
  const kindLabel = imageKindLabel(
    parts.draft.imageType,
    parts.draft.subject
  ).toLowerCase();
  const article = /^[aeiou]/.test(kindLabel) ? 'an' : 'a';
  // The first generation over hand-drawn pixels asks; once a picture has
  // landed, the pixels are the prompt's and the next one just replaces it.
  const asksFirst = !!overwriteWarns && !parts.frameFilled;
  const generate = () => {
    if (asksFirst) {
      setConfirming(true);
    } else {
      parts.generate();
    }
  };
  return (
    <section
      ref={parts.panelRef}
      tabIndex={-1}
      className={styles.pane}
      style={{width}}
      aria-label="Make your picture"
    >
      {parts.status}
      {!generating && (
        <p className={styles.headline}>
          {result ? (
            'AI made this from your words.'
          ) : (
            <>
              Generate {article}{' '}
              {parts.typeChoice ? (
                <span className={styles.typeChoice}>{parts.typeChoice}</span>
              ) : (
                kindLabel
              )}
            </>
          )}
        </p>
      )}
      {parts.sentence}
      {parts.error}
      {parts.progress}
      {parts.verdict && <div className={styles.verdict}>{parts.verdict}</div>}
      <div className={styles.paneBottom}>
        {confirming ? (
          <div className={styles.confirm} role="group" aria-label="Replace">
            <span>Replace your drawing with a new picture?</span>
            <div className={styles.confirmButtons}>
              <MuiButton
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => setConfirming(false)}
              >
                Keep drawing
              </MuiButton>
              <MuiButton
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  setConfirming(false);
                  parts.generate();
                }}
              >
                Replace
              </MuiButton>
            </div>
          </div>
        ) : result ? (
          <>
            <MuiButton
              variant="outlined"
              color="secondary"
              disabled={parts.busy}
              onClick={parts.changeWords}
            >
              Change words
            </MuiButton>
            <MuiButton
              variant="contained"
              color="primary"
              className={styles.generateButton}
              startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
              disabled={parts.busy || parts.exhausted}
              onClick={generate}
            >
              Generate again
            </MuiButton>
          </>
        ) : (
          <MuiButton
            variant="contained"
            color="primary"
            className={classNames(
              styles.generateButton,
              parts.complete && !parts.busy && !parts.exhausted && styles.ready
            )}
            startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
            disabled={!parts.complete || parts.busy || parts.exhausted}
            onClick={generate}
          >
            {generating ? 'Generating…' : 'Generate'}
          </MuiButton>
        )}
        {onDraw && !generating && !confirming && (
          <MuiButton
            variant="outlined"
            color="secondary"
            className={styles.drawButton}
            startIcon={<FontAwesomeV6Icon iconName="pencil" aria-hidden />}
            disabled={parts.busy}
            onClick={onDraw}
          >
            {drawLabel}
          </MuiButton>
        )}
      </div>
    </section>
  );
};

export default MakePane;
