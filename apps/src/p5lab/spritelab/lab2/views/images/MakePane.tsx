// The tab's right column: the sentence scene's controls, laid out as a thin
// pane beside the frame.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {
  imageKindNoun,
  imageKindPhrase,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {SentenceSceneParts} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/SentenceScene';

import styles from './images-tab.module.scss';

interface MakePaneProps {
  parts: SentenceSceneParts;
  /** Width in px; it equals the preview column's width so the pane sits
      under that column's header. */
  width: number;
  /** An image stands in the frame; a new picture would take its place, so
      Generate asks for confirmation first. */
  replaces?: boolean;
  /** Open the drawing tools; absent where drawing is not offered. */
  onDraw?: () => void;
  /** The drawing button's text. */
  drawLabel?: string;
  /** The drawing button's icon; a pencil unless given. */
  drawIcon?: string;
  /** The drawing button is shown but cannot be pressed yet. */
  drawDisabled?: boolean;
  /** The image was made by AI and is unedited: generating makes it again. */
  regenerate?: boolean;
  /** The student has drawn on the image since it was generated. */
  editedByHand?: boolean;
  /** Extra controls for the header, placed after the Behind the scenes
      button. */
  extra?: React.ReactNode;
}

const MakePane: React.FunctionComponent<MakePaneProps> = ({
  parts,
  width,
  replaces,
  onDraw,
  drawLabel = 'Draw my own',
  drawIcon = 'pencil',
  drawDisabled,
  regenerate,
  editedByHand,
  extra,
}) => {
  const [confirming, setConfirming] = useState(false);
  const result = parts.mode === 'result';
  const generating = parts.mode === 'generating';
  const kindNoun = imageKindNoun(parts.draft.imageType, parts.draft.subject);
  const kindPhrase = imageKindPhrase(
    parts.draft.imageType,
    parts.draft.subject
  );
  // The first generation over an existing image asks for confirmation.
  // After a picture has been generated in this session the next one
  // replaces it without asking. A picture the student has drawn on always
  // asks, a new drawing included: a new picture would replace their
  // drawing too.
  const asksFirst = (!!replaces && !parts.frameFilled) || !!editedByHand;
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
            {result || regenerate
              ? `Regenerate this ${kindNoun}`
              : `Generate ${kindPhrase}`}
          </p>
          <div className={styles.paneHeaderTools}>
            {parts.behindTheScenes}
            {extra}
          </div>
        </div>
      )}
      <div className={styles.sentencePanel}>{parts.sentence}</div>
      {/* The word menus scroll in a box of their own between the pinned
          sentence and the Animated switch; while a picture is made there
          are no words to show, so no box either. */}
      {!generating && (
        <div className={styles.paneScroll}>{parts.wordChooser}</div>
      )}
      {/* The error message sits outside the scrolling box of words, so it
          is visible however far the words are scrolled. */}
      {parts.error}
      {parts.animatedChoice}
      <div className={styles.paneBottom}>
        <MuiButton
          variant={result || regenerate ? 'outlined' : 'contained'}
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
        {onDraw && !generating && !confirming && (
          <MuiButton
            variant="outlined"
            color="secondary"
            className={styles.drawButton}
            startIcon={<FontAwesomeV6Icon iconName={drawIcon} aria-hidden />}
            disabled={parts.busy || drawDisabled}
            onClick={onDraw}
          >
            {drawLabel}
          </MuiButton>
        )}
      </div>
      {confirming && (
        <Modal
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
