// How the picture came to be, told once over a few panels after a student's
// first picture on a level that asks: nothing closes it but reading to the
// end. The copy differs for a character and for a background.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {ImageType} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

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
}

const TITLE = 'How AI made your image';
// Cells across the picture at each stage of the guess.
const GUESS_STAGES = [4, 12] as const;
// Pictures in the training mosaic, and the delay between one appearing and
// the next.
const MOSAIC_CELLS = 12;
const MOSAIC_STAGGER_MS = 90;
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

const mosaic = () => (
  <div className={styles.mosaic} aria-hidden>
    {Array.from({length: MOSAIC_CELLS}, (_, i) => (
      <span
        key={i}
        className={styles.mosaicCell}
        style={
          {'--cell-delay': `${i * MOSAIC_STAGGER_MS}ms`} as React.CSSProperties
        }
      >
        <FontAwesomeV6Icon iconName="image" />
      </span>
    ))}
  </div>
);

const words = (_: LearningPicture, prompt: string) => (
  <MuiTypography component="p" variant="h5" className={styles.words}>
    <span className={styles.quote}>“</span>
    {prompt}
    <span className={styles.quote}>”</span>
  </MuiTypography>
);

const noiseToPicture = (picture: LearningPicture) => (
  <div className={styles.stages}>
    <Noise />
    {GUESS_STAGES.map(cells => (
      <ChunkyPicture
        key={cells}
        src={picture.src}
        cells={cells}
        crop={picture.crop}
      />
    ))}
    <ChunkyPicture src={picture.src} crop={picture.crop} />
  </div>
);

const anotherGuess = (picture: LearningPicture) => (
  <div className={styles.guess}>
    <ChunkyPicture src={picture.src} crop={picture.crop} />
    <FontAwesomeV6Icon iconName="dice" className={styles.dice} aria-hidden />
  </div>
);

const evaluate = (picture: LearningPicture) => (
  <div className={styles.guess}>
    <ChunkyPicture src={picture.src} crop={picture.crop} />
    <span className={styles.thumbs} aria-hidden>
      <FontAwesomeV6Icon iconName="thumbs-up" />
      <FontAwesomeV6Icon iconName="thumbs-down" />
    </span>
  </div>
);

// A character's square beside the background's: twice the side, four times
// the pixels.
const sizes = (picture: LearningPicture) => (
  <div className={styles.sizes} aria-hidden>
    <span className={classNames(styles.sizeBox, styles.sizeSmall)} />
    <span className={classNames(styles.sizeBox, styles.sizeLarge)}>
      <ChunkyPicture src={picture.src} crop={picture.crop} />
    </span>
  </div>
);

const CHARACTER_PANELS: PanelContent[] = [
  {
    heading: 'AI learned from examples',
    body: 'During *training*, the AI learned patterns from pictures and their descriptions.',
    visual: mosaic,
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
    body: 'Click Generate again. The result can be different, even with the same prompt.',
    visual: anotherGuess,
  },
  {
    heading: 'Evaluate what the AI made',
    body: 'Does the result match your prompt? Look closely, then rate it.',
    visual: evaluate,
  },
];

const BACKGROUND_PANELS: PanelContent[] = [
  {
    heading: 'AI learned from examples',
    body: 'Before you ever used it, the AI was *trained* on many example pictures. It learned patterns from many pictures and the words describing them.',
    visual: mosaic,
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
    body: 'Click *Generate* again. The picture can be different, even with the same prompt.',
    visual: anotherGuess,
  },
  {
    heading: 'Evaluate the picture',
    body: 'Look closely. Does it match what you asked for? Then use [thumb up] or [thumb down] to rate it.',
    visual: evaluate,
  },
  {
    heading: 'A background is a big job',
    body: 'Here, backgrounds have four times as many *pixels*, or tiny squares of color, as characters, objects, or blocks. Together, they form one scene.',
    visual: sizes,
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
}) => {
  const [index, setIndex] = useState(0);
  const panels = panelsFor(imageType);
  const onLastPanel = index === panels.length - 1;
  const panel = panels[index];
  return (
    <MuiDialog
      title={TITLE}
      className={styles.dialog}
      customContent={
        <>
          <span id="dsco-dialog-description" className={styles.srOnly}>
            {panels.length} short panels on how the AI made your picture. Next
            moves on; Got it closes.
          </span>
          <div key={index} className={styles.panel}>
            <div className={styles.visual}>{panel.visual(picture, prompt)}</div>
            <MuiTypography
              component="h3"
              variant="h4"
              className={styles.heading}
            >
              {panel.heading}
            </MuiTypography>
            <MuiTypography
              component="p"
              variant="body1"
              className={styles.text}
            >
              {richText(panel.body)}
            </MuiTypography>
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
