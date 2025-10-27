import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback, useEffect, useState} from 'react';

import {BlockDefinition, WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {DanceLevelProperties} from '@cdo/apps/dance/types';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {AdlibType} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import buildDanceBlockly from '../../blockly/buildDanceBlockly';

import styles from './generate-dance.module.scss';

// Create a dance with [a (chill|energetic) vibe] and [N backup dancers]. Sync [the (background|dance moves|foreground|everything)] with the music."

const adlib: AdlibType = {
  template:
    'Create a dance with {vibe} and {dancers}.  Synchronize {features} with the music.',
  options: {
    vibe: [
      {id: 'chill', text: 'a chill vibe'},
      {id: 'energic', text: 'an energetic vibe'},
    ],
    dancers: [
      {id: '1', text: 'one backup dancer'},
      {id: '2', text: 'two backup dancers'},
      {id: '3', text: 'three backup dancers'},
    ],
    features: [
      {id: 'background', text: 'the background'},
      {id: 'danceMoves', text: 'the dance moves'},
      {id: 'foreground', text: 'the foreground'},
      {id: 'everything', text: 'everything'},
    ],
  },
  variantCount: 5,
};

interface GenerateCodeProps {
  levelProperties: DanceLevelProperties;
  isRunning: boolean;
  hasEdited: boolean;
  hasPlayedFourMeasures: boolean;
  measures: number[];
  blockDefinitions: BlockDefinition[];
  blockCount: number;
  runProgram: () => void;
  resetProgram: () => void;
  updateSources: (newSources: WorkspaceSerialization) => void;
  startOver: () => void;
}

const GenerateDance: React.FunctionComponent<GenerateCodeProps> = ({
  levelProperties,
  isRunning,
  hasEdited,
  hasPlayedFourMeasures,
  measures,
  blockDefinitions,
  blockCount,
  runProgram,
  resetProgram,
  updateSources,
  startOver,
}) => {
  const dispatch = useAppDispatch();

  const [aiGenerateState, setAiGenerateState] = useState<
    | 'none'
    | 'generating'
    | 'generated'
    | 'listening'
    | 'listened'
    | 'editing'
    | 'edited'
  >('none');

  // The array of user choices in the adlib.
  const [, setChoices] = useState<string[] | undefined>(undefined);

  const [, setPromptText] = useState('');

  useEffect(() => {
    // If there is already a generated dance when we begin, presumably
    // because the user is returning to a level they've previously worked
    // on, then skip AI generation.
    // If there is only 1 block ("when run") then the user either chose to
    // Start Over or deleted everything, and either way, let's help them use
    // AI generation again.
    if (aiGenerateState === 'none' && blockCount > 1) {
      setAiGenerateState('edited');
    } else if (
      ['editing', 'edited'].includes(aiGenerateState) &&
      blockCount === 1
    ) {
      resetProgram();
      setAiGenerateState('none');
    }
  }, [aiGenerateState, blockCount, resetProgram]);

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setAiGenerateState('none');
    setPromptText('');
  });

  const generateDance = useCallback(async () => {
    setAiGenerateState('generating');

    const startTime = Date.now();
    const resultBlockly = buildDanceBlockly(measures, blockDefinitions);

    const elapsedTime = Date.now() - startTime;
    const delayDuration = 7000;
    const remainingDelayDuration = Math.max(delayDuration - elapsedTime, 0);
    await new Promise(res => setTimeout(res, remainingDelayDuration));

    updateSources(resultBlockly);
    runProgram();

    setAiGenerateState('generated');
  }, [blockDefinitions, measures, runProgram, updateSources]);

  useEffect(() => {
    // There can be a delay before we're playing, so wait for it explicitly.
    if (aiGenerateState === 'generated' && isRunning) {
      setAiGenerateState('listening');
    }
  }, [aiGenerateState, isRunning]);

  useEffect(() => {
    if (
      aiGenerateState === 'listening' &&
      (!isRunning || hasPlayedFourMeasures)
    ) {
      setAiGenerateState('listened');
    }
  }, [aiGenerateState, dispatch, hasPlayedFourMeasures, isRunning]);

  useEffect(() => {
    if (aiGenerateState === 'editing' && isRunning && hasEdited) {
      setAiGenerateState('edited');
    }
  }, [aiGenerateState, dispatch, hasEdited, isRunning]);

  const glowSpeed = aiGenerateState === 'generating' ? 'fast' : 'normal';

  const modal = [
    'none',
    'generating',
    'generated',
    'listening',
    'listened',
  ].includes(aiGenerateState);

  return (
    <Guide id="generate-panel" modal={modal} width="narrow">
      {['none', 'generating'].includes(aiGenerateState) &&
        levelProperties.longInstructions && (
          <MainInstructionsContent
            instructionsText={levelProperties.longInstructions}
            handleInstructionsTextClick={() => {}}
          />
        )}

      {['none', 'generating'].includes(aiGenerateState) && (
        <Adlib
          adlib={adlib}
          readOnly={aiGenerateState !== 'none'}
          glowSpeed={glowSpeed}
          onChange={(text, choices) => {
            setPromptText(text);
            setChoices(choices);
          }}
        />
      )}

      {aiGenerateState === 'none' && (
        <>
          <Button
            ariaLabel={'Generate code'}
            text={'Generate code'}
            type="primary"
            color="black"
            size="s"
            iconLeft={{iconName: 'sparkles'}}
            onClick={() => {
              generateDance();
            }}
          />
        </>
      )}

      {['generating', 'generated'].includes(aiGenerateState)
        ? 'Generating code.'
        : ''}

      {aiGenerateState === 'listening' && <div>Take a listen.</div>}

      {aiGenerateState === 'listened' && (
        <>
          <div>Do you want to keep what AI generated?</div>

          <div className={styles.buttonRows}>
            <Button
              ariaLabel={'Try prompting again'}
              text={'Try prompting again'}
              type="primary"
              color="black"
              size="s"
              onClick={() => {
                startOver();
                setAiGenerateState('none');
                resetProgram();
              }}
              className={styles.buttonWide}
            />

            <Button
              ariaLabel={'Keep this'}
              text={'Keep this'}
              type="primary"
              color="black"
              size="s"
              onClick={() => {
                setAiGenerateState('editing');
                resetProgram();
              }}
              className={styles.buttonWide}
            />
          </div>
        </>
      )}

      {aiGenerateState === 'editing' && !isRunning && (
        <div>
          AI helped you get started. Now, edit the code to make it your own.
        </div>
      )}

      {aiGenerateState === 'editing' && isRunning && (
        <div>Try changing the code. </div>
      )}

      {aiGenerateState === 'edited' && (
        <>
          <div>
            Amazing moves! Keep editing, or click Finish when you're done.
          </div>
          <div className={styles.buttonRow}>
            <Button
              ariaLabel={'Continue'}
              text={'Continue'}
              type="primary"
              color="black"
              size="s"
              iconRight={{iconName: 'arrow-right', iconStyle: 'solid'}}
              onClick={() => dispatch(continueOrFinishLesson())}
            />
          </div>
        </>
      )}
    </Guide>
  );
};

export default GenerateDance;
