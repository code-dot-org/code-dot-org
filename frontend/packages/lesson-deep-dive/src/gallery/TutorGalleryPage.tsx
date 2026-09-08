import {FC, useEffect, useState} from 'react';

import {useApiClient} from '@code-dot-org/core/api';

import {getTutorGalleryData} from './api';
import ChallengeGallery from './ChallengeGallery';
import {TutorGalleryData} from './types';

import styles from './challenge-gallery.module.scss';

interface TutorGalleryPageProps {
  script: string;
  lessonPosition: number;
}

const TutorGalleryPage: FC<TutorGalleryPageProps> = ({
  script,
  lessonPosition,
}) => {
  const api = useApiClient();
  const [data, setData] = useState<TutorGalleryData | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTutorGalleryData(api.transport, script, lessonPosition)
      .then(value => {
        if (!cancelled) {
          setData(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [script, lessonPosition, api]);

  if (data === null && !loadFailed) {
    return (
      <div className={styles.page} data-theme="Dark">
        <main className={styles.main}>
          <p className={styles.statusText}>Loading projects…</p>
        </main>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className={styles.page} data-theme="Dark">
        <main className={styles.main}>
          <p className={styles.statusText}>
            We couldn&apos;t load the gallery. Try refreshing the page.
          </p>
        </main>
      </div>
    );
  }

  return <ChallengeGallery tutorGalleryData={data} />;
};

export default TutorGalleryPage;
