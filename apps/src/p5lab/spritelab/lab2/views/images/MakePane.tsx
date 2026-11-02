// The tab's right column: the sentence scene's controls, laid out as a thin
// pane beside the frame.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {imageKindLabel} from '../../ai/images/types';
import {SentenceSceneParts} from '../sentence/SentenceScene';

import styles from './images-tab.module.scss';

interface MakePaneProps {
  parts: SentenceSceneParts;
  /** The pane's width, px: the preview column's. */
  width: number;
  /** An image stands in the frame; a new picture would take its place, so
      Generate asks first. */
  replaces?: boolean;
  /** Open the drawing tools; absent where drawing is not offered. */
  onDraw?: () => void;
  /** The drawing button's text. */
  drawLabel?: string;
  /** The image was made by AI and is unedited: generating makes it again. */
  regenerate?: boolean;
  /** More for the header, after the way behind the scenes. */
  extra?: React.ReactNode;
}

const MakePane: React.FunctionComponent<MakePaneProps> = ({
  parts,
  width,
  replaces,
  onDraw,
  drawLabel = 'Draw my own',
  regenerate,
  extra,
}) => {
  const [confirming, setConfirming] = useState(false);
  const result = parts.mode === 'result';
  const generating = parts.mode === 'generating';
  const kindLabel = imageKindLabel(
    parts.draft.imageType,
    parts.draft.subject
  ).toLowerCase();
  const article = /^[aeiou]/.test(kindLabel) ? 'an' : 'a';
  // The first generation over an existing image asks; once a picture has
  // landed in this sitting, the next one just replaces it.
  const asksFirst = !!replaces && !parts.frameFilled;
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
        <div className={styles.paneHeader}>
          <p className={styles.headline}>
            {result || regenerate ? (
              `Regenerate this ${kindLabel}`
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
          <span className={styles.paneHeaderTools}>
            {parts.underFrame}
            {extra}
          </span>
        </div>
      )}
      <div className={styles.sentencePanel}>{parts.sentence}</div>
      {/* The words scroll in a frame of their own between the pinned
          sentence and the Animated switch; while a picture is made there
          are no words to show, so no frame either. */}
      {!generating && (
        <div className={styles.paneScroll}>
          {parts.wordChooser}
          {parts.error}
        </div>
      )}
      {parts.animatedChoice}
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
        ) : (
          <MuiButton
            variant={regenerate ? 'outlined' : 'contained'}
            color="primary"
            startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
            disabled={!parts.complete || parts.busy || parts.exhausted}
            onClick={generate}
          >
            {generating
              ? 'Generating…'
              : result || regenerate
              ? 'Regenerate'
              : 'Generate'}
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
      {confirming && (
        <MuiDialog
          title="Replace this image?"
          description="A new picture takes its place."
          onClose={() => setConfirming(false)}
          secondaryButtonProps={{
            children: 'Cancel',
            onClick: () => setConfirming(false),
          }}
          primaryButtonProps={{
            children: 'Replace',
            onClick: () => {
              setConfirming(false);
              parts.generate();
            },
          }}
        />
      )}
    </section>
  );
};

export default MakePane;
