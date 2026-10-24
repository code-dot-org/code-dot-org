import {Button, Typography} from '@mui/material';
import classNames from 'classnames';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {Curriculum} from '@/config/curricula';

import AppHeader from './AppHeader';

import styles from './congratulations.module.scss';
import screen from './screen.module.scss';

interface CongratulationsProps {
  /** The finished curriculum; undefined when the app could not tell which. */
  curriculum: Curriculum | undefined;
  onTryAgain: (curriculum: Curriculum) => void;
  onChooseAnother: () => void;
}

/** Shown in place of the site's certificate page when a curriculum is finished. */
export default function Congratulations({
  curriculum,
  onTryAgain,
  onChooseAnother,
}: CongratulationsProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={screen.page}>
      <AppHeader logoIsHeading={false} />
      <main className={screen.main}>
        {curriculum && !imageFailed && (
          <div
            className={classNames(
              styles.image,
              curriculum.image.fit === 'contain' && styles.imageContain,
            )}
          >
            <img
              src={curriculum.image.src}
              alt=""
              onError={() => setImageFailed(true)}
            />
          </div>
        )}
        <Typography variant="h2" component="h1" className={styles.heading}>
          Congratulations!
        </Typography>
        <Typography variant="body1" className={styles.message}>
          {curriculum ? (
            <>
              You finished <strong>{curriculum.title}</strong>.
            </>
          ) : (
            'You finished the curriculum.'
          )}
        </Typography>
        <div className={screen.actions}>
          {curriculum && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={
                <FontAwesomeV6Icon iconName="arrow-rotate-right" aria-hidden />
              }
              onClick={() => onTryAgain(curriculum)}
            >
              Try again
            </Button>
          )}
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<FontAwesomeV6Icon iconName="house" aria-hidden />}
            onClick={onChooseAnother}
          >
            Choose another curriculum
          </Button>
        </div>
      </main>
    </div>
  );
}
