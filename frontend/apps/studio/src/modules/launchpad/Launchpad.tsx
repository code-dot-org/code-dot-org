import {Capacitor} from '@capacitor/core';
import {Button, Typography} from '@mui/material';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
  type MouseEvent,
} from 'react';

import {ACTIVITIES} from '@/modules/launchpad/activities';
import {openActivity} from '@/modules/launchpad/openActivity';

import styles from './Launchpad.module.scss';

export default function Launchpad(): JSX.Element {
  const native = Capacitor.isNativePlatform();
  const [opening, setOpening] = useState<string | null>(null);
  const [error, setError] = useState('');
  const openingRef = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (opening === null) triggerRef.current?.focus();
  }, [opening]);

  const handleOpen = useCallback(async (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (openingRef.current) return;
    const trigger = event.currentTarget;
    const activity = ACTIVITIES.find(
      entry => entry.id === trigger.dataset.activityId,
    );
    if (!activity) return;

    openingRef.current = true;
    triggerRef.current = trigger;
    setOpening(activity.id);
    setError('');
    try {
      await openActivity(activity);
    } catch {
      setError('We could not open that activity. Please try again.');
    } finally {
      openingRef.current = false;
      setOpening(null);
    }
  }, []);

  return (
    <main className={styles.launchpad}>
      <header className={styles.intro}>
        <Typography variant="body2" className={styles.brand}>
          CodeAI
        </Typography>
        <Typography variant="h3" component="h1">
          Choose an activity
        </Typography>
        <Typography>Explore, create, and learn at your own pace.</Typography>
        {!native && (
          <Typography variant="body2" className={styles.preview}>
            Browser preview: activities open in a new tab. Use the installed app
            to try the embedded activity view.
          </Typography>
        )}
      </header>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <ul className={styles.activities} aria-label="Activities">
        {ACTIVITIES.map(activity => (
          <li key={activity.id} className={styles.card}>
            <article>
              <Typography variant="body2" className={styles.kind}>
                {activity.kind} · Ages {activity.ages}
              </Typography>
              <Typography variant="h5" component="h2">
                {activity.title}
              </Typography>
              <Typography className={styles.description}>
                {activity.description}
              </Typography>
              <Button
                variant="contained"
                href={activity.url}
                data-activity-id={activity.id}
                aria-label={`Start ${activity.title}`}
                disabled={opening !== null}
                {...(native
                  ? {onClick: handleOpen}
                  : {target: '_blank', rel: 'noopener noreferrer'})}
                className={styles.start}
              >
                {opening === activity.id ? 'Opening…' : 'Start activity'}
              </Button>
            </article>
          </li>
        ))}
      </ul>
      <Typography variant="body2" role="status" className={styles.status}>
        {opening
          ? 'Use Home in the activity view to choose another activity.'
          : 'An internet connection is needed to play.'}
      </Typography>
    </main>
  );
}
