// The lab, running the level with the settings being edited, in a frame on
// the level edit page. It is drawn at a laptop's size and scaled down to
// fit, and it pins to the corner of the window once its place on the page
// scrolls out of view, as the panels preview does.

import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {PREVIEW_CONFIG, PREVIEW_PARAM, PREVIEW_READY} from './levelPreview';

import styles from './level-preview-frame.module.scss';

// The size the lab is drawn at inside the frame.
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 800;
// How long the settings rest before the lab starts over with them.
const SEND_DELAY_MS = 500;
const PINNED_WIDTH_VW = 34;

interface LevelPreviewFrameProps {
  /** The level's page, e.g. "/levels/123". */
  levelUrl: string;
  value: unknown;
  /** Whether the value is valid; an invalid one is not sent. */
  valid: boolean;
}

const LevelPreviewFrame: React.FunctionComponent<LevelPreviewFrameProps> = ({
  levelUrl,
  value,
  valid,
}) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [slotWidth, setSlotWidth] = useState(640);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frameRef.current?.contentWindow &&
        event.data?.type === PREVIEW_READY
      ) {
        setReady(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!ready || !valid) {
      return;
    }
    const timer = window.setTimeout(
      () =>
        frameRef.current?.contentWindow?.postMessage(
          {type: PREVIEW_CONFIG, config: value},
          window.location.origin
        ),
      SEND_DELAY_MS
    );
    return () => window.clearTimeout(timer);
  }, [ready, valid, value]);

  // A scroll listener, not position: sticky, which the edit page's
  // collapsing sections defeat.
  useEffect(() => {
    const measure = () => {
      const slot = slotRef.current;
      if (!slot) {
        return;
      }
      const box = slot.getBoundingClientRect();
      // Pinned once the slot has scrolled up past the top of the window.
      setPinned(box.bottom < 0);
      setSlotWidth(box.width);
    };
    measure();
    window.addEventListener('scroll', measure, {passive: true});
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const width = pinned
    ? (window.innerWidth * PINNED_WIDTH_VW) / 100
    : slotWidth;
  const scale = width / FRAME_WIDTH;
  const separator = levelUrl.includes('?') ? '&' : '?';
  return (
    <div className={styles.preview}>
      <MuiTypography variant="h6" component="h3">
        Preview
      </MuiTypography>
      <p className={styles.help}>
        The level as these settings run it, starting from your own project for
        it each time the settings change. Nothing you do here is saved to the
        project.
        {!valid && ' The preview waits until the settings are valid.'}
      </p>
      <div
        ref={slotRef}
        className={styles.slot}
        style={{height: (FRAME_HEIGHT * slotWidth) / FRAME_WIDTH}}
      >
        <div
          className={classNames(styles.box, pinned && styles.pinned)}
          style={{width, height: FRAME_HEIGHT * scale}}
        >
          <iframe
            ref={frameRef}
            title="Level preview"
            className={styles.frame}
            src={`${levelUrl}${separator}${PREVIEW_PARAM}=1`}
            style={{
              width: FRAME_WIDTH,
              height: FRAME_HEIGHT,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LevelPreviewFrame;
