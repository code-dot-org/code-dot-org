// Under the frame once a picture is back: a link to a panel with the words
// the model got, and for a set a second tab with the posed frames' words.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Popover from '@code-dot-org/component-library/popover';
import React, {useLayoutEffect, useRef, useState} from 'react';

import {POSE_MARK, SentPrompts} from './sentPrompts';

import styles from './behind-the-scenes.module.scss';

const TITLE = 'Behind the scenes';
// The panel's height: the space above the link, within these bounds.
const MAX_PANEL_HEIGHT_PX = 420;
const MIN_PANEL_HEIGHT_PX = 200;
const PANEL_TOP_MARGIN_PX = 16;
const TABS = [
  ['picture', 'First picture'],
  ['poses', 'Other poses'],
] as const;
type Tab = (typeof TABS)[number][0];
// Pose names as students read them.
const POSE_NAMES: Record<string, string> = {idling: 'standing'};
const PANEL_ID = 'explore-prompt-popover';

interface BehindTheScenesProps {
  sent: SentPrompts;
  disabled?: boolean;
}

const BehindTheScenes: React.FunctionComponent<BehindTheScenesProps> = ({
  sent,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('picture');
  const linkRef = useRef<HTMLButtonElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const close = () => {
    setOpen(false);
    linkRef.current?.focus();
  };
  // Left and right arrows move between the two tabs.
  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      return;
    }
    e.preventDefault();
    const next: Tab = tab === 'picture' ? 'poses' : 'picture';
    setTab(next);
    document.getElementById(`explore-prompt-tab-${next}`)?.focus();
  };
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const measure = () => {
      const row = rowRef.current;
      if (row) {
        setPanelHeight(
          Math.min(
            MAX_PANEL_HEIGHT_PX,
            Math.max(
              MIN_PANEL_HEIGHT_PX,
              row.getBoundingClientRect().top - PANEL_TOP_MARGIN_PX
            )
          )
        );
      }
    };
    measure();
    // Focus moves into the panel: its first tab, or its close button.
    const row = rowRef.current;
    (
      row?.querySelector<HTMLElement>('[role="tab"]') ??
      row?.querySelector<HTMLElement>('button[aria-label="Close"]')
    )?.focus();
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
        panelHeight === null
          ? undefined
          : ({
              '--prompt-panel-height': `${panelHeight}px`,
            } as React.CSSProperties)
      }
    >
      <button
        type="button"
        ref={linkRef}
        className={styles.promptLink}
        aria-expanded={open}
        aria-controls={open ? PANEL_ID : undefined}
        disabled={disabled}
        onClick={() => {
          setTab('picture');
          setOpen(current => !current);
        }}
      >
        <FontAwesomeV6Icon iconName="circle-info" aria-hidden />
        {TITLE}
      </button>
      {open && (
        <Popover
          id={PANEL_ID}
          role="dialog"
          aria-label={TITLE}
          direction="none"
          title={TITLE}
          content="We sent the AI these words. It made a picture to match them."
          className={styles.promptPopover}
          onClose={close}
        >
          {sent.poses && (
            <div
              className={styles.promptTabs}
              role="tablist"
              aria-label="Which words"
            >
              {TABS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`explore-prompt-tab-${id}`}
                  aria-selected={tab === id}
                  aria-controls="explore-prompt-panel"
                  tabIndex={tab === id ? 0 : -1}
                  className={styles.promptTab}
                  onClick={() => setTab(id)}
                  onKeyDown={onTabKeyDown}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {sent.poses && tab === 'poses' ? (
            <div
              id="explore-prompt-panel"
              className={styles.promptText}
              role="tabpanel"
              aria-labelledby="explore-prompt-tab-poses"
              tabIndex={0}
            >
              <p className={styles.promptNote}>
                Then, for each pose, we sent the first picture back with these
                words. Only the part in brackets changed.
              </p>
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
                    <span className={styles.poseLabel}>
                      {POSE_NAMES[frame.label] ?? frame.label}:
                    </span>{' '}
                    {frame.pose}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p
              id="explore-prompt-panel"
              className={styles.promptText}
              role={sent.poses ? 'tabpanel' : undefined}
              aria-labelledby={
                sent.poses ? 'explore-prompt-tab-picture' : undefined
              }
              tabIndex={0}
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
