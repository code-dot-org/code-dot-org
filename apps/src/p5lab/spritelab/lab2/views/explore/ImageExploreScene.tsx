// An image level laid out as two halves: the image on the left, the editing
// controls on the right. An exploration beside GenerateImagePane, reached
// by level_mode.imageUi or ?image-ui=explore; the pane is untouched.

import Checkbox from '@code-dot-org/component-library/checkbox';
import RadioButton from '@code-dot-org/component-library/radioButton';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import pixelSample from '@cdo/static/spritelab_lab2/style/pixel.png';
import smoothSample from '@cdo/static/spritelab_lab2/style/smooth.png';

import {
  IMAGE_STYLE_LABELS,
  ImageStyle,
  ImageSubject,
  ImageType,
} from '../../ai/images/types';

import styles from './image-explore.module.scss';

const STYLES: ImageStyle[] = ['pixel', 'smooth'];

interface ImageExploreSceneProps {
  imageType: ImageType;
  imageSubject?: ImageSubject;
  /** Style the controls start on. */
  defaultStyle: ImageStyle;
}

const ImageExploreScene: React.FunctionComponent<ImageExploreSceneProps> = ({
  imageType,
  imageSubject,
  defaultStyle,
}) => {
  const [style, setStyle] = useState<ImageStyle>(defaultStyle);
  const [animated, setAnimated] = useState(false);
  // Only a character can be animated; an object or a background is one
  // picture.
  const canAnimate = imageType === 'sprite' && imageSubject !== 'object';

  return (
    <div className={styles.scene}>
      <section className={styles.imagePane} aria-label="Your image">
        <div className={styles.imageFrame}>
          <MuiTypography variant="body2" className={styles.imageHint}>
            Your image will show here.
          </MuiTypography>
        </div>
      </section>
      <section className={styles.editPane} aria-label="Make your image">
        <div className={styles.group}>
          <fieldset className={styles.styleChoice}>
            <legend className={styles.groupLabel}>Style</legend>
            {STYLES.map(s => (
              <RadioButton
                key={s}
                name="explore-style"
                value={s}
                size="s"
                checked={style === s}
                onChange={() => setStyle(s)}
                className={styles.styleOption}
              >
                <img
                  src={s === 'pixel' ? pixelSample : smoothSample}
                  alt=""
                  className={classNames(
                    styles.styleSwatch,
                    s === 'pixel' && styles.pixelArt
                  )}
                />
                <MuiTypography variant="body3" component="span">
                  {IMAGE_STYLE_LABELS[s]}
                </MuiTypography>
              </RadioButton>
            ))}
          </fieldset>
          <div className={styles.sentenceSlot}>
            <MuiTypography variant="body2" className={styles.placeholder}>
              Pick the words for your character here.
            </MuiTypography>
          </div>
          <div className={styles.generateRow}>
            {canAnimate && (
              <Checkbox
                name="explore-animated"
                label="Make it move"
                size="s"
                checked={animated}
                onChange={e => setAnimated(e.target.checked)}
              />
            )}
            <MuiButton variant="contained" color="primary" disabled>
              Generate
            </MuiButton>
          </div>
        </div>
        <div className={styles.group}>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="large"
            className={styles.drawButton}
            disabled
          >
            I'll draw it myself
          </MuiButton>
        </div>
      </section>
    </div>
  );
};

export default ImageExploreScene;
