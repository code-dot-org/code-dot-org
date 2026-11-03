// The tab's right column: the sentence scene's controls, laid out as a thin
// pane beside the frame.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
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
  /** An image stands in the frame; a new picture would take its place, so
      Generate asks first. */
  replaces?: boolean;
  /** Open the drawing tools; absent where drawing is not offered. */
  onDraw?: () => void;
  /** The drawing button's text. */
  drawLabel?: string;
  /** The image was made by AI and is unedited: generating makes it again. */
  regenerate?: boolean;
}

const MakePane: React.FunctionComponent<MakePaneProps> = ({
  parts,
  width,
  replaces,
  onDraw,
  drawLabel = 'Draw my own',
  regenerate,
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
      {/* The words scroll between the pinned sentence and buttons. */}
      <div className={styles.paneScroll}>
        {parts.wordChooser}
        {parts.animatedChoice}
        {parts.error}
        {parts.verdict && <div className={styles.verdict}>{parts.verdict}</div>}
      </div>
      <div className={styles.paneBottom}>
        {result ? (
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
              variant="outlined"
              color="primary"
              startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
              disabled={parts.busy || parts.exhausted}
              onClick={generate}
            >
              Regenerate
            </MuiButton>
          </>
        ) : (
          <MuiButton
            variant={regenerate ? 'outlined' : 'contained'}
            color="primary"
            className={classNames(
              !regenerate && styles.generateButton,
              !regenerate &&
                parts.complete &&
                !parts.busy &&
                !parts.exhausted &&
                styles.ready
            )}
            startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
            disabled={!parts.complete || parts.busy || parts.exhausted}
            onClick={generate}
          >
            {generating
              ? 'Generating…'
              : regenerate
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
