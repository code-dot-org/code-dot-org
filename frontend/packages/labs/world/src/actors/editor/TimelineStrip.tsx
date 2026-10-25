// An animation's timeline, under the row that chooses it
// (SIMPLE_INTERFACE.md, "Animations"; specs/ANIMATION_PLAN.md, step 6).
//
// A strip the length of the timeline (`drawnLength`) with a row per
// property the animation moves and a mark at each of its keys, and a
// playhead. Pressing or dragging the strip moves the playhead, and the
// picture above shows that moment; Play runs it from there, round again if
// it loops and to its end if it does not.
//
// THE STRIP IS A SLIDER, which is what it is to a keyboard: the arrows move
// the playhead a tick, Home and End go to the start and the last key, and
// what it says is the time.

import {Button, Typography} from '@mui/material';
import {useEffect, useRef, useState, type KeyboardEvent} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {
  DEFAULT_LENGTH,
  endOf,
  timeIn,
  type Timeline,
} from '../../engine/core/keyframes';

import styles from './actorEditor.module.css';

/** How far an arrow moves the playhead, in seconds. */
export const TICK = 0.1;

/** `t` to the nearest tick, and to the millisecond, as a key's time is. */
const toTick = (t: number): number =>
  Math.round(Math.round(t / TICK) * TICK * 1000) / 1000;

/** What each track is called on its row. */
const TRACK_NAMES: Record<string, string> = {
  sprite: 'Picture',
  drawnOffset: 'Offset',
  drawnScale: 'Scale',
  drawnTurn: 'Turn',
  opacity: 'Opacity',
};

/** A track's name for its row: its property, or the effect it switches. */
export const trackName = (
  property: string,
  effectName: (path: string) => string = path => path,
): string =>
  property.startsWith('effect:')
    ? effectName(property.slice('effect:'.length))
    : (TRACK_NAMES[property] ?? property);

/**
 * How long the strip is drawn, in seconds: what the animation says, else
 * five seconds for one with nothing on it yet — room to put the first keys
 * (SIMPLE_INTERFACE.md) — else its own length, to the next whole second.
 * A quarter-second flap drawn across five seconds is five keys on top of
 * one another.
 */
export const drawnLength = (timeline: Timeline): number => {
  const end = endOf(timeline);
  if (timeline.length !== undefined) {
    return Math.max(timeline.length, end);
  }
  return end > 0 ? Math.max(1, Math.ceil(end)) : DEFAULT_LENGTH;
};

/** The time as a person reads it: "1.2 s". */
const seconds = (t: number) => `${Math.round(t * 10) / 10} s`;

export interface TimelineStripProps {
  /** The animation's name, for what the strip is called. */
  name: string;
  timeline: Timeline;
  /** Where the playhead is, in seconds. */
  time: number;
  onTime: (t: number) => void;
  /** What an effect track's effect is called. */
  effectName?: (path: string) => string;
  /** The key chosen, if one is: its track and its time. */
  selectedKey?: {property: string; at: number};
  onSelectKey?: (key: {property: string; at: number} | undefined) => void;
  /** Move a key to another time; absent, keys are not moved here. */
  onMoveKey?: (property: string, from: number, to: number) => void;
  onDeleteKey?: (property: string, at: number) => void;
  /** Draw the strip this many seconds long; absent, it cannot be changed. */
  onLength?: (length: number) => void;
  /** Lay a sheet's cells on from the playhead; absent, no button for it. */
  onAddFrames?: () => void;
}

