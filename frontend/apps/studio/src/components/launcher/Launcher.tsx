import {Button, Typography} from '@mui/material';
import classNames from 'classnames';
import {useEffect, useRef, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';

import type {Curriculum} from '@/config/curricula';

import AppHeader from './AppHeader';

import styles from './launcher.module.scss';

interface LauncherProps {
  curricula: readonly Curriculum[];
  onOpen: (curriculum: Curriculum) => void;
  /** The curriculum whose Try Now takes focus, as on return from its congratulations. */
  focusedCurriculumId?: string;
}

/** Signed-out home screen listing the curricula bundled into this build. */
export default function Launcher({
  curricula,
  onOpen,
  focusedCurriculumId,
}: LauncherProps) {
  return (
    <div className={styles.launcher}>
      {/* Card titles are h2. */}
      <AppHeader logoIsHeading showPrivacyPolicy />
      <main className={styles.main}>
        <ul className={styles.grid}>
          {curricula.map(curriculum => (
            <li key={curriculum.id}>
              <CurriculumCard
                curriculum={curriculum}
                onOpen={onOpen}
                focused={curriculum.id === focusedCurriculumId}
              />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

interface CurriculumCardProps {
  curriculum: Curriculum;
  onOpen: (curriculum: Curriculum) => void;
  focused: boolean;
}

/**
 * A card as the "Amazon Fire Kids Screen" design draws it: image, category,
 * title, ages and Try Now. Try Now is the card's one interactive element; its
 * tap area is stretched over the whole card in CSS, so a tap anywhere opens
 * the curriculum.
 */
function CurriculumCard({curriculum, onOpen, focused}: CurriculumCardProps) {
  const {title, image, category, ages} = curriculum;
  const [imageFailed, setImageFailed] = useState(false);
  const tryNowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focused) {
      tryNowRef.current?.focus();
    }
  }, [focused]);

  return (
    <div className={styles.card}>
      <div
        className={classNames(
          styles.image,
          image.fit === 'contain' && styles.imageContain,
        )}
      >
        {imageFailed ? (
          <span className={styles.imageFallback} aria-hidden="true">
            {title.charAt(0)}
          </span>
        ) : (
          <img src={image.src} alt="" onError={() => setImageFailed(true)} />
        )}
      </div>
      <div className={styles.info}>
        <Tags className={styles.tags} size="s" tagsList={[{label: category}]} />
        <Typography variant="h6" component="h2" className={styles.title}>
          {title}
        </Typography>
        <div className={styles.ages}>
          <FontAwesomeV6Icon iconName="user" iconStyle="solid" />
          <p>Ages {ages}</p>
        </div>
        <Button
          ref={tryNowRef}
          variant="contained"
          color="primary"
          size="extraSmall"
          className={styles.tryNow}
          aria-label={`Try Now: ${title}`}
          onClick={() => onOpen(curriculum)}
        >
          Try Now
        </Button>
      </div>
    </div>
  );
}
