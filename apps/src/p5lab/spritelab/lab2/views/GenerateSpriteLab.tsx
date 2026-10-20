import React, {useEffect, useRef, useState} from 'react';

import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';

import {isFreeplayMode, LevelMode} from '../levelMode';
import {SpriteLab2LevelProperties} from '../types';

import ObjectivesList from './components/ObjectivesList';
import {showTtsFor} from './showTts';
import {ObjectivesState} from './useObjectives';

import moduleStyles from './sprite-lab2-view.module.scss';

interface GenerateSpriteLabProps {
  levelMode?: LevelMode;
  /** Shown when the level declares no objectives. */
  instructions?: string;
  /** For the Continue button's progression handling. */
  levelProperties: SpriteLab2LevelProperties;
  /** The level's objectives: its text, its checklist, and the Continue
      gate. */
  objectives?: ObjectivesState;
  /** Rendered in place, as a panel its parent lays out, instead of
      floating over the lab; never collapsible. */
  docked?: boolean;
}

/**
 * The Lab2 Guide overlay, modeled on Music Lab's: the level's objectives,
 * and the Continue button once every one holds.
 */
const GenerateSpriteLab: React.FunctionComponent<GenerateSpriteLabProps> = ({
  levelMode,
  instructions,
  levelProperties,
  objectives,
  docked = false,
}) => {
  const checklist = objectives?.active ? objectives : undefined;
  const offerContinue = !!checklist?.allDone;
  const collapsedText = checklist?.collapsedText;
  // Collapsed hides the instructions but keeps Continue reachable.
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

  const showTts = showTtsFor(levelProperties);
  const instructionsBlock = checklist ? (
    <ObjectivesList
      title={checklist.title}
      items={checklist.items}
      showTts={showTts}
    />
  ) : (
    instructions && (
      <MainInstructionsContent
        instructionsText={instructions}
        markdownClassName={moduleStyles.guideInstructions}
        showTts={showTts}
      />
    )
  );

  // Freeplay's guide sits over a full lab; the guided levels need theirs open.
  const collapsible = isFreeplayMode(levelMode) && !docked;

  const body = (
    <div ref={bodyRef} className={moduleStyles.guideBody}>
      {collapsed
        ? collapsedText && (
            <p className={moduleStyles.guideCollapsedText}>{collapsedText}</p>
          )
        : instructionsBlock || 'Build a program, then press Run.'}
      {offerContinue && (
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
  );

  if (docked) {
    return <div className={moduleStyles.guideDocked}>{body}</div>;
  }

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
        {body}
      </div>
    </Guide>
  );
};

export default GenerateSpriteLab;
