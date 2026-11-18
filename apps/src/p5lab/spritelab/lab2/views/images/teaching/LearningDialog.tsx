// How the picture came to be, told over a few panels after a student's
// first picture on a level that asks: nothing closes that telling but
// reading to the end. A telling the student asked for closes like any
// dialog. The copy differs for a character and for a background.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {ImageType} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import anotherArt from '@cdo/static/spritelab_lab2/learning/another.svg';
import evaluateArt from '@cdo/static/spritelab_lab2/learning/evaluate.svg';
import flowerCardArt from '@cdo/static/spritelab_lab2/learning/flower-card.svg';
import learnedArt from '@cdo/static/spritelab_lab2/learning/learned.svg';
import wordsArt from '@cdo/static/spritelab_lab2/learning/words.svg';

import ChunkyPicture, {PictureCrop} from './ChunkyPicture';

import styles from './learning-dialog.module.scss';

export interface LearningPicture {
  src: string;
  /** Unset shows the whole image. */
  crop?: PictureCrop;
}

interface LearningDialogProps {
  picture: LearningPicture;
  /** The prompt the student built. */
  prompt: string;
  /** What the picture is of: a background gets its own telling. */
  imageType: ImageType;
  onDone: () => void;
  /** Closes the story unread; without it, only Got it ends it. */
  onClose?: () => void;
}

const TITLE = 'How AI made your image';
// Cells across the picture at each stage of the guess.
const GUESS_STAGES = [4, 12] as const;
// Dots across the noise the guess starts from.
const NOISE_CELLS = 12;

// The icons the copy names in brackets, by the name in the UI.
const ICONS: Record<string, {iconName: string; label: string}> = {
  'thumb up': {iconName: 'thumbs-up', label: 'thumbs up'},
  'thumb down': {iconName: 'thumbs-down', label: 'thumbs down'},
};

/** The copy's *bold* runs and [icon] names as elements. */
export function richText(text: string): React.ReactNode[] {
  return text.split(/(\*[^*]+\*|\[[^\]]+\])/).map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={i}>{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('[') && part.endsWith(']')) {
      const icon = ICONS[part.slice(1, -1)];
      return icon ? (
        <FontAwesomeV6Icon
          key={i}
          iconName={icon.iconName}
          className={styles.inlineIcon}
          title={icon.label}
          aria-label={icon.label}
          role="img"
        />
      ) : (
        part
      );
    }
    return part;
  });
}

/** Random dots and colors: where the guess starts. */
const Noise: React.FunctionComponent = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = ref.current?.getContext('2d');
    if (!context) {
      return;
    }
    for (let y = 0; y < NOISE_CELLS; y++) {
      for (let x = 0; x < NOISE_CELLS; x++) {
        context.fillStyle = `hsl(${Math.random() * 360} 60% ${
          40 + Math.random() * 40
        }%)`;
        context.fillRect(x, y, 1, 1);
      }
    }
  }, []);
  return (
    <canvas
      ref={ref}
      width={NOISE_CELLS}
      height={NOISE_CELLS}
      className={styles.noise}
      aria-hidden
    />
  );
};

interface PanelContent {
  heading: string;
  body: string;
  visual: (picture: LearningPicture, prompt: string) => React.ReactNode;
}

/** One of the designer's drawings, filling the panel's picture area. */
const drawing = (src: string) => () =>
  <img src={src} alt="" className={styles.drawing} />;

const words = (_: LearningPicture, prompt: string) => (
  <>
    <img src={wordsArt} alt="" className={styles.drawing} />
    <MuiTypography component="p" variant="h5" className={styles.words}>
      <span className={styles.wordsText}>“{prompt}”</span>
    </MuiTypography>
  </>
);

const noiseToPicture = (picture: LearningPicture) => (
  <div className={styles.stages}>
    <span className={styles.frame}>
      <Noise />
    </span>
    {GUESS_STAGES.map(cells => (
      <span key={cells} className={styles.frame}>
        <ChunkyPicture src={picture.src} cells={cells} crop={picture.crop} />
      </span>
    ))}
    <span className={styles.frame}>
      <ChunkyPicture src={picture.src} crop={picture.crop} />
    </span>
  </div>
);

// A character's card beside the background's frame: about twice the side,
// four times the pixels.
const sizes = (picture: LearningPicture) => (
  <div className={styles.sizes}>
    <img src={flowerCardArt} alt="" className={styles.sizeSmall} />
    <span className={classNames(styles.frame, styles.sizeLarge)}>
      <ChunkyPicture src={picture.src} crop={picture.crop} />
    </span>
  </div>
);

