import {Button} from '@mui/material';
import classNames from 'classnames';
import {useCallback, useEffect, useRef, useState} from 'react';

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {PanelContainer} from '@code-dot-org/lab/components';

import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import styles from './worldPreview.module.css';

/**
 * Whether this browser will let us go fullscreen.
 *
 * `document.fullscreenEnabled` and not a check for the method: the method
 * exists in every browser this lab supports, and the question that actually has
 * two answers is whether fullscreen is PERMITTED here. It is not inside an
 * iframe that was embedded without `allow="fullscreen"` — which is how studio
 * may well embed this lab — and there the call rejects and nothing happens. A
 * button that does nothing when pressed is worse than no button, so there is
 * none.
 *
 * Read at render rather than once at module load, because jsdom and a real
 * browser disagree about it and a value captured at import time would decide
 * for both.
 */
const fullscreenAvailable = (): boolean =>
  typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);

/**
 * The World Lab preview pane: it mounts the sandbox's preview iframe (the game
 * canvas). The iframe itself is owned by the runtime's `WorldPreviewManager`
 * (which drives it via postMessage); this component only places it in the pane.
 * A slim `PanelContainer` header (matching the Console box) carries Fullscreen
 * on the left and Restart on the right — one hands the game the whole screen,
 * the other re-runs it from the start, and they are kept apart so neither is
 * pressed for the other.
 *
 * If no sandbox origin is configured, student code cannot run on the lab's own
 * origin, so we say so rather than render anything (SANDBOX.md). Pass one with
 * `?world-sandbox=` (the standalone demo defaults it to the `dev:sandbox` port).
 */
export const WorldPreview = () => {
  const {
    isConfigured,
    previewIframe,
    restart,
    status,
    setPreviewColors,
    focusPreview,
  } = useWorldRuntime();
  const containerRef = useRef<HTMLDivElement | null>(null);
  // THE PANEL, not the frame inside it. Fullscreening the game alone would
  // leave nothing on screen to press to get back — the browser's own hint
  // fades after a moment, and Escape is not something a learner is told. With
  // the header along for the ride the way out is a labelled button, and
  // Restart stays reachable, which is the other thing you want while a game is
  // filling the screen. The header costs about thirty pixels of it.
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  // The sandbox is a separate origin and can't read the lab's CSS variables, so
  // resolve the design-system colors here and send them down. `theme` (light /
  // dark) is a dependency so they re-send when the lab's theme flips.
  const {theme} = useTheme(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !previewIframe) {
      return;
    }
    previewIframe.style.width = '100%';
    previewIframe.style.height = '100%';
    previewIframe.style.border = '0';
    previewIframe.style.display = 'block';
    container.appendChild(previewIframe);
    return () => {
      if (previewIframe.parentElement === container) {
        container.removeChild(previewIframe);
      }
    };
  }, [previewIframe]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !previewIframe) {
      return;
    }
    const cs = getComputedStyle(container);
    const background = cs
      .getPropertyValue('--background-neutral-secondary')
      .trim();
    const border = cs.getPropertyValue('--borders-neutral-primary').trim();
    if (background || border) {
      setPreviewColors(background, border);
    }
  }, [previewIframe, theme, setPreviewColors]);

  // FOLLOWED, NOT REMEMBERED. Escape leaves fullscreen without going through
  // the button, and so does the browser's own control — a flag set when the
  // button is pressed would then say "fullscreen" over a window that is not,
  // and the button would offer to exit something already exited. The event is
  // the only thing that knows.
  useEffect(() => {
    const follow = () =>
      setFullscreen(document.fullscreenElement === panelRef.current);
    document.addEventListener('fullscreenchange', follow);
    return () => document.removeEventListener('fullscreenchange', follow);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    if (document.fullscreenElement === panel) {
      // The promise rejects when there is nothing to exit, which a second
      // click during the transition can produce. Nothing to do about it and
      // nothing worth saying.
      void document.exitFullscreen().catch(() => {});
      return;
    }
    // The game refits itself: Phaser is in FIT mode against the CSS size of
    // its own box (`runtime/driver/PhaserBinding`), and the iframe's window
    // resizes with the element around it. Nothing here has to tell it.
    //
    // …AND THE KEYS GO TO IT. A game filling the screen that ignores the arrow
    // keys until you click on it is a game that looks broken, and there is
    // nothing else on the screen the click could have been meant for. The
    // keyboard follows focus, and focus is still on the button that was just
    // pressed.
    //
    // ASKED OF THE SANDBOX, not done here. `previewIframe.focus()` was the
    // first attempt and it does not work: it gives the frame's document focus
    // with `body` active, and the game's keyboard listeners are on the `#game`
    // div — a keydown on `body` goes up through `html`, never through `#game`,
    // and the game hears nothing. Only code inside the frame can focus that
    // div (`runtime/sandbox/worldPreviewManager`).
    //
    // AFTER the transition, not with it: focusing an element part way into
    // fullscreen puts it back where it was in Chrome, and the promise
    // resolving is the only signal that the layout has settled.
    void panel
      .requestFullscreen()
      .then(() => focusPreview())
      .catch(() => {});
  }, [focusPreview]);

  if (!isConfigured) {
    return (
      <div className={styles.notConfigured}>
        No sandbox origin is configured. Your game runs on its own origin so it
        cannot reach this page&apos;s session — pass one with{' '}
        <code>?world-sandbox=…</code> (see the README).
      </div>
    );
  }

  return (
    <PanelContainer
      ref={panelRef}
      id="world-preview"
      className={classNames(styles.panel, fullscreen && styles.fullscreen)}
      headerContent="Preview"
      leftHeaderContent={
        fullscreenAvailable() ? (
          <Button
            variant="text"
            size="extraSmall"
            startIcon={
              <FontAwesomeV6Icon
                iconName={fullscreen ? 'compress' : 'expand'}
                iconStyle="solid"
              />
            }
            onClick={toggleFullscreen}
          >
            {fullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        ) : undefined
      }
      rightHeaderContent={
        <Button
          variant="text"
          size="extraSmall"
          startIcon={
            <FontAwesomeV6Icon iconName="rotate-right" iconStyle="solid" />
          }
          onClick={restart}
          disabled={status === 'compiling'}
        >
          Restart
        </Button>
      }
    >
      <div ref={containerRef} className={styles.frame} />
    </PanelContainer>
  );
};

export default WorldPreview;
