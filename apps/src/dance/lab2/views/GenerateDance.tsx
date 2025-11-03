import {Button} from '@code-dot-org/component-library/button';
import {sample} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';

import {BlockDefinition, WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {DanceLevelProperties} from '@cdo/apps/dance/types';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {useMultiProject} from '@cdo/apps/lab2/projects/MultiProjectContainer';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {
  AdlibType,
  AdlibChoices,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';

import buildDanceBlockly from '../../blockly/buildDanceBlockly';

import styles from './generate-dance.module.scss';

const GENERATE_DELAY_DURATION = 7000;

const adlib: AdlibType = {
  template: `Generate {complexity} code for a {energy} dance, with {dancers} as backup dancers.`,
  options: {
    complexity: [
      {id: 'basic', text: 'basic'},
      {id: 'complex', text: 'complex'},
    ],
    energy: [
      {id: 'chill', text: 'chill'},
      {id: 'high', text: 'high energy'},
    ],
    dancers: [
      {id: 'nobody', text: 'nobody'},
      {id: 'alien', text: 'aliens'},
      {id: 'bear', text: 'bears'},
      {id: 'cat', text: 'cats'},
      {id: 'dog', text: 'dogs'},
      {id: 'duck', text: 'ducks'},
      {id: 'frog', text: 'frogs'},
      {id: 'moose', text: 'moose'},
      {id: 'pineapple', text: 'pineapples'},
      {id: 'robot', text: 'robots'},
      {id: 'shark', text: 'sharks'},
      {id: 'sloth', text: 'sloths'},
      {id: 'unicorn', text: 'unicorns'},
    ],
  },
  variantCount: 5,
};

interface GenerateCodeProps {
  levelProperties: DanceLevelProperties;
  isRunning: boolean;
  hasEdited: boolean;
  hasPlayedGeneratedDance: boolean;
  measures: number[];
  blockDefinitions: BlockDefinition[];
  blockCount: number;
  runProgram: () => void;
  resetProgram: () => void;
  updateSources: (newSources: WorkspaceSerialization) => void;
  startOver: () => void;
}

// Generate dance code.
const GenerateDance: React.FunctionComponent<GenerateCodeProps> = ({
  levelProperties,
  isRunning,
  hasEdited,
  hasPlayedGeneratedDance,
  measures,
  blockDefinitions,
  blockCount,
  runProgram,
  resetProgram,
  updateSources,
  startOver,
}) => {
  const [aiGenerateState, setAiGenerateState] = useState<
    | 'none'
    | 'generating'
    | 'generated'
    | 'listening'
    | 'listened'
    | 'editing'
    | 'edited'
  >('none');

  const getInitialChoices = () => {
    return {
      complexity: 'basic',
      energy: 'chill',
      dancers: sample(adlib.options.dancers)?.id || 'nobody',
    };
  };

  // The array of user choices in the adlib.
  const [adlibChoices, setAdlibChoices] = useState<AdlibChoices>(
    getInitialChoices()
  );

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
      blockCount <= 1
    ) {
      resetProgram();
      setAiGenerateState('none');
    }
  }, [aiGenerateState, blockCount, resetProgram]);

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setAiGenerateState('none');
    setAdlibChoices(getInitialChoices());
    setPromptText('');
  });

  const generateDance = useCallback(async () => {
    setAiGenerateState('generating');

    const startTime = Date.now();
    const resultBlockly = buildDanceBlockly(
      measures,
      blockDefinitions,
      adlibChoices && adlibChoices['complexity'] === 'complex'
        ? 'complex'
        : 'simple',
      adlibChoices && adlibChoices['energy'] === 'high' ? 'high' : 'chill',
      (adlibChoices && adlibChoices['dancers']) || 'nobody'
    );

    const elapsedTime = Date.now() - startTime;
    const remainingDelayDuration = Math.max(
      GENERATE_DELAY_DURATION - elapsedTime,
      0
    );
    await new Promise(res => setTimeout(res, remainingDelayDuration));

    updateSources(resultBlockly);
    runProgram();

    setAiGenerateState('generated');
  }, [adlibChoices, blockDefinitions, measures, runProgram, updateSources]);

  useEffect(() => {
    // There can be a delay before we're playing, so wait for it explicitly.
    if (aiGenerateState === 'generated' && isRunning) {
      setAiGenerateState('listening');
    }
  }, [aiGenerateState, isRunning]);

  useEffect(() => {
    if (
      aiGenerateState === 'listening' &&
      (!isRunning || hasPlayedGeneratedDance)
    ) {
      setAiGenerateState('listened');
    }
  }, [aiGenerateState, hasPlayedGeneratedDance, isRunning]);

  useEffect(() => {
    if (aiGenerateState === 'editing' && isRunning && hasEdited) {
      setAiGenerateState('edited');
    }
  }, [aiGenerateState, hasEdited, isRunning]);

  const onAdlibChange = useCallback((choices: AdlibChoices) => {
    setAdlibChoices({...choices});
  }, []);

  const onAdlibTextChange = useCallback((text: string) => {
    setPromptText(text);
  }, []);

  const glowSpeed = aiGenerateState === 'generating' ? 'fast' : 'normal';

  const modal = [
    'none',
    'generating',
    'generated',
    'listening',
    'listened',
  ].includes(aiGenerateState);

  const multiProject = useMultiProject();
  const showNavigation = !levelProperties.isProjectLevel && !multiProject;

  return (
    <Guide id="generate-panel" modal={modal} position="bottom">
      {['none', 'generating'].includes(aiGenerateState) &&
        levelProperties.longInstructions && (
          <MainInstructionsContent
            instructionsText={levelProperties.longInstructions}
            markdownClassName={styles.markdown}
          />
        )}

      {['none', 'generating'].includes(aiGenerateState) && (
        <Adlib
          adlib={adlib}
          adlibChoices={adlibChoices}
          readOnly={aiGenerateState !== 'none'}
          glowSpeed={glowSpeed}
          onChoicesChange={onAdlibChange}
          onTextChange={onAdlibTextChange}
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

          <div className={styles.buttonRow}>
            <Button
              ariaLabel={'Back to prompt'}
              text={'Back to prompt'}
              type="secondary"
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
        <div>Try changing the code.</div>
      )}

      {aiGenerateState === 'edited' && (
        <>
          <div>
            Amazing moves! Keep editing, or click Finish when you're done.
          </div>
          <div className={styles.buttonRow}>
            <Button
              ariaLabel={'Back to prompt'}
              text={'Back to prompt'}
              type="secondary"
              color="black"
              size="s"
              onClick={() => {
                startOver();
                setAiGenerateState('none');
                resetProgram();
              }}
              className={styles.buttonWide}
            />
            {showNavigation && (
              <NavigationArea
                levelProperties={levelProperties}
                // The following props don't really matter as we don't have a Submit button or validation here.
                hasRun={true}
                hasEdited={true}
                isRunning={false}
                className={styles.buttonWide}
              />
            )}
          </div>
        </>
      )}
    </Guide>
  );
};

export default GenerateDance;