const CHARACTER_PANELS: PanelContent[] = [
  {
    heading: 'AI learned from examples',
    body: 'During *training*, the AI learned patterns from pictures and their descriptions.',
    visual: drawing(learnedArt),
  },
  {
    heading: 'Your words guide the image',
    body: 'This AI started with some instructions, then added your words. Your prompt helps guide what the AI makes.',
    visual: words,
  },
  {
    heading: 'From noise to picture',
    body: 'The AI starts with random dots and colors, then changes them step by step, guided by your words.',
    visual: noiseToPicture,
  },
  {
    heading: 'Try another version',
    body: 'Select Regenerate. The result can be different, even with the same prompt.',
    visual: drawing(anotherArt),
  },
  {
    heading: 'Evaluate what the AI made',
    body: 'Does the result match your prompt? Look closely, then rate it.',
    visual: drawing(evaluateArt),
  },
];

const BACKGROUND_PANELS: PanelContent[] = [
  {
    heading: 'A background is a big job',
    body: 'Here, backgrounds have many more *pixels*, or tiny squares of color, than characters, objects, or blocks. Together, they form one scene.',
    visual: sizes,
  },
  {
    heading: 'AI learned from examples',
    body: 'Before you ever used it, the AI was *trained* on many example pictures. It learned patterns from many pictures and the words describing them.',
    visual: drawing(learnedArt),
  },
  {
    heading: 'Your words guide the image',
    body: 'Your *prompt* is the words you give AI to describe the picture you want.',
    visual: words,
  },
  {
    heading: 'From noise to picture',
    body: 'The AI starts with random dots and colors, then changes them step by step, guided by your words.',
    visual: noiseToPicture,
  },
  {
    heading: 'Try another picture',
    body: 'Select *Regenerate*. The picture can be different, even with the same prompt.',
    visual: drawing(anotherArt),
  },
  {
    heading: 'Evaluate the picture',
    body: 'Look closely. Does it match what you asked for? Then use [thumb up] or [thumb down] to rate it.',
    visual: drawing(evaluateArt),
  },
];

/** The panels for a picture of the type. */
export function panelsFor(imageType: ImageType): PanelContent[] {
  return imageType === 'background' ? BACKGROUND_PANELS : CHARACTER_PANELS;
}

const LearningDialog: React.FunctionComponent<LearningDialogProps> = ({
  picture,
  prompt,
  imageType,
  onDone,
  onClose,
}) => {
  const [index, setIndex] = useState(0);
  const panels = panelsFor(imageType);
  const onLastPanel = index === panels.length - 1;
  const panel = panels[index];
  return (
    <Modal
      title={TITLE}
      className={styles.dialog}
      onClose={onClose}
      customContent={
        <>
          <span id="dsco-dialog-description" className={styles.srOnly}>
            {panels.length} short panels on how the AI made your picture. Next
            moves on; Got it closes.
          </span>
          <div key={index} className={styles.panel}>
            <div className={styles.visual}>{panel.visual(picture, prompt)}</div>
            {/* Every panel's words are laid out, and only this panel's
                show, so the dialog keeps the height of its tallest panel. */}
            <div className={styles.copyStack}>
              {panels.map((each, i) => (
                <div
                  key={i}
                  className={classNames(
                    styles.copy,
                    i !== index && styles.copyHidden
                  )}
                  aria-hidden={i !== index || undefined}
                >
                  <MuiTypography
                    component="h4"
                    variant="h4"
                    className={styles.heading}
                  >
                    {each.heading}
                  </MuiTypography>
                  <MuiTypography
                    component="p"
                    variant="body1"
                    className={styles.text}
                  >
                    {richText(each.body)}
                  </MuiTypography>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.dots} aria-hidden>
            {panels.map((_, i) => (
              <span
                key={i}
                className={classNames(styles.dot, i === index && styles.dotNow)}
              />
            ))}
          </div>
          <span className={styles.srOnly} role="status">
            Step {index + 1} of {panels.length}
          </span>
        </>
      }
      secondaryButtonProps={
        index > 0
          ? {children: 'Back', onClick: () => setIndex(i => i - 1)}
          : undefined
      }
      primaryButtonProps={{
        children: onLastPanel ? 'Got it' : 'Next',
        onClick: () => (onLastPanel ? onDone() : setIndex(i => i + 1)),
      }}
    />
  );
};

export default LearningDialog;
