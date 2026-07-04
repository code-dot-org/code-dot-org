import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AnyAction} from 'redux';

import {
  isPickingLocation,
  selectLocation,
  updateLocation,
} from '@cdo/apps/p5lab/redux/locationPicker';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {calculateOffsetCoordinates} from '@cdo/apps/utils';

import moduleStyles from './sprite-lab2-view.module.scss';

export type PlayspaceMode = 'preview' | 'play' | 'hidden';

// The engine's p5 canvas is a fixed 400x400 (p5lab APP_WIDTH/HEIGHT); we scale
// it with a CSS transform to fit either the corner preview or the centered
// play area.
const CANVAS = 400;
const MARGIN = 12;
const PREVIEW_SCALE = 0.64;

interface PlayspaceProps {
  mode: PlayspaceMode;
  // Scenes UI variant: increment to play a quick fade-in-from-black over the
  // canvas (used when the go-to-scene block jumps scenes). 0 = never faded.
  fadeTrigger?: number;
  // Hold a solid black cover over the canvas (from a jump trigger until the
  // target scene lands, when the fade takes over).
  covered?: boolean;
  // Show the loading overlay (delayed fade-in, so quick loads never flash a
  // spinner). Used while fetching an external project.
  loading?: boolean;
  // The engine's current default sprite size (canvas units), for sizing the
  // location-picker's hover ghost. Read at hover time — helper libraries can
  // change it per run.
  getDefaultSpriteSize?: () => number;
}

/**
 * The single, persistent playspace. #divGameLab is rendered once here (the
 * engine binds to it for the lab's lifetime) and this overlay animates it
 * between a small top-right preview (Code tab) and a large centered view (Play
 * tab). Because it's always mounted, switching tabs only moves/scales it — the
 * engine keeps running, so the preview is always live without pressing Run.
 */
