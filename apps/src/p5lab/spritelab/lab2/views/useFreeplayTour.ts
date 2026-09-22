import {useCallback, useEffect, useMemo, useState} from 'react';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {setActiveTab} from '../redux/spriteLab2Redux';
import {Scene} from '../types';

import {
  TOUR_LIST_STEPS,
  TOUR_STEPS,
  TourStep,
  TourTarget,
  TourVariant,
} from './freeplayTour';

// CustomDropdown names its trigger after the dropdown's name (see
// SceneSelector).
const SCENE_CHIP_SELECTOR = '#scene-dropdown-button';

interface FreeplayTourOptions {
  variant: TourVariant | undefined;
  scenes: Scene[];
  selectScene: (sceneId: string) => void;
}

export interface FreeplayTour {
  variant: TourVariant;
  /** The lab below the bar is blacked out (before the first view). */
  coverBlack: boolean;
  /** The step whose view is up: the current one, or the clicked line. */
  current: TourStep | undefined;
  arrowTarget: TourTarget | undefined;
  /** Steps variant: whether the current step is the last. */
  isLast: boolean;
  next: () => void;
  /** List variant: show a line's view. */
  show: (stepId: string) => void;
  done: () => void;
}

/**
 * Runs the freeplay welcome tour while a ?tour= parameter asks for one. Each
 * step's view is applied here (tab, scene, the open scene menu); the guide
 * shows its text through FreeplayTourGuide.
 */
export default function useFreeplayTour({
  variant,
  scenes,
  selectScene,
}: FreeplayTourOptions): FreeplayTour | undefined {
  const dispatch = useAppDispatch();
  const [active, setActive] = useState(!!variant);
  const [stepIndex, setStepIndex] = useState(0);
  const [shownId, setShownId] = useState<string | null>(null);

  const current = useMemo(() => {
    if (!variant) {
      return undefined;
    }
    if (variant === 'steps') {
      return TOUR_STEPS[stepIndex];
    }
    return TOUR_LIST_STEPS.find(step => step.id === shownId);
  }, [variant, stepIndex, shownId]);

  // The platform scene the world and code steps show; the first scene if
  // the project has none.
  const platformScene = useMemo(
    () => scenes.find(s => s.type === 'platform') ?? scenes[0],
    [scenes]
  );

  useEffect(() => {
    if (!active || !current) {
      return;
    }
    switch (current.view) {
      case 'scene-menu': {
        dispatch(setActiveTab('Code'));
        // After the tab lands, so the chip is enabled.
        const handle = window.setTimeout(() => {
          const chip =
            document.querySelector<HTMLButtonElement>(SCENE_CHIP_SELECTOR);
          const menu = document.querySelector('ul[aria-label="Scenes"]');
          const open =
            menu && getComputedStyle(menu.parentElement!).display !== 'none';
          if (chip && !open) {
            chip.click();
          }
        }, 50);
        return () => window.clearTimeout(handle);
      }
      case 'gallery':
        dispatch(setActiveTab('Scenes'));
        return;
      case 'world':
        if (platformScene) {
          selectScene(platformScene.id);
        }
        dispatch(setActiveTab('World'));
        return;
      case 'code':
        if (platformScene) {
          selectScene(platformScene.id);
        }
        dispatch(setActiveTab('Code'));
        return;
      case 'play-hint':
        dispatch(setActiveTab('Code'));
        return;
      default:
        return;
    }
    // selectScene changes with the active tab; re-running on that would
    // re-apply the view after the student's own tab clicks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, current, dispatch, platformScene]);

  const done = useCallback(() => {
    setActive(false);
    // The level's normal starting view: the first scene's code.
    if (scenes[0]) {
      selectScene(scenes[0].id);
    }
    dispatch(setActiveTab('Code'));
  }, [scenes, selectScene, dispatch]);

  const next = useCallback(() => {
    if (stepIndex + 1 >= TOUR_STEPS.length) {
      done();
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex, done]);

  const show = useCallback((stepId: string) => setShownId(stepId), []);

  if (!variant || !active) {
    return undefined;
  }
  return {
    variant,
    coverBlack: variant === 'steps' ? current?.view === 'blank' : !shownId,
    current,
    arrowTarget: current?.target,
    isLast: variant === 'steps' && stepIndex === TOUR_STEPS.length - 1,
    next,
    show,
    done,
  };
}
