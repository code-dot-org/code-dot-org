// The `angle` field's popup: a ring of the common angles, and a dial for the rest.
//
// An angle is a direction, and a direction is a thing you point at rather than a
// number you know. The legacy Artist lab's angle field made the same bet
// (`apps/src/blockly/addons/cdoAngleHelper`), and what is kept from it is the
// bet, not the code: that one is built on CDO Blockly, carries the Artist's
// turn-left/turn-right convention, and rotates its own background.
//
// THREE WAYS IN, because an angle is asked for in three different moods. Most of
// the time it is one of eight — right, down, up-left — and the ring around the
// outside is one click for each of those. Sometimes it is a particular direction
// and nothing named, which is the dial in the middle. And sometimes it is a
// number somebody already knows, which is the box underneath, focused and
// selected the moment the popup opens so that typing it is the fastest of the
// three.
//
// THE CONVENTION IS THE ENGINE'S: 0° points right and 90° points DOWN, because
// `+y` is down on a screen and in the map. It is the angle `direction of ⟨…⟩`
// reports, the one `⟨1⟩ in direction ⟨…⟩` takes, and the one an actor's rotation
// is in, so the dial and every block agree without anyone converting.

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import type {ReactFieldEditorProps} from '@code-dot-org/blockly';

import styles from './angleEditor.module.css';

/** The whole widget's size in CSS pixels, and its middle. */
const SIZE = 186;
const CENTER = SIZE / 2;

/** The ring of common angles: its outer edge, and how thick it is. */
const RING_OUTER = CENTER - 3;
const RING_WIDTH = 20;
const RING_INNER = RING_OUTER - RING_WIDTH;

/** The free-form dial inside it. */
const RADIUS = RING_INNER - 7;
/** Where the tick marks start, measured in from the dial's rim. */
const TICK = 6;
/** A tick every this many degrees; a longer one every quarter turn. */
const TICK_STEP = 15;

/** The angles the ring offers, and so how wide each of its parts is. */
const COMMON_STEP = 45;
const COMMON = [0, 45, 90, 135, 180, 225, 270, 315];

/** The angle a field holds when nothing has said otherwise. */
export const DEFAULT_ANGLE = 0;

const RADIANS = Math.PI / 180;

/** Where a degree lands, at a distance from the middle. */
const pointAt = (degrees: number, radius: number) => ({
  x: CENTER + radius * Math.cos(degrees * RADIANS),
  y: CENTER + radius * Math.sin(degrees * RADIANS),
});

/**
 * One part of the ring: the band between two radii, from one angle to another.
 *
 * Drawn out and back — along the outer edge clockwise, in, along the inner edge
 * anticlockwise — so the shape closes on itself. `+y` is down, so an increasing
 * angle IS the clockwise sweep, which is why both arcs take the flags they do.
 */
const band = (from: number, to: number): string => {
  const a = pointAt(from, RING_OUTER);
  const b = pointAt(to, RING_OUTER);
  const c = pointAt(to, RING_INNER);
  const d = pointAt(from, RING_INNER);
  return (
    `M${a.x},${a.y} A${RING_OUTER},${RING_OUTER} 0 0 1 ${b.x},${b.y} ` +
    `L${c.x},${c.y} A${RING_INNER},${RING_INNER} 0 0 0 ${d.x},${d.y} Z`
  );
};

/**
 * A whole number of degrees in `[0, 360)`.
 *
 * Wrapped rather than clamped: 370° and −350° are the same direction as 10°, and
 * a dial that stopped at 359 would have a seam in it.
 */
export const normalizeAngle = (degrees: number): number => {
  if (!Number.isFinite(degrees)) {
    return DEFAULT_ANGLE;
  }
  return ((Math.round(degrees) % 360) + 360) % 360;
};