const Playspace: React.FunctionComponent<PlayspaceProps> = ({
  mode,
  fadeTrigger = 0,
  covered = false,
  loading = false,
  getDefaultSpriteSize,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({w: 0, h: 0});

  const dispatch = useAppDispatch();
  // The location-picker block puts us in "selecting" mode; while active, the
  // playspace captures clicks and reports game coordinates back to the block.
  const picking = useAppSelector(state =>
    isPickingLocation(state.locationPicker)
  );

  // Hover ghost (legacy Sprite Lab behavior): while picking, preview the
  // sprite being placed at the hovered location. The costume comes from the
  // selected block — the user just clicked the pin on it — when that block
  // carries a costume dropdown (e.g. "make new sprite at"); location pickers
  // on costume-less blocks fall back to crosshair only.
  const [hoverCoords, setHoverCoords] = useState<{x: number; y: number} | null>(
    null
  );
  const [ghostCostume, setGhostCostume] = useState<string | null>(null);
  useEffect(() => {
    if (!picking) {
      setHoverCoords(null);
      setGhostCostume(null);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selected = (Blockly as any).getSelected?.();
    const costumeValue =
      selected?.getFieldValue?.('ANIMATION_NAME') ||
      selected?.getParent?.()?.getFieldValue?.('ANIMATION_NAME');
    // Costume field values are quoted names, e.g. '"owl_1"'.
    setGhostCostume(
      typeof costumeValue === 'string'
        ? costumeValue.replace(/^"|"$/g, '')
        : null
    );
  }, [picking]);
  const ghostImage = useAppSelector(state => {
    if (!picking || !ghostCostume) {
      return null;
    }
    const list = state.animationList;
    const key = list.orderedKeys.find(
      k => list.propsByKey[k]?.name === ghostCostume
    );
    const props = key && list.propsByKey[key];
    return props ? props.dataURI || props.sourceUrl : null;
  });

  // calculateOffsetCoordinates maps a screen point to the canvas's intrinsic
  // 400x400 space via getBoundingClientRect vs offsetWidth, so it's correct
  // despite our CSS transform scaling.
  const coordsFromEvent = useCallback((e: React.PointerEvent) => {
    if (!canvasRef.current) {
      return null;
    }
    return calculateOffsetCoordinates(
      canvasRef.current,
      Math.floor(e.clientX),
      Math.floor(e.clientY)
    );
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!picking) {
        return;
      }
      const coords = coordsFromEvent(e);
      if (coords) {
        dispatch(updateLocation(coords) as unknown as AnyAction);
        setHoverCoords(coords);
      }
    },
    [picking, coordsFromEvent, dispatch]
  );

  const handlePointerLeave = useCallback(() => {
    setHoverCoords(null);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!picking) {
        return;
      }
      // The click belongs to the location picker alone — don't let it reach
      // Blockly (or anything else) as a click/deselect too. selectLocation
      // exits picking mode before the browser fires the trailing click event,
      // so the click swallow is armed via a ref rather than the (already
      // stale) picking flag.
      e.stopPropagation();
      e.preventDefault();
      swallowNextClickRef.current = true;
      const coords = coordsFromEvent(e);
      if (coords) {
        // Update first so the block's live value matches the click point, then
        // finalize the selection.
        dispatch(updateLocation(coords) as unknown as AnyAction);
        dispatch(selectLocation(coords) as unknown as AnyAction);
      }
    },
    [picking, coordsFromEvent, dispatch]
  );

  // Swallow the whole gesture while picking: pointerdown (focus/selection
  // side effects) and the browser-synthesized click after pointerup.
  const swallowNextClickRef = useRef(false);
  const swallowWhilePicking = useCallback(
    (e: React.PointerEvent | React.MouseEvent) => {
      if (picking || swallowNextClickRef.current) {
        e.stopPropagation();
        e.preventDefault();
        if (e.type === 'click') {
          swallowNextClickRef.current = false;
        }
      }
    },
    [picking]
  );

  // Only animate the move/scale when going directly between the two visible
  // placements (Code preview <-> Play). Appearing from or disappearing to a
  // tab without the playspace (Images/World) should be instant — and so
  // should the first paint: until the ResizeObserver delivers a measurement,
  // the transform is computed against a 0x0 overlay, and animating away from
  // that stale position reads as the box sliding in from the left. The box
  // stays transparent until measured and quickly fades in at its destination
  // instead.
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

  // Track the overlay's size so we can center/scale the canvas to fit.
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

  let transform: string;
  if (mode === 'play') {
    const scale = Math.max(
      0.1,
      (Math.min(size.w, size.h) - 2 * MARGIN) / CANVAS
    );
    const x = (size.w - CANVAS * scale) / 2;
    const y = (size.h - CANVAS * scale) / 2;
    transform = `translate(${x}px, ${y}px) scale(${scale})`;
  } else {
    // Preview: small box pinned to the top-right corner.
    const x = Math.max(MARGIN, size.w - CANVAS * PREVIEW_SCALE - MARGIN);
    transform = `translate(${x}px, ${MARGIN}px) scale(${PREVIEW_SCALE})`;
  }

  return (
    <div
      ref={overlayRef}
      className={moduleStyles.playspaceOverlay}
      // Use visibility (not display:none) so the overlay keeps its layout size
      // while hidden. Otherwise it measures 0 and, on reappearing, the box is
      // first placed with a stale size and then animates into the right spot.
      style={{visibility: mode === 'hidden' ? 'hidden' : 'visible'}}
    >
      <div
        className={moduleStyles.playspaceBox}
        style={{
          transform,
          // Fade in on appearance (first measurement or hidden -> visible);
          // slide only between the two visible placements.
          opacity: measured && mode !== 'hidden' ? 1 : 0,
          transition: animate
            ? 'transform 0.45s ease, opacity 0.18s ease-in'
            : 'opacity 0.18s ease-in',
          // Interactive in Play, and while picking a location (so the preview
          // can be clicked even on the Code tab).
          pointerEvents: mode === 'play' || picking ? 'auto' : 'none',
          cursor: picking ? 'crosshair' : undefined,
        }}
        onPointerDown={swallowWhilePicking}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={swallowWhilePicking}
      >
        {/* The id is hardcoded in P5Wrapper.startExecution. */}
        <div
          ref={canvasRef}
          id="divGameLab"
          className={moduleStyles.playspaceCanvas}
        />
        {/* Location-picker hover ghost: preview the sprite being placed at
            the hovered spot (box coordinates are canvas coordinates). */}
        {picking &&
          hoverCoords &&
          ghostImage &&
          (() => {
            const ghostSize = getDefaultSpriteSize?.() || 100;
            return (
              <img
                src={ghostImage}
                alt=""
                className={moduleStyles.locationGhost}
                style={{
                  left: hoverCoords.x - ghostSize / 2,
                  top: hoverCoords.y - ghostSize / 2,
                  width: ghostSize,
                  height: ghostSize,
                }}
              />
            );
          })()}
        {/* Solid black while a scene jump is loading its target. */}
        {covered && <div className={moduleStyles.sceneCover} />}
        {/* Keyed so each scene jump restarts the fade-from-black animation. */}
        {fadeTrigger > 0 && (
          <div key={fadeTrigger} className={moduleStyles.sceneFade} />
        )}
        {/* Loading overlay: mounted for the whole load, but CSS delays its
            fade-in so only slow loads ever show it. */}
        {loading && (
          <div className={moduleStyles.sceneLoading}>
            <div className={moduleStyles.sceneLoadingSpinner} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Playspace;
