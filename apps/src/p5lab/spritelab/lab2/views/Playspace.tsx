import * as BlocklyCore from 'blockly/core';
import classNames from 'classnames';
import {isEqual} from 'lodash';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {AnyAction} from 'redux';

import {
  GUIDE_BOTTOM_OFFSET_PX,
  GUIDE_RIGHT_OFFSET_PX,
} from '@cdo/apps/lab2/views/components/guide/Guide';
import {
  isPickingLocation,
  selectLocation,
  updateLocation,
} from '@cdo/apps/p5lab/redux/locationPicker';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {calculateOffsetCoordinates} from '@cdo/apps/utils';

import {getImageThumbnail} from '../imageTrim';

import moduleStyles from './sprite-lab2-view.module.scss';

export type PlayspaceMode = 'preview' | 'play' | 'hidden';

// Read by a screen reader when focus reaches the game, which otherwise
// reports itself only in sound.
const CONTROLS_HELP_ID = 'spritelab2-playspace-help';

// The engine's p5 canvas is a fixed 400x400 (p5lab APP_WIDTH/HEIGHT); we scale
// it with a CSS transform to fit either the corner preview or the centered
// play area.
const CANVAS = 400;
const MARGIN = 12;
// One row of the design system's small buttons (2rem plus 1px borders).
const SMALL_BUTTON_PX = 34;
const BAR_GAP = 12;
export const BAR_ROOM = SMALL_BUTTON_PX + BAR_GAP;
// The preview column's share of the browser's width.
const PREVIEW_WIDTH_SHARE = 1 / 3;
// Under PREVIEW_MIN_PX the column widens, up to the max share, and the
// instructions move beside the box.
const PREVIEW_MIN_PX = 200;
const PREVIEW_WIDTH_MAX_SHARE = 0.45;
const BESIDE_TEXT_MIN_PX = 260;
const BESIDE_BOX_MIN_PX = 280;
// A student can read beside a small preview, not beside no text.
const BELOW_MIN_PX = 150;
const CARD_BORDER_PX = 1;
// Under this height the instructions take the blocks' smaller type.
const COMPACT_BELOW_PX = 560;
// The column's two cards' inset from its edges and from each other.
const CARD_GAP = 12;
// A header over the column keeps this much of its top clear: the editor
// strip's height ($editor-strip-height).
const COLUMN_HEADER_PX = 41;
// While playing the instructions' card narrows so the game can center.
const PLAY_CARD_WIDTH_PX = BESIDE_TEXT_MIN_PX;
// The box's slide between its two placements, and the fade of whatever
// appears in place.
const SLIDE_MS = 450;
const FADE_MS = 180;
// The whole overlay's fade as the Pictures editor takes the width and
// gives it back; the editor's slide takes as long (PANE_SLIDE_MS).
const HIDE_MS = 300;

interface Size {
  w: number;
  h: number;
}

interface Placement {
  scale: number;
  x: number;
  y: number;
}

/** The box centered and scaled to fill an area, MARGIN kept all round. */
function centeredIn(area: Size): Placement {
  const scale = Math.max(0.1, (Math.min(area.w, area.h) - 2 * MARGIN) / CANVAS);
  return {
    scale,
    x: (area.w - CANVAS * scale) / 2,
    y: (area.h - CANVAS * scale) / 2,
  };
}

/**
 * Where the play view goes in an overlay of `size`, clear of a guide hung
 * from a bottom corner: centered when that clears the guide, else beside or
 * above it, whichever leaves the box bigger. `reserveBelow` is room kept
 * under the box (the play bar).
 */
