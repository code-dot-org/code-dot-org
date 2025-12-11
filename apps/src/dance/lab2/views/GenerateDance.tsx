import {Button} from '@code-dot-org/component-library/button';
import * as GoogleBlockly from 'blockly/core';
import {sample} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';

import {BlockDefinition, WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {useParentLevelProperties} from '@cdo/apps/bubbleChoice/customModes/MusicDanceAi/ParentLevelPropertiesContext';
import {sendSuccessReportForLevel} from '@cdo/apps/code-studio/progressRedux';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {DanceLevelProperties} from '@cdo/apps/dance/types';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {
  AdlibChoices,
  AdlibType,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import buildDanceBlockly from '../../blockly/buildDanceBlockly';

import styles from './generate-dance.module.scss';

const GENERATE_DELAY_DURATION = 5000;

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
  updateSources: (newSources: {
    workspaceSerialization: WorkspaceSerialization;
    flyoutDefinition: GoogleBlockly.utils.toolbox.ToolboxInfo;
  }) => void;
  startOver: () => void;
  onFlyoutGenerated: (
    toolboxDefinition: GoogleBlockly.utils.toolbox.ToolboxInfo
  ) => void;
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
  onFlyoutGenerated,
}) => {
  const [aiGenerateState, setAiGenerateState] = useState<
    | 'none'
    | 'generating'
    | 'generated'
    | 'listening'
    | 'listened'
    | 'editing'
    | 'edited'
    | 'playing'
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

  const [localizedPromptText, setLocalizedPromptText] = useState('');

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
      ['listened', 'editing', 'edited'].includes(aiGenerateState) &&
      blockCount <= 1
    ) {
      resetProgram();
      setAiGenerateState('none');
    }
  }, [aiGenerateState, blockCount, resetProgram]);

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setAiGenerateState('none');
    setAdlibChoices(getInitialChoices());
    setLocalizedPromptText('');
  });

  const generateDance = useCallback(
    async (regenerate = false) => {
      setAiGenerateState('generating');

      analyticsReporter.sendEvent(
        EVENTS[
          `DANCE_PARTY_${regenerate ? 'REGENERATE' : 'GENERATE'}_CODE_CLICKED`
        ],
        {
          adlibChoices,
          levelPath: window.location.pathname,
        }
      );
      const startTime = Date.now();
      const {workspaceSerialization, flyoutDefinition} = buildDanceBlockly(
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

      updateSources({workspaceSerialization, flyoutDefinition});
      onFlyoutGenerated(flyoutDefinition);
      runProgram();

      setAiGenerateState('generated');
    },
    [
      adlibChoices,
      blockDefinitions,
      measures,
      runProgram,
      onFlyoutGenerated,
      updateSources,
    ]
  );

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

  const onAdlibTextChange = useCallback((_text: string, localized: string) => {
    setLocalizedPromptText(localized);
  }, []);

  const glowSpeed = aiGenerateState === 'generating' ? 'fast' : 'normal';

  const modal = [
    'none',
    'generating',
    'generated',
    'listening',
    'listened',
  ].includes(aiGenerateState)
    ? 'full'
    : undefined;

  const guideWidth = aiGenerateState === 'playing' ? 'very-narrow' : 'normal';

  const cornerIcon =
    aiGenerateState === 'edited'
      ? 'minimize'
      : aiGenerateState === 'playing'
      ? 'maximize'
      : undefined;

  const onCornerIconClick = useCallback(() => {
    if (aiGenerateState === 'edited') {
      setAiGenerateState('playing');
    } else if (aiGenerateState === 'playing') {
      setAiGenerateState('edited');
    }
  }, [aiGenerateState]);

  const hasParent = !!useParentLevelProperties();
  const dispatch = useAppDispatch();
  const sublevelOnContinue = useCallback(() => {
    dispatch(
      sendSuccessReportForLevel(
        levelProperties.id.toString(),
        levelProperties.appName
      )
    );
  }, [dispatch, levelProperties.appName, levelProperties.id]);

  const showTts =
    levelProperties.offerBrowserTts || queryParams('show-tts') === 'true';

  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  if (isReadOnly) {
    return null;
  }

  return (
    <Guide
      id="generate-panel"
      modal={modal}
      width={guideWidth}
      position="bottom"
      cornerIcon={cornerIcon}
      onCornerIconClick={onCornerIconClick}
    >
      {aiGenerateState === 'none' && levelProperties.longInstructions && (
        <MainInstructionsContent
          instructionsText={levelProperties.longInstructions}
          markdownClassName={styles.markdown}
          showTts={showTts}
        />
      )}

      {['generating', 'generated'].includes(aiGenerateState) && (
        <MainInstructionsContent
          heading="Generating..."
          content="AI is generating code based on your prompt."
          markdownClassName={styles.markdown}
          showTts={showTts}
        />
      )}

      {['none', 'generating', 'generated'].includes(aiGenerateState) && (
        <>
          <Adlib
            adlib={adlib}
            adlibChoices={adlibChoices}
            readOnly={aiGenerateState !== 'none'}
            glowSpeed={glowSpeed}
            onChoicesChange={onAdlibChange}
            onTextChange={onAdlibTextChange}
          />

          <Button
            ariaLabel={
              aiGenerateState === 'none' ? 'Generate code' : 'Generating code'
            }
            text={
              aiGenerateState === 'none' ? 'Generate code' : 'Generating code'
            }
            type="primary"
            color="black"
            size="s"
            iconLeft={{iconName: 'sparkles'}}
            isPending={aiGenerateState !== 'none'}
            disabled={aiGenerateState !== 'none'}
            onClick={() => {
              generateDance();
            }}
          />
        </>
      )}

      {['listening', 'listened'].includes(aiGenerateState) && (
        <MainInstructionsContent
          heading={
            aiGenerateState === 'listening'
              ? 'Take a look...'
              : aiGenerateState === 'listened'
              ? 'Decide what to do next'
              : ''
          }
          content={`AI generated code based on your prompt, "${localizedPromptText}"`}
          markdownClassName={styles.markdown}
          showTts={showTts}
        />
      )}

      {aiGenerateState === 'listened' && (
        <div className={styles.buttonRow}>
          <Button
            ariaLabel={'Back to prompt'}
            text={'Back to prompt'}
            type="secondary"
            color="black"
            size="s"
            onClick={() => {
              startOver();
              analyticsReporter.sendEvent(
                EVENTS.DANCE_PARTY_GENERATE_CODE_BACK_TO_PROMPT_CLICKED,
                {levelPath: window.location.pathname}
              );
            }}
            className={styles.buttonWide}
          />

          <Button
            ariaLabel={'Regenerate'}
            text={'Regenerate'}
            type="secondary"
            color="black"
            size="s"
            iconLeft={{iconName: 'sparkles'}}
            onClick={() => {
              startOver();
              resetProgram();
              generateDance(true);
            }}
            className={styles.buttonWide}
          />

          <Button
            ariaLabel={'Use code'}
            text={'Use code'}
            type="primary"
            color="black"
            size="s"
            onClick={() => {
              // Skip the 'editing' state when showing the three tabs.
              setAiGenerateState(hasParent ? 'edited' : 'editing');
              analyticsReporter.sendEvent(
                EVENTS.DANCE_PARTY_GENERATE_CODE_USE_CODE_CLICKED,
                {
                  adlibChoices,
                  levelPath: window.location.pathname,
                }
              );
            }}
            className={styles.buttonWide}
          />
        </div>
      )}

      {aiGenerateState === 'editing' && !isRunning && (
        <MainInstructionsContent
          heading="Modify the code"
          content="AI helped you get started. Now, edit the code to make it your own."
          markdownClassName={styles.markdown}
          showTts={showTts}
        />
      )}

      {aiGenerateState === 'editing' && isRunning && (
        <MainInstructionsContent
          heading="Modify the code"
          content="Try changing the code."
          markdownClassName={styles.markdown}
          showTts={showTts}
        />
      )}

      {aiGenerateState === 'edited' && (
        <>
          <MainInstructionsContent
            heading="Modify the code"
            content={
              hasParent
                ? 'Amazing moves! Keep editing, or use the tabs at the top to update your dancer design or music mix.'
                : "Amazing moves! Keep editing, or use the tabs at the top to update your dancer design or music mix. Click Finish when you're done."
            }
            markdownClassName={styles.markdown}
            showTts={showTts}
          />
          <div className={styles.buttonRow}>
            <Button
              ariaLabel={'Back to prompt'}
              text={'Back to prompt'}
              type="secondary"
              color="black"
              size="s"
              onClick={() => {
                startOver();
                analyticsReporter.sendEvent(
                  EVENTS.DANCE_PARTY_GENERATE_CODE_BACK_TO_PROMPT_CLICKED,
                  {levelPath: window.location.pathname}
                );
              }}
              className={styles.buttonWide}
            />
            {hasParent && (
              <NavigationArea
                levelProperties={levelProperties}
                // The following props don't really matter as we don't have a Submit button or validation here.
                hasRun={true}
                hasEdited={true}
                isRunning={false}
                className={styles.buttonWide}
                // If on a Music Dance AI sublevel, make sure we report success for this specific sublevel so that progress is correctly updated.
                onContinue={sublevelOnContinue}
                variant={'small'}
              />
            )}
          </div>
        </>
      )}

      {aiGenerateState === 'playing' && <div>Keep playing!</div>}

      {/* Retain focus with a hidden button. */}
      {['generating', 'generated', 'listening', 'editing'].includes(
        aiGenerateState
      ) && <div tabIndex={0} role="button" className={styles.hiddenButton} />}
    </Guide>
  );
};

export default GenerateDance;
