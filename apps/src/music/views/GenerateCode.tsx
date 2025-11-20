import {Button} from '@code-dot-org/component-library/button';
import {sample} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';

import {useParentLevelProperties} from '@cdo/apps/bubbleChoice/customModes/MusicDanceAi/ParentLevelPropertiesContext';
import {sendSuccessReportForLevel} from '@cdo/apps/code-studio/progressRedux';
import {queryParams} from '@cdo/apps/code-studio/utils';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {
  AdlibsType,
  AdlibType,
  AdlibChoices,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {generateBlocklyJson} from '../ai/generate/generateBlocklyJson';
import {generateSongAi, generateSongCache} from '../ai/generate/GenerateCode';
import adlibsUntyped from '../ai/generate/GenerateCodeAdlibs.json';
import {
  DefaultContext,
  DefaultPrompt,
} from '../ai/generate/GenerateCodeContent';
import appConfig from '../appConfig';
import {setCodeToLoad, setAiGenerateState} from '../redux/musicRedux';
import {MusicLevelData} from '../types';

import styles from './GenerateCode.module.scss';

const adlibs = adlibsUntyped as AdlibsType;

const GENERATE_DELAY_DURATION = 5000;

interface GenerateCodeProps {
  adlibOption?: string;
  adlib?: AdlibType;
  levelProperties: LevelProperties;
  setPlaying: (play: boolean) => void;
  hasEdited: boolean;
  blockCount: number;
  clearCode: (maintainPackId?: boolean) => void;
}

const GenerateCode: React.FunctionComponent<GenerateCodeProps> = ({
  adlibOption,
  adlib,
  levelProperties,
  setPlaying,
  hasEdited,
  blockCount,
  clearCode,
}) => {
  const dispatch = useAppDispatch();

  const packId = useAppSelector(state => state.music.packId) || '';
  const aiGenerateState = useAppSelector(state => state.music.aiGenerateState);
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const currentPlayheadPosition = useAppSelector(
    state => state.music.currentPlayheadPosition
  );

  const useCache = true;
  const showFullContext =
    appConfig.getValue('ai-generate-full-context') === 'true';

  const useText = !!(levelProperties.levelData as MusicLevelData)
    .aiCodeGenerateText;

  // Use legacy adlib ID, adlib object, or new adlib ID.
  const useAdlib =
    !useText &&
    (adlib && typeof adlib === 'string'
      ? adlibs[adlib]
      : adlib
      ? adlib
      : adlibOption
      ? adlibs[adlibOption]
      : undefined);

  const getInitialChoices = () => {
    if (!useAdlib) return {};
    const initial: AdlibChoices = {};
    Object.keys(useAdlib.options).forEach(key => {
      const opts = useAdlib.options[key];
      initial[key] = sample(opts)?.id || '';
    });
    return initial;
  };

  const [adlibChoices, setAdlibChoices] = useState<AdlibChoices>(
    getInitialChoices()
  );

  const [contextText, setContextText] = useState(DefaultContext);

  const [promptText, setPromptText] = useState(
    adlibOption ? '' : DefaultPrompt
  );

  const [localizedPromptText, setLocalizedPromptText] = useState(
    adlibOption ? '' : DefaultPrompt
  );

  const generateSong = useCallback(
    async (regenerate = false) => {
      const startTime = Date.now();

      dispatch(setAiGenerateState('generating'));

      analyticsReporter.sendEvent(
        EVENTS[
          `MUSIC_LAB_${regenerate ? 'REGENERATE' : 'GENERATE'}_CODE_CLICKED`
        ],
        {
          adlibChoices,
          packId,
          levelPath: window.location.pathname,
        }
      );
      const pseudocode = await (useCache && useAdlib
        ? generateSongCache(adlibOption || '', useAdlib, packId, adlibChoices)
        : generateSongAi(
            contextText,
            packId,
            promptText || '',
            (levelProperties.levelData as MusicLevelData)
              .aiCodeGenerateExtraPrompt
          ));

      const elapsedTime = Date.now() - startTime;
      const remainingDelayDuration = Math.max(
        GENERATE_DELAY_DURATION - elapsedTime,
        0
      );
      await new Promise(res => setTimeout(res, remainingDelayDuration));

      if (pseudocode) {
        const resultBlockly = generateBlocklyJson(pseudocode);
        dispatch(setCodeToLoad(resultBlockly));
      }

      setPlaying(true);
      dispatch(setAiGenerateState('generated'));
    },
    [
      adlibChoices,
      adlibOption,
      contextText,
      dispatch,
      levelProperties.levelData,
      packId,
      promptText,
      setPlaying,
      useAdlib,
      useCache,
    ]
  );

  useEffect(() => {
    // If we are clearing, make sure we are called with the new
    // block count before deciding what to do next.
    if (aiGenerateState === 'clearing-before-none' && blockCount <= 1) {
      dispatch(setAiGenerateState('none'));
    } else if (
      aiGenerateState === 'clearing-before-generating' &&
      blockCount <= 1
    ) {
      generateSong(true);
    }
  }, [aiGenerateState, blockCount, dispatch, generateSong]);

  useEffect(() => {
    // If there is already generated music when we begin, presumably
    // because the user is returning to a level they've previously worked
    // on, then skip AI generation.
    if (aiGenerateState === 'none' && blockCount > 1) {
      dispatch(setAiGenerateState('edited'));
    }
  }, [aiGenerateState, blockCount, dispatch]);

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    dispatch(setAiGenerateState('none'));
    setAdlibChoices(getInitialChoices());
    setPromptText(adlibOption ? '' : useText ? '' : DefaultPrompt);
  });

  useEffect(() => {
    // There can be a delay before we're playing (often due to sample loading),
    // so wait for it explicitly.
    if (aiGenerateState === 'generated' && isPlaying) {
      dispatch(setAiGenerateState('listening'));
    }
  }, [aiGenerateState, dispatch, isPlaying]);

  useEffect(() => {
    if (
      aiGenerateState === 'listening' &&
      (!isPlaying || currentPlayheadPosition >= 5)
    ) {
      dispatch(setAiGenerateState('listened'));
    }
  }, [aiGenerateState, currentPlayheadPosition, dispatch, isPlaying]);

  useEffect(() => {
    if (aiGenerateState === 'editing' && isPlaying && hasEdited) {
      dispatch(setAiGenerateState('edited'));
    }
  }, [aiGenerateState, dispatch, hasEdited, isPlaying]);

  const onAdlibChoicesChange = useCallback((adlibChoices: AdlibChoices) => {
    setAdlibChoices({...adlibChoices});
  }, []);

  const onAdlibTextChange = useCallback((text: string, localized: string) => {
    setPromptText(text);
    setLocalizedPromptText(localized);
  }, []);

  const glowSpeed = aiGenerateState === 'generating' ? 'fast' : 'normal';

  const modal = ['none', 'listened'].includes(aiGenerateState)
    ? 'gap'
    : [
        'generating',
        'generated',
        'listening',
        'clearing-before-none',
        'clearing-before-generating',
      ].includes(aiGenerateState)
    ? 'full'
    : undefined;

  const parentProperties = useParentLevelProperties();
  const isStandalone =
    levelProperties.isProjectLevel || parentProperties?.isProjectLevel;
  const sublevelOnContinue = useCallback(() => {
    dispatch(
      sendSuccessReportForLevel(
        levelProperties.id.toString(),
        levelProperties.appName
      )
    );
  }, [dispatch, levelProperties.appName, levelProperties.id]);

  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  if (isReadOnly) {
    return null;
  }

  const levelSpecificId = `generate-panel-${levelProperties.id}`;
  if (!packId) {
    return null;
  }

  const showTts =
    levelProperties.offerBrowserTts || queryParams('show-tts') === 'true';

  return (
    <Guide key={levelSpecificId} id={levelSpecificId} modal={modal}>
      {aiGenerateState === 'none' &&
        useAdlib &&
        levelProperties.longInstructions && (
          <MainInstructionsContent
            instructionsText={levelProperties.longInstructions}
            markdownClassName={styles.markdown}
            showTts={showTts}
          />
        )}

      {showFullContext && aiGenerateState === 'none' && (
        <textarea
          id="generate-context"
          onChange={evt => setContextText(evt.target.value)}
          value={contextText}
          rows={6}
          className={styles.textArea}
        />
      )}

      {aiGenerateState === 'generating' && (
        <MainInstructionsContent
          instructionsText={
            '### Generating...\n\nAI is generating code based on your prompt.'
          }
          markdownClassName={styles.markdown}
          showTts={showTts}
        />
      )}

      {['none', 'generating', 'generated'].includes(aiGenerateState) &&
        useAdlib && (
          <Adlib
            adlib={useAdlib}
            adlibChoices={adlibChoices}
            readOnly={aiGenerateState !== 'none'}
            glowSpeed={glowSpeed}
            onChoicesChange={onAdlibChoicesChange}
            onTextChange={onAdlibTextChange}
          />
        )}

      {aiGenerateState === 'none' && !useAdlib && (
        <>
          <div>Describe the song you'd like AI to make.</div>
          <textarea
            id="generate-description"
            onChange={evt => {
              setPromptText(evt.target.value);
            }}
            value={promptText}
            rows={4}
            className={styles.textArea}
          />
        </>
      )}

      {['none', 'generating', 'generated'].includes(aiGenerateState) && (
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
            generateSong();
            analyticsReporter.sendEvent('hoai2025-music-prompt', {
              promptText,
            });
          }}
        />
      )}

      {['listening', 'listened'].includes(aiGenerateState) && (
        <MainInstructionsContent
          instructionsText={`### ${
            aiGenerateState === 'listening'
              ? 'Take a listen...'
              : aiGenerateState === 'listened'
              ? 'Decide what to do next'
              : ''
          }\n\nAI generated code based on your prompt, "${localizedPromptText}"`}
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
              setPlaying(false);
              clearCode(true);
              dispatch(setAiGenerateState('clearing-before-none'));
              analyticsReporter.sendEvent(
                EVENTS.MUSIC_LAB_GENERATE_CODE_BACK_TO_PROMPT_CLICKED,
                {levelPath: window.location.pathname, packId}
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
              setPlaying(false);
              clearCode(true);
              dispatch(setAiGenerateState('clearing-before-generating'));
              analyticsReporter.sendEvent('hoai2025-music-prompt', {
                promptText,
              });
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
              // Skip the 'editing' validation state for standalone projects.
              dispatch(setAiGenerateState(isStandalone ? 'edited' : 'editing'));
              analyticsReporter.sendEvent(
                EVENTS.MUSIC_LAB_GENERATE_CODE_USE_CODE_CLICKED,
                {levelPath: window.location.pathname, packId, adlibChoices}
              );
            }}
            className={styles.buttonWide}
          />
        </div>
      )}

      {aiGenerateState === 'editing' && !isPlaying && (
        <MainInstructionsContent
          instructionsText={
            '### Modify the code\n\nAI helped you get started. Make your own changes, then press Run.'
          }
          markdownClassName={styles.markdown}
          showTts={showTts}
        />
      )}

      {aiGenerateState === 'editing' && isPlaying && (
        <MainInstructionsContent
          instructionsText={'### Modify the code\n\nTry changing the code.'}
          markdownClassName={styles.markdown}
          showTts={showTts}
        />
      )}

      {aiGenerateState === 'edited' && (
        <>
          <MainInstructionsContent
            instructionsText={"### Modify the code\n\nThat's a great mix!"}
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
                setPlaying(false);
                clearCode(true);
                dispatch(setAiGenerateState('clearing-before-none'));
                analyticsReporter.sendEvent(
                  EVENTS.MUSIC_LAB_GENERATE_CODE_BACK_TO_PROMPT_CLICKED,
                  {levelPath: window.location.pathname, packId}
                );
              }}
              className={styles.buttonWide}
            />
            {!isStandalone && (
              <NavigationArea
                levelProperties={levelProperties}
                // The following props don't really matter as we don't have a Submit button or validation here.
                hasRun={true}
                hasEdited={true}
                isRunning={false}
                className={styles.buttonWide}
                // If on a Music Dance AI sublevel, make sure we report success for this specific sublevel so that progress is correctly updated.
                onContinue={parentProperties ? sublevelOnContinue : undefined}
              />
            )}
          </div>
        </>
      )}
      {/* Retain focus with a hidden button. */}
      {['generating', 'generated', 'listening', 'editing'].includes(
        aiGenerateState
      ) && <div tabIndex={0} role="button" className={styles.hiddenButton} />}
    </Guide>
  );
};

export default GenerateCode;
