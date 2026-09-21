import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';

import {isFreeplayMode, LevelMode} from '../levelMode';
import {SpriteLab2LevelProperties} from '../types';

import moduleStyles from './sprite-lab2-view.module.scss';

/** The guide's width on the Play tab, where it shares the room with the
    game. */
export const PLAY_GUIDE_WIDTH_PX = 400;

/**
 * The panel's size once its animations end: a hidden copy laid out with the
 * transitions off and the body at its natural height. The live panel's size
 * mid-animation is not a size anything should be laid out against.
 */
function settledSize(
  panel: HTMLElement,
  animatorClass: string
): {width: number; height: number} {
  const copy = panel.cloneNode(true) as HTMLElement;
  copy.removeAttribute('id');
  copy.style.transition = 'none';
  copy.style.animation = 'none';
  copy.style.visibility = 'hidden';
  const animator = copy.querySelector<HTMLElement>(`.${animatorClass}`);
  if (animator) {
    animator.style.transition = 'none';
    animator.style.height = 'auto';
  }
  panel.parentElement?.appendChild(copy);
  const {width, height} = copy.getBoundingClientRect();
  copy.remove();
  return {width, height};
}

interface GenerateSpriteLabProps {
  levelMode?: LevelMode;
  instructions?: string;
  /** Shown in place of the instructions while collapsed. */
  collapsedText?: string;
  /** Fixed width in px; the default is the Guide's normal share. */
  width?: number;
  /** The size the panel is settling to, whenever it changes, for siblings
      that lay out around it. */
  onLayout?: (size: {width: number; height: number}) => void;
  /** Offer the Continue button: the guide reached a step that marks the
      level's task complete. */
  showContinue?: boolean;
  /** For the Continue button's progression handling. */
  levelProperties: SpriteLab2LevelProperties;
}

/**
 * The Lab2 Guide overlay, modeled on Music Lab's: the level's staged
 * instructions, and the Continue button once a step says the task is done.
 */
const GenerateSpriteLab: React.FunctionComponent<GenerateSpriteLabProps> = ({
  levelMode,
  instructions,
  collapsedText,
  width,
  onLayout,
  showContinue,
  levelProperties,
}) => {
  // Collapsed hides the instructions but keeps Continue reachable.
  const [collapsed, setCollapsed] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  // Before paint, so a sibling laid out from the size is never placed
  // against the old one. The observer covers the container resizing.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (panel && onLayout) {
      onLayout(settledSize(panel, moduleStyles.guideAnimator));
    }
  }, [onLayout, width, collapsed, instructions, collapsedText, showContinue]);
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !onLayout) {
      return;
    }
    const observer = new ResizeObserver(() =>
      onLayout(settledSize(panel, moduleStyles.guideAnimator))
    );
    observer.observe(panel);
    return () => observer.disconnect();
  }, [onLayout]);

  // Animate the Guide's height: the outer wrapper gets an explicit height
  // (which CSS can transition) tracking the natural height of the inner body.
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>();
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }
    const observer = new ResizeObserver(() => setBodyHeight(body.offsetHeight));
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  // Read-aloud of the guide text, on the same level/script property the
  // platform's instructions panel uses.
  const showTts =
    !!levelProperties.offerBrowserTts || queryParams('show-tts') === 'true';
  const instructionsBlock = instructions && (
    <MainInstructionsContent
      instructionsText={instructions}
      markdownClassName={moduleStyles.guideInstructions}
      showTts={showTts}
    />
  );

  // Freeplay's guide sits over a full lab; the guided levels need theirs open.
  const collapsible = isFreeplayMode(levelMode);

  return (
    <Guide
      position="bottom"
      width={width ?? 'normal'}
      collapsed={collapsed}
      cornerIcon={
        !collapsible ? undefined : collapsed ? 'maximize' : 'minimize'
      }
      onCornerIconClick={() => setCollapsed(current => !current)}
      panelRef={panelRef}
    >
      <div
        className={moduleStyles.guideAnimator}
        style={bodyHeight === undefined ? undefined : {height: bodyHeight}}
      >
        <div ref={bodyRef} className={moduleStyles.guideBody}>
          {collapsed
            ? collapsedText && (
                <p className={moduleStyles.guideCollapsedText}>
                  {collapsedText}
                </p>
              )
            : instructionsBlock || 'Build a program, then press Run.'}
          {showContinue && (
            <div className={moduleStyles.guideContinue}>
              <NavigationArea
                levelProperties={levelProperties}
                // No Run/Submit gating here: reaching this step is the gate.
                hasRun={true}
                hasEdited={true}
                isRunning={false}
                textVariant="simple"
              />
            </div>
          )}
        </div>
      </div>
    </Guide>
  );
};

export default GenerateSpriteLab;