export function AngleEditor({value, onChange}: ReactFieldEditorProps<number>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const angle = normalizeAngle(value);
  /**
   * What is in the box, which is not always what the dial holds.
   *
   * Halfway through typing `135` the box says `13` and the dial says 13; the
   * two agree again the moment the box is left. Pointing the dial writes the
   * box, because then the box is not the thing being edited.
   */
  const [draft, setDraft] = useState(() => String(angle));
  /**
   * Which part of the ring the keyboard is on, if any.
   *
   * Kept here so the focus ring can be drawn as a shape of its own, ON TOP of
   * the whole ring. A browser's own outline goes around a shape's BOUNDING BOX,
   * and the bounding box of a wedge is mostly not the wedge — a rectangle
   * hanging off a circle, overlapping its neighbours. An outline that follows
   * the wedge's own edges has to be drawn as one, and drawn last, because the
   * parts share edges and whichever is painted later covers the other's.
   */
  const [focused, setFocused] = useState<number | null>(null);
  // The angle the box was last told about. STATE, not a ref, and that is not a
  // preference: React runs a component's body twice in development, and a ref
  // written on the first pass is still written on the second — so the guard saw
  // its own work, decided nothing had changed, and the update queued in the
  // discarded pass went with it. The box read `0` while the dial read 225.
  // Comparing against state is React's own recipe for adjusting state when an
  // input changes, and it survives the double render because the state itself
  // does not commit until the update does.
  // The angle as of THIS render, reachable from a handler that outlives it.
  // `onBlur` needs it: pressing a ring segment changes the angle and blurs the
  // box in the same breath, and a blur handler closing over `angle` puts the
  // angle from before the press back into the box — which is how the dial came
  // to read 225 with `0` under it.
  const live = useRef(angle);
  live.current = angle;
  const [told, setTold] = useState(angle);
  if (told !== angle) {
    setTold(angle);
    // Unless the box is what said so. `13` typed on the way to `135` already
    // means 13, and rewriting it would move the caret out from under the next
    // keystroke; a ring or a drag saying 225 while the box says `13` does not
    // — the box is stale then, and stale is what it must not be.
    if (draft.trim() === '' || normalizeAngle(Number(draft)) !== angle) {
      setDraft(String(angle));
    }
  }

  // Open with the number ready to be typed over. An angle is as often a value
  // somebody knows — 90, 180 — as one they want to point at, and having to
  // click the box first makes the keyboard the slower way to say the easy ones.
  //
  // AFTER Blockly, which is what the timeout is for: `DropDownDiv.show` moves
  // focus to the dropdown itself once the content is in it, so a focus taken
  // during this effect is taken back a moment later.
  useEffect(() => {
    const at = setTimeout(() => {
      boxRef.current?.focus();
      boxRef.current?.select();
    }, 0);
    return () => clearTimeout(at);
  }, []);

  const pointTo = (event: ReactPointerEvent<SVGSVGElement>): void => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const dx = event.clientX - rect.left - CENTER;
    const dy = event.clientY - rect.top - CENTER;
    // Dead centre has no direction in it; leave the angle where it was rather
    // than letting `atan2(0, 0)` answer 0 and snap the arrow east.
    if (dx === 0 && dy === 0) {
      return;
    }
    onChange(normalizeAngle(Math.atan2(dy, dx) / RADIANS));
  };

  const ticks = [];
  for (let at = 0; at < 360; at += TICK_STEP) {
    const quarter = at % 90 === 0;
    const from = pointAt(at, RADIUS - (quarter ? TICK * 2 : TICK));
    const to = pointAt(at, RADIUS);
    ticks.push(
      <line
        key={at}
        className={quarter ? styles.quarter : styles.tick}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
      />,
    );
  }
  // The ring, centred on each common angle rather than starting at it: the part
  // you press for "down" is the part around 90, which is where you would point.
  const ring = COMMON.map(at => {
    const half = COMMON_STEP / 2;
    const label = `${at} degrees`;
    const seat = pointAt(at, (RING_OUTER + RING_INNER) / 2);
    return (
      <g key={`ring${at}`}>
        <path
          className={`${styles.segment} ${at === angle ? styles.segmentOn : ''}`}
          d={band(at - half, at + half)}
          role="button"
          tabIndex={0}
          aria-label={label}
          onPointerDown={event => {
            // The dial underneath must not also take this press: a click on
            // "down" means 90, not 87 because that is where the pointer was.
            event.stopPropagation();
            onChange(at);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onChange(at);
            }
          }}
          // Only for the keyboard, which is what an outline is for. A pressed
          // segment already says so by taking the angle.
          onFocus={event => {
            if (event.currentTarget.matches?.(':focus-visible')) {
              setFocused(at);
            }
          }}
          onBlur={() => setFocused(seen => (seen === at ? null : seen))}
        >
          <title>{label}</title>
        </path>
        <text
          className={styles.seat}
          x={seat.x}
          y={seat.y}
          textAnchor="middle"
          dominantBaseline="central"
          pointerEvents="none"
        >
          {at}
        </text>
      </g>
    );
  });

  const tip = pointAt(angle, RADIUS - TICK);

  return (
    <div className={styles.editor}>
      <svg
        ref={svgRef}
        className={styles.dial}
        width={SIZE}
        height={SIZE}
        onPointerDown={event => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
          pointTo(event);
        }}
        onPointerMove={event => {
          if (dragging) {
            pointTo(event);
          }
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {ring}
        {focused !== null && (
          <path
            className={styles.focusRing}
            d={band(focused - COMMON_STEP / 2, focused + COMMON_STEP / 2)}
            pointerEvents="none"
          />
        )}
        <circle
          className={styles.face}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          role="slider"
          aria-label="angle in degrees"
          aria-valuenow={angle}
          aria-valuemin={0}
          aria-valuemax={359}
        />
        {ticks}
        <line
          className={styles.arrow}
          x1={CENTER}
          y1={CENTER}
          x2={tip.x}
          y2={tip.y}
        />
        <circle className={styles.handle} cx={tip.x} cy={tip.y} r={5} />
      </svg>
      <div className={styles.inputs}>
        <input
          ref={boxRef}
          // TEXT, not `number`. A number input has no selection to speak of —
          // `select()` is honoured unevenly and `selectionStart` is not readable
          // at all — and opening with the value selected is the whole point of
          // the box. `inputMode` still asks a phone for digits.
          type="text"
          inputMode="numeric"
          aria-label="angle in degrees"
          value={draft}
          // Clicking back into it selects the whole number too, so the second
          // edit is as quick as the first.
          onFocus={event => event.currentTarget.select()}
          onChange={event => {
            // The BOX keeps what was typed and the DIAL takes what parses. A
            // controlled box rewritten to the normalized angle on every
            // keystroke fights the typist: `90` selected and `135` typed came
            // out as `185`, because each digit was re-normalized and the caret
            // moved under it.
            setDraft(event.target.value);
            const typed = Number(event.target.value.trim());
            if (event.target.value.trim() !== '' && Number.isFinite(typed)) {
              onChange(normalizeAngle(typed));
            }
          }}
          // Leaving it says what was settled on, in the dial's own terms:
          // `370` becomes `10`, and an empty box goes back to the angle.
          //
          // AND SAYS NOTHING WHEN THERE IS NOTHING TO SAY. Pressing a ring
          // segment blurs the box BEFORE the press is handled, so a blur that
          // always wrote would write the angle from before the press — and win,
          // because it lands after the change it was racing. Writing only a
          // value that differs from what is there takes it out of the race.
          onBlur={event => {
            const raw = event.currentTarget.value.trim();
            const typed = Number(raw);
            const settled =
              raw !== '' && Number.isFinite(typed)
                ? normalizeAngle(typed)
                : live.current;
            if (String(settled) !== raw) {
              setDraft(String(settled));
            }
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setDraft(String(live.current));
              event.currentTarget.select();
            }
          }}
        />
        <span>°</span>
      </div>
    </div>
  );
}