export const TimelineStrip = ({
  name,
  timeline,
  time,
  onTime,
  effectName,
  selectedKey,
  onSelectKey,
  onMoveKey,
  onDeleteKey,
  onLength,
  onAddFrames,
}: TimelineStripProps) => {
  const end = endOf(timeline);
  const length = drawnLength(timeline);
  const strip = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  // Playing: from where the playhead is, by the clock, through `timeIn`, so
  // it wraps and stops as the game's does. Stopped by a press anywhere on
  // the strip, as by Stop.
  const timeRef = useRef(time);
  timeRef.current = time;
  useEffect(() => {
    if (!playing) {
      return;
    }
    const from = timeRef.current >= end ? 0 : timeRef.current;
    const started = performance.now();
    let raf = 0;
    const step = () => {
      const at = timeIn(timeline, from + (performance.now() - started) / 1000);
      onTime(at.t);
      if (at.ended) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // `onTime` is the parent's setter, the same each render.
  }, [playing, timeline, end]);

  const at = (clientX: number) => {
    const box = strip.current?.getBoundingClientRect();
    if (!box || box.width <= 0) {
      return 0;
    }
    const fraction = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    // To the tick, so a press lands where an arrow would.
    return toTick(fraction * length);
  };
  const press = (event: React.PointerEvent<HTMLDivElement>) => {
    setPlaying(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onTime(at(event.clientX));
  };
  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons) {
      onTime(at(event.clientX));
    }
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number | undefined> = {
      ArrowLeft: time - TICK,
      ArrowDown: time - TICK,
      ArrowRight: time + TICK,
      ArrowUp: time + TICK,
      Home: 0,
      End: end,
    };
    const next = moves[event.key];
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    setPlaying(false);
    onTime(toTick(Math.min(length, Math.max(0, next))));
  };

  // A key being dragged: which, and where it is now. Written once, when
  // it is let go, so a drag is one edit.
  const [dragging, setDragging] = useState<{
    property: string;
    from: number;
    to: number;
  }>();
  const keyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    property: string,
    at: number,
  ) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      onDeleteKey?.(property, at);
      onSelectKey?.(undefined);
      return;
    }
    const by =
      event.key === 'ArrowLeft' ? -TICK : event.key === 'ArrowRight' ? TICK : 0;
    if (by && event.altKey && onMoveKey) {
      event.preventDefault();
      const to = toTick(Math.min(length, Math.max(0, at + by)));
      onMoveKey(property, at, to);
      onSelectKey?.({property, at: to});
      onTime(to);
    }
  };

  const place = (t: number) => `${(t / length) * 100}%`;
  const tracks = Object.entries(timeline.tracks);
  const marks = Array.from(
    {length: Math.floor(length / 0.5) + 1},
    (_unused, index) => index * 0.5,
  );

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineHead}>
        <Button
          variant="text"
          size="small"
          startIcon={
            <FontAwesomeV6Icon
              iconName={playing ? 'stop' : 'play'}
              iconStyle="solid"
            />
          }
          disabled={end <= 0}
          onClick={() => setPlaying(was => !was)}
        >
          {playing ? 'Stop' : 'Play'}
        </Button>
        <Typography variant="body3" component="span" aria-hidden="true">
          {seconds(time)}
        </Typography>
        {onAddFrames && (
          <Button
            variant="text"
            size="small"
            startIcon={<FontAwesomeV6Icon iconName="film" iconStyle="solid" />}
            onClick={() => {
              setPlaying(false);
              onAddFrames();
            }}
          >
            Add frames…
          </Button>
        )}
        {onLength && (
          // Room for keys later than its last: the strip is drawn this long.
          <label className={styles.timelineLength}>
            Length
            <input
              type="number"
              min={Math.max(TICK, end)}
              step={0.5}
              value={length}
              onChange={event => {
                const next = Number(event.target.value);
                if (Number.isFinite(next) && next > 0) {
                  onLength(next);
                }
              }}
            />
            s
          </label>
        )}
      </div>
      <div className={styles.timelineBody}>
        <ul className={styles.trackNames} aria-hidden="true">
          {tracks.map(([property]) => (
            <li key={property}>{trackName(property, effectName)}</li>
          ))}
        </ul>
        <div
          ref={strip}
          className={styles.strip}
          onPointerDown={press}
          onPointerMove={drag}
        >
          <div
            className={styles.ruler}
            role="slider"
            tabIndex={0}
            aria-label={`${name} timeline`}
            aria-valuemin={0}
            aria-valuemax={length}
            aria-valuenow={Math.round(time * 1000) / 1000}
            aria-valuetext={seconds(time)}
            onKeyDown={key}
          >
            {marks.map(t => (
              <span
                key={t}
                aria-hidden="true"
                className={
                  Number.isInteger(t) ? styles.rulerSecond : styles.rulerHalf
                }
                style={{left: place(t)}}
              >
                {/* Not at the very end, where the number would fall off
                    the strip: the length is said by the slider. */}
                {Number.isInteger(t) && t < length ? `${t}` : ''}
              </span>
            ))}
          </div>
          {tracks.map(([property, track]) => (
            <div key={property} className={styles.track}>
              {track.map(one => {
                const chosen =
                  selectedKey?.property === property &&
                  selectedKey.at === one.at;
                const shownAt =
                  dragging?.property === property && dragging.from === one.at
                    ? dragging.to
                    : one.at;
                return (
                  <button
                    key={one.at}
                    type="button"
                    className={
                      chosen ? `${styles.key} ${styles.keyChosen}` : styles.key
                    }
                    style={{left: place(shownAt)}}
                    aria-label={`${trackName(property, effectName)} key at ${seconds(one.at)}`}
                    aria-pressed={chosen}
                    // A key is pressed, not the strip under it.
                    onPointerDown={event => {
                      event.stopPropagation();
                      setPlaying(false);
                      onSelectKey?.({property, at: one.at});
                      onTime(one.at);
                      if (onMoveKey) {
                        event.currentTarget.setPointerCapture?.(
                          event.pointerId,
                        );
                        setDragging({property, from: one.at, to: one.at});
                      }
                    }}
                    onPointerMove={event => {
                      event.stopPropagation();
                      if (dragging && event.buttons) {
                        setDragging({...dragging, to: at(event.clientX)});
                      }
                    }}
                    onPointerUp={event => {
                      event.stopPropagation();
                      if (dragging && dragging.to !== dragging.from) {
                        onMoveKey?.(
                          dragging.property,
                          dragging.from,
                          dragging.to,
                        );
                        onSelectKey?.({property, at: dragging.to});
                        onTime(dragging.to);
                      }
                      setDragging(undefined);
                    }}
                    onKeyDown={event => keyDown(event, property, one.at)}
                  />
                );
              })}
            </div>
          ))}
          {tracks.length === 0 && (
            <div className={styles.track} aria-hidden="true" />
          )}
          <span
            className={styles.playhead}
            style={{left: place(time)}}
            aria-hidden="true"
          />
        </div>
      </div>
      {tracks.length === 0 && (
        <Typography variant="body3" component="p" className={styles.note}>
          Nothing moves yet. Change a picture or a property with the playhead
          where it should happen.
        </Typography>
      )}
    </div>
  );
};

export default TimelineStrip;
