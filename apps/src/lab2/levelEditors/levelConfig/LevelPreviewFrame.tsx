// The lab, running the level with the settings being edited, in a frame on
// the level edit page. It is drawn at a laptop's size and scaled down to
// fit, and it pins to the corner of the window once its place on the page
// scrolls out of view, as the preview in the panels editor
// (EditPanels.tsx) does.

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {
  PREVIEW_CONFIG,
  PREVIEW_GO,
  PREVIEW_PARAM,
  PREVIEW_PLACES,
  PREVIEW_READY,
  PreviewPlace,
} from './levelPreview';

import styles from './level-preview-frame.module.scss';

// The size the lab is drawn at inside the frame.
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 800;
// How long the settings must stay unchanged before they are sent and the
// lab starts over with them.
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
  const [places, setPlaces] = useState<PreviewPlace[]>([]);
  const [pinned, setPinned] = useState(false);
  const [slotWidth, setSlotWidth] = useState(640);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow
      ) {
        return;
      }
      if (event.data?.type === PREVIEW_READY) {
        setReady(true);
      } else if (
        event.data?.type === PREVIEW_PLACES &&
        Array.isArray(event.data.places)
      ) {
        setPlaces(event.data.places);
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
        The level as these settings run it. It starts over each time the
        settings change, and nothing done in it is saved.
        {!valid && ' The preview waits until the settings are valid.'}
      </p>
      {places.length > 0 && (
        <SimpleDropdown
          name="level-preview-place"
          labelText="Go to"
          size="s"
          items={[
            {value: '', text: 'Choose a place'},
            ...places.map(place => ({value: place.id, text: place.label})),
          ]}
          selectedValue=""
          onChange={event =>
            event.target.value &&
            frameRef.current?.contentWindow?.postMessage(
              {type: PREVIEW_GO, place: event.target.value},
              window.location.origin
            )
          }
        />
      )}
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
