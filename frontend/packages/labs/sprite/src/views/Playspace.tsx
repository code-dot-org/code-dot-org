// The single, persistent playspace. The engine's canvas lives here for the
// lab's lifetime, and this overlay moves it between a small top-right
// preview (Code tab) and a large centred view (Play tab). Because it is
// always mounted, switching tabs only moves and scales it: the engine keeps
// running, so the preview is live without pressing Run.
//
// It also answers a location field: while picking, a click anywhere on it,
// preview included, reports a point in canvas coordinates.
import {
  type FunctionComponent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {type PickedLocation, setLocationPicker} from '../blockly/pool';
import {getImageThumbnail} from '../imageTrim';
import {useAppSelector} from '../redux/store';

import moduleStyles from './sprite-lab2-view.module.scss';

export type PlayspaceMode = 'preview' | 'play' | 'hidden';

// Read by a screen reader when focus reaches the game, which otherwise
// reports itself only in sound.
const CONTROLS_HELP_ID = 'spritelab2-playspace-help';

// The canvas is a fixed 400x400, scaled with a CSS transform.
const CANVAS = 400;
const MARGIN = 12;
// The corner preview sits over the workspace, whose scrollbar hugs the
// right edge; a larger margin keeps them apart.
const PREVIEW_MARGIN = 24;
const PREVIEW_SCALE = 0.64;
/** The preview's horizontal footprint, for siblings that must clear it. */
export const PREVIEW_CLEARANCE = CANVAS * PREVIEW_SCALE + 2 * PREVIEW_MARGIN;
// The play bar under the box: one row of small buttons and its gap.
const SMALL_BUTTON_PX = 34;
const BAR_GAP = 12;
export const BAR_ROOM = SMALL_BUTTON_PX + BAR_GAP;
// Where the floating guide sits, as apps' Guide placed it.
const GUIDE_RIGHT_OFFSET_PX = 32;
const GUIDE_BOTTOM_OFFSET_PX = 20;
const SLIDE_MS = 450;
const FADE_MS = 180;

interface Size {
  w: number;
  h: number;
}

interface Placement {
  scale: number;
  x: number;
  y: number;
}

function centeredIn(area: Size): Placement {
  const scale = Math.max(0.1, (Math.min(area.w, area.h) - 2 * MARGIN) / CANVAS);
  return {
    scale,
    x: (area.w - CANVAS * scale) / 2,
    y: (area.h - CANVAS * scale) / 2,
  };
}

/**
 * Where the play view goes in an overlay of `size` with the guide pinned at
 * its bottom-right: centred in the whole overlay when that clears the
 * guide, else beside or above it, whichever leaves the box bigger.
 * `reserveBelow` is room kept under the box for the play bar.
 */
export function playPlacement(
  size: Size,
  guideSize?: {width: number; height: number} | null,
  reserveBelow = 0,
): Placement {
  const whole = centeredIn({w: size.w, h: size.h - reserveBelow});
  if (!guideSize) {
    return whole;
  }
  const guideLeft = size.w - guideSize.width - GUIDE_RIGHT_OFFSET_PX;
  const guideTop = size.h - guideSize.height - GUIDE_BOTTOM_OFFSET_PX;
  const clearsGuide =
    whole.x + CANVAS * whole.scale <= guideLeft - MARGIN ||
    whole.y + CANVAS * whole.scale + reserveBelow <= guideTop - MARGIN;
  if (clearsGuide) {
    return whole;
  }
  const beside = centeredIn({w: guideLeft - MARGIN, h: size.h - reserveBelow});
  const above = centeredIn({
    w: size.w,
    h: guideTop - MARGIN - reserveBelow,
  });
  return above.scale > beside.scale ? above : beside;
}

interface PlayspaceProps {
  mode: PlayspaceMode;
  /** Receives the element the engine makes its canvas in. */
  canvasContainerRef: RefObject<HTMLDivElement>;
  /** Incremented to play a fade from black (a scene jump landing). */
  fadeTrigger?: number;
  /** A solid black cover, from a jump's trigger until it lands. */
  covered?: boolean;
  /** The loading overlay, which fades in late so quick loads never show it. */
  loading?: boolean;
  /** Sizes the picking ghost; a helper library may change it per run. */
  getDefaultSpriteSize?: () => number;
  /** Clicking the live preview opens Play on the previewed scene. */
  onPreviewClick?: () => void;
  /** The play-mode game region, for handing keyboard focus to the game. */
  boxRef?: RefObject<HTMLDivElement>;
  /** The scene playing now is a platformer, so the controls apply. */
  platformScene?: boolean;
  /** Shown top-right while playing (the restart buttons). */
  controls?: ReactNode;
  /** Shown under the box in both visible modes. */
  playBar?: ReactNode;
  /** The floating guide's footprint, pinned to the bottom-right. */
  guideSize?: {width: number; height: number} | null;
}

const Playspace: FunctionComponent<PlayspaceProps> = ({
  mode,
  canvasContainerRef,
  fadeTrigger = 0,
  covered = false,
  loading = false,
  boxRef,
  platformScene = false,
  controls,
  playBar,
  guideSize,
  getDefaultSpriteSize,
  onPreviewClick,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({w: 0, h: 0});

  const pickRef = useRef<{
    onUpdate: (location: PickedLocation) => void;
    onDone: (location: PickedLocation | null) => void;
  } | null>(null);
  const [picking, setPicking] = useState(false);
  const [ghostCostume, setGhostCostume] = useState<string | null>(null);
  const [hover, setHover] = useState<PickedLocation | null>(null);
  useEffect(() => {
    setLocationPicker((_initial, onUpdate, onDone, costume) => {
      // A second request abandons the first.
      pickRef.current?.onDone(null);
      pickRef.current = {onUpdate, onDone};
      setGhostCostume(costume);
      setHover(null);
      setPicking(true);
    });
    return () => {
      setLocationPicker(null);
      pickRef.current?.onDone(null);
      pickRef.current = null;
    };
  }, []);

  const ghostImage = useAppSelector(state => {
    if (!picking || !ghostCostume) {
      return null;
    }
    const list = state.animationList;
    const key = list.orderedKeys.find(
      k => list.propsByKey[k]?.name === ghostCostume,
    );
    const props = key ? list.propsByKey[key] : undefined;
    // The raw dataURI of a sheet is the whole strip; the thumbnail is its
    // first frame.
    return props
      ? getImageThumbnail(ghostCostume) || props.dataURI || props.sourceUrl
      : null;
  });

  // Canvas coordinates, whatever the box's scale.
  const canvasPoint = (e: PointerEvent): PickedLocation | null => {
    const el = canvasContainerRef.current;
    if (!el) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - rect.left) * el.offsetWidth) / rect.width),
      y: Math.round(((e.clientY - rect.top) * el.offsetHeight) / rect.height),
    };
  };

  const handlePointerMove = (e: PointerEvent) => {
    const point = pickRef.current && canvasPoint(e);
    if (point) {
      pickRef.current?.onUpdate(point);
      setHover(point);
    }
  };

  // The pick's click must not reach Blockly as a deselect; it arrives after
  // picking has ended, so a ref carries the swallow over.
  const swallowNextClick = useRef(false);
  const handlePointerUp = (e: PointerEvent) => {
    const pick = pickRef.current;
    if (!pick) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    swallowNextClick.current = true;
    const point = canvasPoint(e);
    if (point) {
      pick.onUpdate(point);
      pickRef.current = null;
      setPicking(false);
      pick.onDone(point);
    }
  };

  const swallowWhilePicking = useCallback((e: PointerEvent | MouseEvent) => {
    if (pickRef.current || swallowNextClick.current) {
      e.stopPropagation();
      e.preventDefault();
      if (e.type === 'click') {
        swallowNextClick.current = false;
      }
    }
  }, []);

  // Animate only between the two visible placements; until the first
  // measurement the box stays transparent and fades in where it belongs.
  const measured = size.w > 0 && size.h > 0;
  const wasMeasured = useRef(false);
  const prevMode = useRef<PlayspaceMode>(mode);
  const animate =
    wasMeasured.current && prevMode.current !== 'hidden' && mode !== 'hidden';
  useEffect(() => {
    prevMode.current = mode;
  }, [mode]);
  useEffect(() => {
    wasMeasured.current = measured;
  }, [measured]);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setSize({w: rect.width, h: rect.height});
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const placement: Placement =
    mode === 'play'
      ? playPlacement(size, guideSize, playBar ? BAR_ROOM : 0)
      : {
          scale: PREVIEW_SCALE,
          x: Math.max(
            PREVIEW_MARGIN,
            size.w - CANVAS * PREVIEW_SCALE - PREVIEW_MARGIN,
          ),
          y: PREVIEW_MARGIN,
        };
  const {x, y, scale} = placement;
  const boxSide = CANVAS * scale;
  const visible = measured && mode !== 'hidden';
  // The bar waits, unseen, at its destination and fades in once the box has
  // arrived; before paint, so the jump is not seen.
  const barRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (animate) {
      barRef.current?.animate?.(
        [
          {opacity: 0},
          {opacity: 0, offset: SLIDE_MS / (SLIDE_MS + FADE_MS)},
          {opacity: 1},
        ],
        {duration: SLIDE_MS + FADE_MS, easing: 'ease-in'},
      );
    }
    // Only a mode change moves the bar.
  }, [mode]);

  return (
    <div
      ref={overlayRef}
      className={moduleStyles.playspaceOverlay}
      // Visibility, not display: the overlay keeps its measured size.
      style={{visibility: mode === 'hidden' ? 'hidden' : 'visible'}}
    >
      {/* The handlers only capture a pointer pick; apps' picker has no
          keyboard path either. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        ref={boxRef}
        className={moduleStyles.playspaceBox}
        // Somewhere harmless for focus to rest while playing; screen readers
        // pass keystrokes through to an application.
        role={mode === 'play' ? 'application' : undefined}
        aria-label={mode === 'play' ? 'Game playspace' : undefined}
        aria-describedby={
          mode === 'play' && platformScene ? CONTROLS_HELP_ID : undefined
        }
        tabIndex={mode === 'play' ? 0 : undefined}
        style={{
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          opacity: visible ? 1 : 0,
          // A hairline seam so a white canvas reads against a white page, in
          // the corner preview only. A shadow, so the geometry is untouched.
          boxShadow:
            mode === 'play'
              ? '0 0 0 1px transparent'
              : '0 0 0 1px var(--borders-neutral-primary)',
          transition: animate
            ? `transform ${SLIDE_MS}ms ease, opacity ${FADE_MS}ms ease-in, box-shadow ${SLIDE_MS}ms ease`
            : `opacity ${FADE_MS}ms ease-in`,
          // The preview takes the pointer only while picking.
          pointerEvents: mode === 'play' || picking ? 'auto' : 'none',
          cursor: picking ? 'crosshair' : undefined,
        }}
        onPointerDown={swallowWhilePicking}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setHover(null)}
        onClick={swallowWhilePicking}
      >
        <div
          ref={canvasContainerRef}
          className={moduleStyles.playspaceCanvas}
        />
        {mode === 'preview' && !picking && onPreviewClick && (
          <div
            className={moduleStyles.previewClickCatch}
            role="button"
            tabIndex={0}
            title="Play this scene"
            aria-label="Play this scene"
            onClick={onPreviewClick}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPreviewClick();
              }
            }}
          />
        )}
        {picking &&
          hover &&
          ghostImage &&
          (() => {
            const side = getDefaultSpriteSize?.() || 100;
            return (
              <img
                src={ghostImage}
                alt=""
                className={moduleStyles.locationGhost}
                style={{
                  left: hover.x - side / 2,
                  top: hover.y - side / 2,
                  width: side,
                  height: side,
                }}
              />
            );
          })()}
        {covered && <div className={moduleStyles.sceneCover} />}
        {/* Keyed so each landing restarts the fade. */}
        {fadeTrigger > 0 && (
          <div key={fadeTrigger} className={moduleStyles.sceneFade} />
        )}
        {loading && (
          <div className={moduleStyles.sceneLoading}>
            <div className={moduleStyles.sceneLoadingSpinner} />
          </div>
        )}
      </div>
      {/* Outside the box: role="application" hides what is inside it. */}
      {mode === 'play' && platformScene && (
        <p id={CONTROLS_HELP_ID} className={moduleStyles.srOnly}>
          Left and right arrows move. Space or up arrow jumps. In zero gravity,
          up and down steer. Navigation sounds can be turned on in Settings:
          footsteps and bumps, a tone for your height, and tones that grow
          louder as a wall or an edge comes near.
        </p>
      )}
      {mode === 'play' && controls && (
        <div className={moduleStyles.playControls}>{controls}</div>
      )}
      {playBar && (
        <div
          ref={barRef}
          className={moduleStyles.playBar}
          style={{
            transform: `translate(${x}px, ${y + boxSide + BAR_GAP}px)`,
            width: boxSide,
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in`,
          }}
        >
          {playBar}
        </div>
      )}
    </div>
  );
};

export default Playspace;
