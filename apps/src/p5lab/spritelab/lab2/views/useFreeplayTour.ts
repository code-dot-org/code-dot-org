import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {setActiveTab} from '../redux/spriteLab2Redux';
import {Scene} from '../types';

import {
  SCENE_MENU_SELECTOR,
  tourListSteps,
  tourSteps,
  TourStep,
  TourTarget,
  TourVariant,
  TourView,
} from './freeplayTour';
import {SCENE_CHIP_ID} from './SceneSelector';

/** The layer holding the guide: the one place clicks land during a tour. */
export const TOUR_LAYER_ID = 'spritelab2-tour-guide';

// Everything a pointer can start; wheel and keys stay free.
const POINTER_EVENTS = [
  'pointerdown',
  'pointerup',
  'mousedown',
  'mouseup',
  'click',
  'dblclick',
  'touchstart',
  'touchend',
  'contextmenu',
];
const MENU_CLOSING_EVENTS = ['pointerdown', 'mousedown'];

// The chip toggles its menu; a click when already in the wanted state
// would flip it back.
function toggleSceneMenu(open: boolean) {
  const chip = document.getElementById(SCENE_CHIP_ID);
  const menu = document.querySelector(SCENE_MENU_SELECTOR);
  const isOpen =
    !!menu && getComputedStyle(menu.parentElement!).display !== 'none';
  if (chip && isOpen !== open) {
    chip.click();
  }
}

interface FreeplayTourOptions {
  variant: TourVariant | undefined;
  /** The scene chip opens the gallery rather than a menu. */
  chipOpensGallery: boolean;
  scenes: Scene[];
  selectScene: (sceneId: string) => void;
  /** Enter the Play tab from the start of the game. */
  startPlay: () => void;
}

export interface FreeplayTour {
  variant: TourVariant;
  /** The lab below the bar is blacked out: before the first view, and
      behind the open scene menu. */
  coverBlack: boolean;
  /** The list variant's lines. */
  lines: TourStep[];
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
  chipOpensGallery,
  scenes,
  selectScene,
  startPlay,
}: FreeplayTourOptions): FreeplayTour | undefined {
  const dispatch = useAppDispatch();
  const [active, setActive] = useState(!!variant);
  const [stepIndex, setStepIndex] = useState(0);
  const [shownId, setShownId] = useState<string | null>(null);

  const steps = useMemo(() => tourSteps(chipOpensGallery), [chipOpensGallery]);
  const lines = useMemo(() => tourListSteps(steps), [steps]);

  const current = useMemo(() => {
    if (!variant) {
      return undefined;
    }
    if (variant === 'steps') {
      return steps[stepIndex];
    }
    return lines.find(step => step.id === shownId);
  }, [variant, steps, lines, stepIndex, shownId]);

  // Only the guide takes clicks while the tour runs. A capture listener on
  // window runs before every other handler, so stopping the event there
  // keeps it from all of them, Blockly's and the scene menu's included.
  // The scene menu also closes on a press anywhere outside it, heard at
  // the document on pointerdown and mousedown; while a step shows the menu,
  // presses in the guide stop short of the document too, so Next leaves it
  // up. The click itself still arrives, so the buttons work.
  const menuShownRef = useRef(false);
  menuShownRef.current = current?.view === 'scene-menu';
  useEffect(() => {
    if (!active) {
      return;
    }
    const guard = (event: Event) => {
      // Script-made clicks are the tour's own (the chip, below).
      if (!event.isTrusted) {
        return;
      }
      const layer = document.getElementById(TOUR_LAYER_ID);
      if (event.target instanceof Node && layer?.contains(event.target)) {
        if (menuShownRef.current && MENU_CLOSING_EVENTS.includes(event.type)) {
          event.stopPropagation();
        }
        return;
      }
      event.stopPropagation();
      event.preventDefault();
    };
    const options = {capture: true, passive: false};
    POINTER_EVENTS.forEach(type =>
      window.addEventListener(type, guard, options)
    );
    return () =>
      POINTER_EVENTS.forEach(type =>
        window.removeEventListener(type, guard, options)
      );
  }, [active]);

  // The platform scene the world and code steps show; the first scene if
  // the project has none.
  const platformScene = useMemo(
    () => scenes.find(s => s.type === 'platform') ?? scenes[0],
    [scenes]
  );

  // Keyed on the view, not the step: two steps in a row with the scene
  // menu up keep it up rather than closing and reopening it.
  const view = current?.view;
  // The effect runs after the render that changed the step has painted, so
  // the cover stays up until the view it applies is the one on screen.
  const [appliedView, setAppliedView] = useState<TourView>();
  const coverRef = useRef(true);
  useEffect(() => {
    if (!active || !view) {
      return;
    }
    let cleanup: (() => void) | undefined;
    switch (view) {
      case 'scene-menu': {
        dispatch(setActiveTab('Code'));
        // After the tab lands, so the chip is enabled.
        const handle = window.setTimeout(() => toggleSceneMenu(true), 50);
        cleanup = () => {
          window.clearTimeout(handle);
          toggleSceneMenu(false);
        };
        break;
      }
      case 'gallery':
        dispatch(setActiveTab('Scenes'));
        break;
      case 'world':
        if (platformScene) {
          selectScene(platformScene.id);
        }
        dispatch(setActiveTab('World'));
        break;
      case 'code':
        if (platformScene) {
          selectScene(platformScene.id);
        }
        dispatch(setActiveTab('Code'));
        break;
      case 'play':
        startPlay();
        break;
      default:
        break;
    }
    setAppliedView(view);
    return cleanup;
    // selectScene and startPlay change with the active tab; re-running on
    // them would re-apply the view after the student's own tab clicks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, view, dispatch, platformScene]);

  const done = useCallback(() => {
    setActive(false);
    // The level's normal starting view: the first scene's code.
    if (scenes[0]) {
      selectScene(scenes[0].id);
    }
    dispatch(setActiveTab('Code'));
  }, [scenes, selectScene, dispatch]);

  const next = useCallback(() => {
    if (stepIndex + 1 >= steps.length) {
      done();
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex, steps, done]);

  const show = useCallback((stepId: string) => setShownId(stepId), []);

  // The cover is held, never raised, while a view is pending: dropped
  // early it would show the tab underneath for a frame, raised it would
  // blink black between two open views.
  const wantsCover = !view || view === 'blank' || view === 'scene-menu';
  const coverBlack = wantsCover || (coverRef.current && appliedView !== view);
  coverRef.current = coverBlack;

  if (!variant || !active) {
    return undefined;
  }
  return {
    variant,
    coverBlack,
    lines,
    current,
    arrowTarget: current?.target,
    isLast: variant === 'steps' && stepIndex === steps.length - 1,
    next,
    show,
    done,
  };
}
