// Under the frame once a picture is back: a link that opens a panel with
// the words the model got, and for a set a second tab with the words every
// posed frame shared.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Popover from '@code-dot-org/component-library/popover';
import React, {useLayoutEffect, useRef, useState} from 'react';

import {POSE_MARK, SentPrompts} from './sentPrompts';

import styles from './behind-the-scenes.module.scss';

const TITLE = 'Behind the scenes';

interface BehindTheScenesProps {
  sent: SentPrompts;
  disabled?: boolean;
}

const BehindTheScenes: React.FunctionComponent<BehindTheScenesProps> = ({
  sent,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'picture' | 'poses'>('picture');
  const linkRef = useRef<HTMLButtonElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  // The panel opens above the link, capped so it never covers the whole
  // picture: the words inside scroll instead.
  const [room, setRoom] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const measure = () => {
      const row = rowRef.current;
      if (row) {
        setRoom(
          Math.min(420, Math.max(200, row.getBoundingClientRect().top - 16))
        );
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        linkRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('resize', measure);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      className={styles.underFrame}
      ref={rowRef}
      style={
        room === null
          ? undefined
          : ({'--prompt-room': `${room}px`} as React.CSSProperties)
      }
    >
      <button
        type="button"
        ref={linkRef}
        className={styles.promptLink}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          setTab('picture');
          setOpen(current => !current);
        }}
      >
        <FontAwesomeV6Icon iconName="circle-info" />
        {TITLE}
      </button>
      {open && (
        <Popover
          direction="none"
          title={TITLE}
          content="We sent the AI these words. It predicted a picture to match them."
          className={styles.promptPopover}
          onClose={() => setOpen(false)}
        >
          {sent.poses && (
            <div
              className={styles.promptTabs}
              role="tablist"
              aria-label="Which words"
            >
              {(
                [
                  ['picture', 'First picture'],
                  ['poses', 'Other poses'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`explore-prompt-tab-${id}`}
                  aria-selected={tab === id}
                  aria-controls="explore-prompt-panel"
                  className={styles.promptTab}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {sent.poses && tab === 'poses' ? (
            <>
              <p className={styles.promptNote}>
                Then, for each pose, we sent the first picture back with these
                words. Only the part in brackets changed.
              </p>
              <div
                id="explore-prompt-panel"
                className={styles.promptText}
                role="tabpanel"
                aria-labelledby="explore-prompt-tab-poses"
              >
                <p className={styles.promptCommon}>
                  {sent.poses.common.split(POSE_MARK).flatMap((piece, i) =>
                    i === 0
                      ? [piece]
                      : [
                          <mark key={i} className={styles.poseMark}>
                            {POSE_MARK}
                          </mark>,
                          piece,
                        ]
                  )}
                </p>
                <ul className={styles.poseList}>
                  {sent.poses.frames.map(frame => (
                    <li key={frame.label}>
                      <span className={styles.poseLabel}>{frame.label}:</span>{' '}
                      {frame.pose}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p
              id="explore-prompt-panel"
              className={styles.promptText}
              role="tabpanel"
              aria-labelledby={
                sent.poses ? 'explore-prompt-tab-picture' : undefined
              }
            >
              {sent.picture}
            </p>
          )}
        </Popover>
      )}
    </div>
  );
};

export default BehindTheScenes;