export function playPlacement(
  size: Size,
  guideSize?: {width: number; height: number} | null,
  reserveBelow = 0,
  reserveLeft = 0,
  guideSide: 'left' | 'right' = 'right'
): Placement {
  if (reserveLeft) {
    // Place within the area right of the reserve, then shift back.
    const inner = playPlacement(
      {w: size.w - reserveLeft, h: size.h},
      guideSize,
      reserveBelow,
      0,
      guideSide
    );
    return {...inner, x: inner.x + reserveLeft};
  }
  const whole = centeredIn({w: size.w, h: size.h - reserveBelow});
  if (!guideSize) {
    return whole;
  }
  const guideTop = size.h - guideSize.height - GUIDE_BOTTOM_OFFSET_PX;
  const clearsAbove =
    whole.y + CANVAS * whole.scale + reserveBelow <= guideTop - MARGIN;
  // Beside the guide: as near the center as clearing it allows, not centered
  // in the room left, which would push the box further out.
  if (guideSide === 'left') {
    // The guide hangs from the left: the box clears it to its right.
    const guideRight = GUIDE_RIGHT_OFFSET_PX + guideSize.width;
    if (whole.x >= guideRight + MARGIN || clearsAbove) {
      return whole;
    }
    const inner = centeredIn({
      w: size.w - guideRight - MARGIN,
      h: size.h - reserveBelow,
    });
    const beside = {
      ...inner,
      x: Math.max((size.w - CANVAS * inner.scale) / 2, guideRight + MARGIN),
    };
    const above = centeredIn({
      w: size.w,
      h: guideTop - MARGIN - reserveBelow,
    });
    return above.scale > beside.scale ? above : beside;
  }
  const guideLeft = size.w - guideSize.width - GUIDE_RIGHT_OFFSET_PX;
  const clearsGuide =
    whole.x + CANVAS * whole.scale <= guideLeft - MARGIN || clearsAbove;
  if (clearsGuide) {
    return whole;
  }
  const inner = centeredIn({
    w: guideLeft - MARGIN,
    h: size.h - reserveBelow,
  });
  const beside = {
    ...inner,
    x: Math.min(
      (size.w - CANVAS * inner.scale) / 2,
      guideLeft - MARGIN - CANVAS * inner.scale
    ),
  };
  const above = centeredIn({
    w: size.w,
    h: guideTop - MARGIN - reserveBelow,
  });
  return above.scale > beside.scale ? above : beside;
}

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
  // Clicking the live preview (Code tab) opens Play on the previewed scene.
  onPreviewClick?: () => void;
  // The play-mode game region, for handing keyboard focus to the game.
  boxRef?: React.RefObject<HTMLDivElement>;
  /** The scene playing now is a platformer, so the controls apply. */
  platformScene?: boolean;
  // Over the play area's corner, outside the box so they keep their size.
  controls?: React.ReactNode;
  // Under the box, which is placed to leave it room.
  playBar?: React.ReactNode;
  // Across the top of the column in preview; the box is placed under it.
  columnHeader?: React.ReactNode;
  // Under the bar in preview; the preview shrinks to leave it BELOW_MIN_PX.
  below?: React.ReactNode;
  /** Which edge the preview column sits at; the code keeps the rest. */
  side?: 'left' | 'right';
  // The preview column's width, which the code keeps clear of.
  onPreviewWidth?: (width: number) => void;
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
  boxRef,
  platformScene = false,
  controls,
  playBar,
  columnHeader,
  below,
  side = 'right',
  onPreviewWidth,
  getDefaultSpriteSize,
  onPreviewClick,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({w: 0, h: 0});
  // The height the docked instructions need, from their content.
  const [belowNeed, setBelowNeed] = useState(0);
  const belowObserver = useRef<ResizeObserver | null>(null);
  const belowContentRef = useCallback((el: HTMLDivElement | null) => {
    belowObserver.current?.disconnect();
    belowObserver.current = null;
    // The last need stands while the card is away: a stale number beats a
    // 0 that shrinks the card for a frame.
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(entries => {
      setBelowNeed(Math.ceil(entries[0].contentRect.height));
    });
    observer.observe(el);
    belowObserver.current = observer;
  }, []);
  useEffect(() => () => belowObserver.current?.disconnect(), []);

  const dispatch = useAppDispatch();
  // The location-picker block puts us in "selecting" mode; while active, the
  // playspace captures clicks and reports game coordinates back to the block.
  const picking = useAppSelector(state =>
    isPickingLocation(state.locationPicker)
  );

  // Hover ghost while picking: preview the sprite at the hovered location,
  // costume from the selected block's dropdown (the user just clicked its
  // pin); costume-less blocks fall back to crosshair only.
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
    const selected = BlocklyCore.common.getSelected();
    const block = selected instanceof BlocklyCore.BlockSvg ? selected : null;
    const costumeValue =
      block?.getFieldValue('ANIMATION_NAME') ||
      block?.getParent()?.getFieldValue('ANIMATION_NAME');
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
    if (!props) {
      return null;
    }
    // The thumbnail map holds a sheet's first frame; the raw dataURI is the
    // whole strip, which must not render as the ghost.
    return getImageThumbnail(ghostCostume) || props.dataURI || props.sourceUrl;
  });

  // Maps screen points to the intrinsic 400x400 space; correct despite the
  // CSS transform scaling (getBoundingClientRect vs offsetWidth).
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
      // Don't let the pick's click reach Blockly as a deselect. The swallow
      // is armed via a ref: selectLocation exits picking mode before the
      // browser fires the trailing click event.
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

  // Animate the move/scale only between the two visible placements (Code
  // preview <-> Play); appearing/disappearing is instant. Until the
  // ResizeObserver delivers a measurement the transform is against a 0x0
  // overlay, so the box stays transparent and fades in at its destination.
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

  // Worked out in every mode: while playing, the card keeps the place the
  // editing view gave it. The browser's width, not the playspace's: the
  // panels left of the workspace count against the code, not the preview.
  const browserWidth = window.innerWidth || size.w;
  const share = Math.round(browserWidth * PREVIEW_WIDTH_SHARE);
  // The room under the box: the bar, the gap and the card.
  const belowRoomFor = (card: number) =>
    (playBar ? BAR_ROOM : 0) + (below ? CARD_GAP + card : 0);
  // A taller need shrinks the box, never widens the column, which would
  // reflow the text taller again.
  let columnWidth = share;
  const topRoom = columnHeader ? COLUMN_HEADER_PX : 0;
  const need = Math.max(BELOW_MIN_PX, belowNeed + 2 * CARD_BORDER_PX);
  const inColumn = playPlacement(
    {w: size.w, h: size.h - topRoom},
    null,
    belowRoomFor(need),
    size.w - columnWidth
  );
  let boxWidth = CANVAS * inColumn.scale;
  let previewPlacement: Placement = {
    scale: inColumn.scale,
    x:
      (side === 'left' ? 0 : size.w - columnWidth) +
      (columnWidth - boxWidth) / 2,
    y: topRoom + CARD_GAP,
  };
  // The box pushed under its floor: the instructions move beside it, in a
  // wider column, if that gives the box more.
  let beside = false;
  if (below && boxWidth < PREVIEW_MIN_PX) {
    const maxColumn = Math.round(browserWidth * PREVIEW_WIDTH_MAX_SHARE);
    const besideWidth = Math.min(
      size.h - topRoom - 2 * CARD_GAP - (playBar ? BAR_ROOM : 0),
      maxColumn - BESIDE_TEXT_MIN_PX - 3 * CARD_GAP
    );
    if (besideWidth > boxWidth && besideWidth >= BESIDE_BOX_MIN_PX) {
      beside = true;
      boxWidth = besideWidth;
      columnWidth = Math.min(
        maxColumn,
        Math.round(boxWidth + BESIDE_TEXT_MIN_PX + 3 * CARD_GAP)
      );
      previewPlacement = {
        scale: boxWidth / CANVAS,
        x: side === 'left' ? CARD_GAP : size.w - CARD_GAP - boxWidth,
        y: topRoom + CARD_GAP,
      };
    }
  }

  // The instructions' card: under the box, beside it on its inner side, or
  // above it when it comes first.
  const previewBoxSide = CANVAS * previewPlacement.scale;
  const columnLeft = side === 'left' ? 0 : size.w - columnWidth;
  const belowLeft =
    beside && side === 'left'
      ? previewPlacement.x + previewBoxSide + CARD_GAP
      : columnLeft + CARD_GAP;
  const belowRoomTop =
    previewPlacement.y + previewBoxSide + BAR_ROOM + CARD_GAP;
  const belowRoom = size.h - belowRoomTop - CARD_GAP;
  const belowHeight = Math.min(belowNeed + 2 * CARD_BORDER_PX, belowRoom);
  const belowCard: React.CSSProperties = beside
    ? {
        left: belowLeft,
        top: topRoom + CARD_GAP,
        width: columnWidth - 3 * CARD_GAP - previewBoxSide,
        bottom: CARD_GAP,
      }
    : belowNeed > 0
    ? {
        left: belowLeft,
        top: belowRoomTop + (belowRoom - belowHeight) / 2,
        width: columnWidth - 2 * CARD_GAP,
        height: belowHeight,
      }
    : {
        left: belowLeft,
        top: belowRoomTop,
        width: columnWidth - 2 * CARD_GAP,
        bottom: CARD_GAP,
      };
  const playCardWidth = Math.min(belowCard.width as number, PLAY_CARD_WIDTH_PX);
  const playCard: React.CSSProperties = {
    ...belowCard,
    width: playCardWidth,
    left: side === 'left' ? belowCard.left : size.w - CARD_GAP - playCardWidth,
  };
  const cardStyle = mode === 'play' ? playCard : belowCard;
  // The card's edges for the game to clear, as the corner-hung guide
  // playPlacement models.
  const cardTop = cardStyle.top as number;
  const cardLeft = cardStyle.left as number;
  const cardRight = cardLeft + (cardStyle.width as number);
  const cardGuide =
    below && measured
      ? {
          width:
            side === 'left'
              ? cardRight - GUIDE_RIGHT_OFFSET_PX
              : size.w - cardLeft - GUIDE_RIGHT_OFFSET_PX,
          height: size.h - cardTop - GUIDE_BOTTOM_OFFSET_PX,
        }
      : null;

  const placement: Placement =
    mode === 'play'
      ? playPlacement(size, cardGuide, playBar ? BAR_ROOM : 0, 0, side)
      : previewPlacement;
  const {x, y, scale} = placement;
  const transform = `translate(${x}px, ${y}px) scale(${scale})`;
  const boxSide = CANVAS * scale;
  // The room the code gives up.
  const previewWidth = mode === 'preview' && measured ? columnWidth : 0;
  const reportPreviewWidth = useRef(onPreviewWidth);
  reportPreviewWidth.current = onPreviewWidth;
  useEffect(() => {
    reportPreviewWidth.current?.(previewWidth);
  }, [previewWidth]);
  // Under the box, unscaled; at the column's width under a stacked
  // preview, so a shrunk box never wraps the buttons.
  const barLeft = previewWidth > 0 && !beside ? columnLeft + CARD_GAP : x;
  const barWidth =
    previewWidth > 0 && !beside ? previewWidth - 2 * CARD_GAP : boxSide;
  const barTransform = `translate(${barLeft}px, ${y + boxSide + BAR_GAP}px)`;
  const compact = size.h < COMPACT_BELOW_PX;
  // Hidden settles after the fade, so the card and the bar stay through it.
  const [settledHidden, setSettledHidden] = useState(mode === 'hidden');
  useEffect(() => {
    if (mode !== 'hidden') {
      setSettledHidden(false);
      return;
    }
    const timer = window.setTimeout(() => setSettledHidden(true), HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [mode]);
  const visible = measured && !settledHidden;
  // The bar waits unseen at its destination and fades in once the box arrives.
  const barRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (animate) {
      barRef.current?.animate?.(
        [
          {opacity: 0},
          {opacity: 0, offset: SLIDE_MS / (SLIDE_MS + FADE_MS)},
          {opacity: 1},
        ],
        {duration: SLIDE_MS + FADE_MS, easing: 'ease-in'}
      );
    }
    // Only a mode change moves the bar; animate is derived for that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  // The card fades between its two sizes rather than sliding, which would
  // reflow its text: a copy at the old size fades out.
  const cardRef = useRef<HTMLDivElement>(null);
  const cardCompact = compact || mode === 'play';
  const cardClassName = classNames(
    moduleStyles.previewBelow,
    cardCompact && moduleStyles.previewBelowCompact
  );
  const lastCard = useRef<{style: React.CSSProperties; className: string}>();
  useEffect(() => {
    lastCard.current = {style: cardStyle, className: cardClassName};
  });
  useLayoutEffect(() => {
    const card = cardRef.current;
    const last = lastCard.current;
    if (!animate || !card || !last || isEqual(last.style, cardStyle)) {
      return;
    }
    const copy = card.cloneNode(true) as HTMLElement;
    copy.className = last.className;
    copy.setAttribute('aria-hidden', 'true');
    copy.style.pointerEvents = 'none';
    for (const [key, value] of Object.entries(last.style)) {
      copy.style.setProperty(
        key,
        typeof value === 'number' ? `${value}px` : String(value)
      );
    }
    card.parentElement?.appendChild(copy);
    const fade = {duration: SLIDE_MS, easing: 'ease'};
    const out = copy.animate?.([{opacity: 1}, {opacity: 0}], fade);
    if (out) {
      out.onfinish = () => copy.remove();
    } else {
      copy.remove();
    }
    card.animate?.([{opacity: 0}, {opacity: 1}], fade);
    // Only a mode change resizes the card; animate is derived for that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div
      ref={overlayRef}
      className={moduleStyles.playspaceOverlay}
      // Use visibility (not display:none) so the overlay keeps its layout size
      // while hidden. Otherwise it measures 0 and, on reappearing, the box is
      // first placed with a stale size and then animates into the right spot.
      style={{
        visibility: settledHidden ? 'hidden' : 'visible',
        opacity: mode === 'hidden' ? 0 : 1,
        transition: `opacity ${HIDE_MS}ms ease`,
      }}
    >
      {previewWidth > 0 && (
        <div
          className={classNames(
            moduleStyles.previewColumn,
            side === 'left' && moduleStyles.previewColumnLeft
          )}
          style={{left: columnLeft, width: previewWidth}}
        />
      )}
      <div
        ref={boxRef}
        className={moduleStyles.playspaceBox}
        // A keyboard stop for players: game keys arrive via window listeners
        // regardless of focus, but focus needs somewhere harmless to rest
        // after the tab-bar buttons (a focused button turns Space into its
        // activator). role="application" also makes screen readers pass
        // keystrokes through to the game.
        role={mode === 'play' ? 'application' : undefined}
        aria-label={mode === 'play' ? 'Game playspace' : undefined}
        aria-describedby={
          mode === 'play' && platformScene ? CONTROLS_HELP_ID : undefined
        }
        tabIndex={mode === 'play' ? 0 : undefined}
        style={{
          transform,
          // Fade in on appearance (first measurement or hidden -> visible);
          // slide only between the two visible placements.
          opacity: visible ? 1 : 0,
          // Hairline seam so a white game canvas reads against a white page
          // in light mode — corner preview only; it fades out with the slide
          // to Play. A shadow, not a border, so the 400x400 geometry the
          // transform and pointer math rely on stays untouched.
          boxShadow:
            mode === 'play'
              ? '0 0 0 1px transparent'
              : '0 0 0 1px var(--borders-neutral-primary)',
          transition: animate
            ? `transform ${SLIDE_MS}ms ease, opacity ${FADE_MS}ms ease-in, box-shadow ${SLIDE_MS}ms ease`
            : `opacity ${FADE_MS}ms ease-in`,
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
        {/* Click-to-play: a transparent catcher over the live preview so a
            click opens Play on this scene. Only in preview and never while
            picking a location; the game canvas stays non-interactive beneath. */}
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
      {/* Outside the box: role="application" hides what is inside it from
          screen readers, so anything to be read must sit beside it. */}
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
      {mode === 'preview' && columnHeader && measured && (
        <div
          className={moduleStyles.columnHeader}
          style={{left: columnLeft, width: columnWidth}}
        >
          {columnHeader}
        </div>
      )}
      {playBar && (
        <div
          ref={barRef}
          className={moduleStyles.playBar}
          style={{
            transform: barTransform,
            width: barWidth,
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in`,
          }}
        >
          {playBar}
        </div>
      )}
      {below && visible && (
        <div ref={cardRef} className={cardClassName} style={cardStyle}>
          <div
            ref={belowContentRef}
            className={moduleStyles.previewBelowContent}
          >
            {below}
          </div>
        </div>
      )}
    </div>
  );
};

export default Playspace;
