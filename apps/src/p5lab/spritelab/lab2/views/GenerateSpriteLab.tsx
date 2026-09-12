import React, {useEffect, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';

import {isFreeplayMode, LevelMode} from '../levelMode';
import {SpriteLab2LevelProperties} from '../types';

import moduleStyles from './sprite-lab2-view.module.scss';

interface GenerateSpriteLabProps {
  levelMode?: LevelMode;
  instructions?: string;
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
  showContinue,
  levelProperties,
}) => {
  // Collapsed hides the instructions but keeps Continue reachable, so a
  // student who wants the screen back is never stranded on the level.
  const [collapsed, setCollapsed] = useState(false);

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

  // Freeplay is the one level whose guide covers work worth seeing.
  const collapsible = isFreeplayMode(levelMode);

  return (
    <Guide
      position="bottom"
      width="normal"
      collapsed={collapsed}
      cornerIcon={
        !collapsible ? undefined : collapsed ? 'maximize' : 'minimize'
      }
      onCornerIconClick={() => setCollapsed(current => !current)}
    >
      <div
        className={moduleStyles.guideAnimator}
        style={bodyHeight === undefined ? undefined : {height: bodyHeight}}
      >
        <div ref={bodyRef} className={moduleStyles.guideBody}>
          {collapsed
            ? null
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
