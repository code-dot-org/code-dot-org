// The level's checklist as the Guide shows it: which items hold, kept once
// earned for the rest of the visit, and the game's progress feeding them.

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {ObjectiveItem, ObjectivesChecklist} from '@cdo/apps/lab2/types';

import {
  checkObjective,
  EMPTY_RUNTIME,
  ObjectiveInputs,
  Objectives,
  RuntimeNeeds,
  RuntimeProgress,
  WorkspaceSource,
} from '../objectives';
import {ImageCounts} from '../projectCounts';
import {WorldCell} from '../world';

export type ObjectiveItemState = ObjectiveItem;

/** The level's checklist as the panel and the guide show it. */
export interface ObjectivesState extends ObjectivesChecklist {
  /** The level declares a checklist. */
  active: boolean;
}

/** A frame's move past the player's speed by this much is a teleport. */
const TELEPORT_SLACK_PX = 4;

/** What the engine reports about the running player. */
export interface PlayerProgressReport {
  /** Image names of sprites the player overlaps this frame. */
  touching: string[];
  /** The player's feet, 0 at the floor to 1 at the top of the view. */
  height: number;
  /** The player's center across the view, in px. */
  x: number;
  /** How far the player walks in a frame, in px. */
  speed: number;
}

/**
 * The running game's progress for the checklist: touches and moves from
 * the engine, and scene landings. Each only grows while the level stays
 * open. The engine also reports during the Code tab's preview; those are
 * dropped, since only a run the student started with Play should count,
 * and Play respawns the player. Reports the level never reads are not
 * kept, since each one re-renders the view; the engine's callback is null
 * when nothing wants it.
 */
export function usePlayProgress(
  playing: boolean,
  needs: RuntimeNeeds
): {
  runtime: RuntimeProgress;
  everPlayed: boolean;
  onPlayerProgress: ((report: PlayerProgressReport) => void) | null;
  onSceneLanded: (sceneId: string) => void;
} {
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  const [farthest, setFarthest] = useState(0);
  const [risen, setRisen] = useState(0);
  // The run's start x, the last x seen, and the lowest the feet have been.
  const runRef = useRef<{x: number; lastX: number; lowest: number} | null>(
    null
  );
  const [scenesLanded, setScenesLanded] = useState<ReadonlySet<string>>(
    new Set()
  );
  const [everPlayed, setEverPlayed] = useState(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    if (!playing) {
      runRef.current = null;
      return;
    }
    setEverPlayed(true);
  }, [playing]);

  const wantsPlayer = needs.touch || needs.move;
  const onPlayerProgress = useCallback(
    (report: PlayerProgressReport) => {
      if (!playingRef.current) {
        return;
      }
      if (needs.touch && report.touching.length) {
        setTouched(current => {
          if (report.touching.every(name => current.has(name))) {
            return current;
          }
          return new Set([...current, ...report.touching]);
        });
      }
      if (needs.move) {
        let run = runRef.current;
        // A frame's move past any walk is a teleport (restart, go to
        // scene): the run starts over there.
        const teleport =
          run &&
          Math.abs(report.x - run.lastX) > report.speed + TELEPORT_SLACK_PX;
        if (!run || teleport) {
          run = {x: report.x, lastX: report.x, lowest: report.height};
          runRef.current = run;
        }
        run.lastX = report.x;
        run.lowest = Math.min(run.lowest, report.height);
        const dx = Math.abs(report.x - run.x);
        const rise = report.height - run.lowest;
        setFarthest(current => Math.max(current, dx));
        setRisen(current => Math.max(current, rise));
      }
    },
    [needs.touch, needs.move]
  );

  const onSceneLanded = useCallback((sceneId: string) => {
    setScenesLanded(current =>
      current.has(sceneId) ? current : new Set([...current, sceneId])
    );
  }, []);

  const runtime = useMemo(
    () => ({touched, farthest, risen, scenesLanded}),
    [touched, farthest, risen, scenesLanded]
  );
  return {
    runtime,
    everPlayed,
    onPlayerProgress: wantsPlayer ? onPlayerProgress : null,
    onSceneLanded,
  };
}

/**
 * The checklist's state. An item stays done once it has held, like the
 * Guide's steps never retreat; a reload starts the list over, as the level's
 * milestone is the lasting record.
 */
export function useObjectives({
  objectives,
  images,
  grid,
  baselineGrid,
  imagesForRole,
  source,
  everPlayed,
  rated,
  runtime,
}: {
  objectives: Objectives | undefined;
  images: ImageCounts;
  grid?: (WorldCell | null)[][];
  baselineGrid?: (WorldCell | null)[][];
  imagesForRole: Record<string, readonly string[] | undefined>;
  source?: WorkspaceSource;
  everPlayed: boolean;
  rated: boolean;
  runtime: RuntimeProgress;
}): ObjectivesState {
  const [earned, setEarned] = useState<ReadonlySet<number>>(new Set());
  const inputs: ObjectiveInputs = useMemo(
    () => ({
      images,
      grid,
      baselineGrid,
      imagesForRole,
      source,
      everPlayed,
      rated,
      runtime: runtime ?? EMPTY_RUNTIME,
    }),
    [
      images,
      grid,
      baselineGrid,
      imagesForRole,
      source,
      everPlayed,
      rated,
      runtime,
    ]
  );
  const items = objectives?.items;
  const earnedRef = useRef(earned);
  earnedRef.current = earned;
  useEffect(() => {
    if (!items?.length) {
      return;
    }
    const held = earnedRef.current;
    const newly = items.flatMap((item, index) =>
      !held.has(index) && checkObjective(item.check, inputs) ? [index] : []
    );
    // No update when nothing new holds: an input rebuilt every render would
    // otherwise re-run this effect without end.
    if (!newly.length) {
      return;
    }
    setEarned(new Set([...held, ...newly]));
  }, [items, inputs]);

  // One object per change: the panel it feeds is memoized on it.
  return useMemo<ObjectivesState>(() => {
    if (!objectives) {
      return {active: false, items: [], allDone: false};
    }
    const states = (items ?? []).map((item, index) => ({
      id: item.id,
      text: item.text,
      done: earned.has(index),
    }));
    return {
      active: true,
      title: objectives.title,
      items: states,
      allDone: states.every(item => item.done),
      collapsedText: objectives.collapsedText,
    };
  }, [objectives, items, earned]);
}
