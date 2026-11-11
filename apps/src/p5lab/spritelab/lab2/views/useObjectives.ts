// The level's checklist as the Guide shows it: which items hold, kept once
// earned for the rest of the visit, and the game's progress feeding them.

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {ObjectiveItem, ObjectivesChecklist} from '@cdo/apps/lab2/types';

import {
  checkObjective,
  EMPTY_RUNTIME,
  followsItsWork,
  Objective,
  ObjectiveInputs,
  Objectives,
  objectiveShown,
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
  /** The indexes of the completed items, counted in the level's full list
      (hidden items included). Callouts refer to items by this index. */
  earned: ReadonlySet<number>;
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
 * The checklist's state. An item about lasting work (see followsItsWork) is
 * completed only while its check passes. Any other item stays completed
 * once its check has passed. An item that has appeared stays visible.
 * Reloading the page starts the checklist over; the level's saved progress
 * is what lasts.
 */
export function useObjectives({
  objectives,
  images,
  grid,
  baselineGrid,
  imagesForRole,
  source,
  sceneSources,
  editingSceneId,
  everPlayed,
  generated,
  rated,
  runtime,
}: {
  objectives: Objectives | undefined;
  images: ImageCounts;
  grid?: (WorldCell | null)[][];
  baselineGrid?: (WorldCell | null)[][];
  imagesForRole: Record<string, readonly string[] | undefined>;
  source?: WorkspaceSource;
  sceneSources?: Record<string, WorkspaceSource | undefined>;
  editingSceneId?: string;
  everPlayed: boolean;
  generated: ImageCounts;
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
      sceneSources,
      editingSceneId,
      everPlayed,
      generated,
      rated,
      runtime: runtime ?? EMPTY_RUNTIME,
    }),
    [
      images,
      grid,
      baselineGrid,
      imagesForRole,
      source,
      sceneSources,
      editingSceneId,
      everPlayed,
      generated,
      rated,
      runtime,
    ]
  );
  const items = objectives?.items;
  // The indexes of the items that pass `test` and are not in `already`.
  const newIndexes = useCallback(
    (
      already: ReadonlySet<number>,
      test: (item: Objective, inputs: ObjectiveInputs) => boolean
    ) =>
      (items ?? []).flatMap((item, index) =>
        !already.has(index) && test(item, inputs) ? [index] : []
      ),
    [items, inputs]
  );
  // The items visible at the start are worked out during the first render,
  // so that mounting does not cause a second render.
  const [shown, setShown] = useState<ReadonlySet<number>>(
    () => new Set(newIndexes(new Set(), objectiveShown))
  );
  const earnedRef = useRef(earned);
  earnedRef.current = earned;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  useEffect(() => {
    const completed = earnedRef.current;
    const newlyCompleted = newIndexes(completed, (item, inputs) =>
      checkObjective(item.check, inputs)
    );
    // A completed item about lasting work whose check no longer passes:
    // the student has undone the work.
    const undone = [...completed].filter(index => {
      const item = items?.[index];
      return (
        !!item &&
        followsItsWork(item.check) &&
        !checkObjective(item.check, inputs)
      );
    });
    const visible = shownRef.current;
    const newlyVisible = newIndexes(visible, objectiveShown);
    // State is set only when something changed. The inputs are a new object
    // on most renders, so setting state every time would loop forever.
    if (newlyCompleted.length || undone.length) {
      setEarned(
        new Set(
          [...completed, ...newlyCompleted].filter(
            index => !undone.includes(index)
          )
        )
      );
    }
    if (newlyVisible.length) {
      setShown(new Set([...visible, ...newlyVisible]));
    }
  }, [newIndexes, items, inputs]);

  // The result is a new object only when something changed, because the
  // panel that receives it re-renders whenever the object is new.
  return useMemo<ObjectivesState>(() => {
    if (!objectives) {
      return {active: false, items: [], allDone: false, earned};
    }
    const states = (items ?? []).flatMap((item, index) =>
      shown.has(index)
        ? [{id: item.id, text: item.text, done: earned.has(index)}]
        : []
    );
    return {
      active: true,
      title: objectives.title,
      items: states,
      allDone: states.every(item => item.done),
      collapsedText: objectives.collapsedText,
      earned,
    };
  }, [objectives, items, earned, shown]);
}
