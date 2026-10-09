import {Button, Typography} from '@mui/material';
import classNames from 'classnames';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';

import AppHeader from './AppHeader';
import type {Curriculum} from './curricula';

import styles from './launcher.module.scss';

interface LauncherProps {
  curricula: readonly Curriculum[];
  onOpen: (curriculum: Curriculum) => void;
}

/** Signed-out home screen listing the curricula bundled into this build. */
export default function Launcher({curricula, onOpen}: LauncherProps) {
  return (
    <div className={styles.launcher}>
      {/* Card titles are h2. */}
      <AppHeader logoIsHeading />
      <main className={styles.main}>
        <ul className={styles.grid}>
          {curricula.map(curriculum => (
            <li key={curriculum.id}>
              <CurriculumCard curriculum={curriculum} onOpen={onOpen} />
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
}

/**
 * A card laid out like the course catalog's (CurriculumCatalogCard in apps/):
 * image, topic tags, title, description, grades, duration and Try Now. Try
 * Now is the card's one interactive element; its tap area is stretched over
 * the whole card in CSS, so a tap anywhere opens the curriculum.
 */
function CurriculumCard({curriculum, onOpen}: CurriculumCardProps) {
  const {title, description, image, topics, grades, duration} = curriculum;
  const [imageFailed, setImageFailed] = useState(false);

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
        <Tags
          className={styles.tags}
          tagsList={tagsFor(topics, curriculum.id)}
        />
        <Typography variant="h4" component="h2" className={styles.title}>
          {title}
        </Typography>
        <Typography variant="body3" className={styles.description}>
          {description}
        </Typography>
        <div className={styles.aspect}>
          <FontAwesomeV6Icon iconName="user" iconStyle="solid" />
          <p>{gradeLabel(grades)}</p>
        </div>
        {duration && (
          <div className={styles.aspect}>
            <FontAwesomeV6Icon iconName="clock" iconStyle="solid" />
            <p>Duration: {duration}</p>
          </div>
        )}
        <Button
          variant="contained"
          color="primary"
          size="medium"
          className={styles.tryNow}
          aria-label={`Try ${title} now`}
          onClick={() => onOpen(curriculum)}
        >
          Try Now
        </Button>
      </div>
    </div>
  );
}

/** The catalog shows the first topic and a "+N" tag holding the rest. */
function tagsFor(topics: string[], id: string) {
  if (topics.length === 0) {
    return [];
  }
  const [first, ...rest] = topics;
  const tags = [
    {label: first, tooltipContent: first, tooltipId: `${id}-topic`},
  ];
  if (rest.length > 0) {
    tags.push({
      label: `+${rest.length}`,
      tooltipContent: rest.join(', '),
      tooltipId: `${id}-more-topics`,
    });
  }
  return tags;
}

function gradeLabel(grades: string) {
  return grades.includes('-') ? `Grades: ${grades}` : `Grade: ${grades}`;
}
