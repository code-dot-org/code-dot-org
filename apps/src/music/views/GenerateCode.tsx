import {Button} from '@code-dot-org/component-library/button';
import {sample} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {useMultiProject} from '@cdo/apps/lab2/projects/MultiProjectContainer';
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

  const useCache = appConfig.getValue('ai-generate-cache') === 'true';
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

  useEffect(() => {
    // If we are clearing, make sure we are called with the new
    // block count before deciding what to do next.
    if (aiGenerateState === 'clearing' && blockCount <= 1) {
      dispatch(setAiGenerateState('none'));
    }
  }, [aiGenerateState, blockCount, dispatch]);

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

  const generateSong = useCallback(async () => {
    dispatch(setAiGenerateState('generating'));

    const pseudocode = await (useCache && useAdlib
      ? generateSongCache(adlibOption || '', useAdlib, packId, adlibChoices)
      : generateSongAi(
          contextText,
          packId,
          promptText || '',
          (levelProperties.levelData as MusicLevelData)
            .aiCodeGenerateExtraPrompt
        ));

    if (pseudocode) {
      const resultBlockly = generateBlocklyJson(pseudocode);
      dispatch(setCodeToLoad(resultBlockly));
    }

    setPlaying(true);
    dispatch(setAiGenerateState('generated'));
  }, [
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
  ]);

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
    'clearing',
  ].includes(aiGenerateState);

  const multiProject = useMultiProject();
  const showNavigation = !levelProperties.isProjectLevel && !multiProject;

  if (!packId) {
    return null;
  }

  return (
    <Guide id="generate-panel" modal={modal}>
      {['none', 'generating'].includes(aiGenerateState) &&
        useAdlib &&
        levelProperties.longInstructions && (
          <MainInstructionsContent
            instructionsText={levelProperties.longInstructions}
            markdownClassName={styles.markdown}
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

      {['none', 'generating'].includes(aiGenerateState) && useAdlib && (
        <Adlib
          adlib={useAdlib}
          adlibChoices={adlibChoices}
          readOnly={aiGenerateState !== 'none'}
          glowSpeed={glowSpeed}
          onChoicesChange={onAdlibChoicesChange}
          onTextChange={onAdlibTextChange}
        />
      )}

      {aiGenerateState === 'none' && (
        <>
          {!useAdlib && (
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

          <Button
            ariaLabel={'Generate code'}
            text={'Generate code'}
            type="primary"
            color="black"
            size="s"
            iconLeft={{iconName: 'sparkles'}}
            onClick={() => {
              generateSong();
              analyticsReporter.sendEvent('hoai2025-music-prompt', {
                promptText,
              });
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
              type="primary"
              color="black"
              size="s"
              onClick={() => {
                setPlaying(false);
                clearCode(true);
                dispatch(setAiGenerateState('clearing'));
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
                dispatch(setAiGenerateState('editing'));
                setPlaying(false);
              }}
              className={styles.buttonWide}
            />
          </div>
        </>
      )}

      {aiGenerateState === 'editing' && !isPlaying && (
        <div>
          AI helped you get started. Now, edit the code to make it your own.
        </div>
      )}

      {aiGenerateState === 'editing' && isPlaying && (
        <div>Try changing the code. </div>
      )}

      {aiGenerateState === 'edited' && (
        <>
          <div>That's a great mix!</div>
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
                dispatch(setAiGenerateState('clearing'));
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

export default GenerateCode;
