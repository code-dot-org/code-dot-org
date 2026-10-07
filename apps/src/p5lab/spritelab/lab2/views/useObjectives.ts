// The level's checklist as the Guide shows it: which items hold, kept once
// earned for the rest of the visit, and the game's progress feeding them.

import {useCallback, useEffect, useMemo, useState} from 'react';

import {
  checkObjective,
  EMPTY_RUNTIME,
  ObjectiveInputs,
  Objectives,
  RuntimeProgress,
  WorkspaceSource,
} from '../objectives';
import {ImageCounts} from '../projectCounts';
import {Tab} from '../redux/spriteLab2Redux';
import {WorldCell} from '../world';

export interface ObjectiveItemState {
  text: string;
  done: boolean;
}

export interface ObjectivesState {
  /** The level declares a checklist. */
  active: boolean;
  title?: string;
  items: ObjectiveItemState[];
  allDone: boolean;
  collapsedText?: string;
}

/** What the engine reports about the running player. */
export interface PlayerProgressReport {
  /** Image names of sprites the player overlaps this frame. */
  touching: string[];
  /** The player's feet, 0 at the floor to 1 at the top of the view. */
  height: number;
}

/**
 * The running game's progress for the checklist: touches and height from
 * the engine, scene landings, and the longest run so far. Each only grows
 * while the level stays open.
 */
export function usePlayProgress(playing: boolean): {
  runtime: RuntimeProgress;
  everPlayed: boolean;
  onPlayerProgress: (report: PlayerProgressReport) => void;
  onSceneLanded: (sceneId: string) => void;
} {
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  const [highest, setHighest] = useState(0);
  const [scenesLanded, setScenesLanded] = useState<ReadonlySet<string>>(
    new Set()
  );
  const [longestRunSeconds, setLongestRunSeconds] = useState(0);
  const [everPlayed, setEverPlayed] = useState(false);

  useEffect(() => {
    if (!playing) {
      return;
    }
    setEverPlayed(true);
    const startedAt = Date.now();
    const tick = () =>
      setLongestRunSeconds(longest =>
        Math.max(longest, (Date.now() - startedAt) / 1000)
      );
    const timer = window.setInterval(tick, 500);
    return () => {
      window.clearInterval(timer);
      tick();
    };
  }, [playing]);

  const onPlayerProgress = useCallback((report: PlayerProgressReport) => {
    if (report.touching.length) {
      setTouched(current => {
        if (report.touching.every(name => current.has(name))) {
          return current;
        }
        return new Set([...current, ...report.touching]);
      });
    }
    setHighest(current => Math.max(current, report.height));
  }, []);

  const onSceneLanded = useCallback((sceneId: string) => {
    setScenesLanded(current =>
      current.has(sceneId) ? current : new Set([...current, sceneId])
    );
  }, []);

  const runtime = useMemo(
    () => ({longestRunSeconds, touched, highest, scenesLanded}),
    [longestRunSeconds, touched, highest, scenesLanded]
  );
  return {runtime, everPlayed, onPlayerProgress, onSceneLanded};
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
  imageForRole,
  source,
  activeTab,
  everPlayed,
  runtime,
}: {
  objectives: Objectives | undefined;
  images: ImageCounts;
  grid?: (WorldCell | null)[][];
  baselineGrid?: (WorldCell | null)[][];
  imageForRole: Record<string, string | undefined>;
  source?: WorkspaceSource;
  activeTab: Tab;
  everPlayed: boolean;
  runtime: RuntimeProgress;
}): ObjectivesState {
  const [earned, setEarned] = useState<ReadonlySet<number>>(new Set());
  const inputs: ObjectiveInputs = useMemo(
    () => ({
      images,
      grid,
      baselineGrid,
      imageForRole,
      source,
      activeTab,
      everPlayed,
      runtime: runtime ?? EMPTY_RUNTIME,
    }),
    [
      images,
      grid,
      baselineGrid,
      imageForRole,
      source,
      activeTab,
      everPlayed,
      runtime,
    ]
  );
  const items = objectives?.items;
  useEffect(() => {
    if (!items?.length) {
      return;
    }
    setEarned(current => {
      const next = new Set(current);
      items.forEach((item, index) => {
        if (!next.has(index) && checkObjective(item.check, inputs)) {
          next.add(index);
        }
      });
      return next.size === current.size ? current : next;
    });
  }, [items, inputs]);

  if (!objectives) {
    return {active: false, items: [], allDone: false};
  }
  const states = (items ?? []).map((item, index) => ({
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
}
