import {Button} from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {
  AdlibsType,
  AdlibType,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
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
  setToolboxVisibility: (visible: boolean) => void;
}

const GenerateCode: React.FunctionComponent<GenerateCodeProps> = ({
  adlibOption,
  adlib,
  levelProperties,
  setPlaying,
  hasEdited,
  setToolboxVisibility,
}) => {
  const dispatch = useAppDispatch();

  const packId = useAppSelector(state => state.music.packId) || '';
  const aiGenerateState = useAppSelector(state => state.music.aiGenerateState);
  const isPlaying = useAppSelector(state => state.music.isPlaying);

  const useCache = appConfig.getValue('ai-generate-cache') === 'true';
  const showFullContext =
    appConfig.getValue('ai-generate-full-context') === 'true';

  // The array of user choices in the adlib.
  const [choices, setChoices] = useState<string[] | undefined>(undefined);

  const [contextText, setContextText] = useState(DefaultContext);

  const [promptText, setPromptText] = useState(
    adlibOption ? '' : DefaultPrompt
  );

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

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    dispatch(setAiGenerateState('none'));
    setPromptText(adlibOption ? '' : useText ? '' : DefaultPrompt);
  });

  const generateSong = useCallback(async () => {
    dispatch(setAiGenerateState('generating'));

    const pseudocode = await (useCache
      ? generateSongCache(adlibs, adlibOption || 'complex', packId, choices)
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
    adlibOption,
    choices,
    contextText,
    dispatch,
    levelProperties.levelData,
    packId,
    promptText,
    setPlaying,
    useCache,
  ]);

  useEffect(() => {
    // There can be a delay before we're playing, so wait for it explicitly.
    if (aiGenerateState === 'generated' && isPlaying) {
      dispatch(setAiGenerateState('listening'));
    }
  }, [aiGenerateState, dispatch, isPlaying]);

  useEffect(() => {
    if (aiGenerateState === 'listening' && !isPlaying) {
      dispatch(setAiGenerateState('listened'));
    }
  }, [aiGenerateState, dispatch, isPlaying]);

  useEffect(() => {
    if (aiGenerateState === 'editing' && hasEdited) {
      dispatch(setAiGenerateState('edited'));
    }
  }, [aiGenerateState, dispatch, hasEdited]);

  useEffect(() => {
    if (aiGenerateState === 'edited' && isPlaying) {
      dispatch(setAiGenerateState('listeningAfterEdit'));
    }
  }, [aiGenerateState, dispatch, isPlaying]);

  const glowSpeed = aiGenerateState === 'generating' ? 'fast' : 'normal';

  if (!packId) {
    return null;
  }

  return (
    <Guide id="generate-panel" glowSpeed={glowSpeed}>
      {aiGenerateState === 'none' && levelProperties.longInstructions && (
        <MainInstructionsContent
          instructionsText={levelProperties.longInstructions}
          handleInstructionsTextClick={() => {}}
        />
      )}

      {showFullContext && aiGenerateState === 'none' && (
        <textarea
          id="generate-context"
          onChange={evt => setContextText(evt.target.value)}
          value={contextText}
          rows={6}
          className={classNames(styles.textArea, styles.textAreaSmall)}
        />
      )}

      {aiGenerateState === 'generating' && (
        <div className={styles.textArea}>{promptText}</div>
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
          {useAdlib && (
            <Adlib
              adlib={useAdlib}
              onChange={(text, choices) => {
                setPromptText(text);
                setChoices(choices);
              }}
              className={styles.textArea}
            />
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

      {aiGenerateState === 'generating' ? 'Generating code...' : ''}

      {aiGenerateState === 'listening' && <div>Let's have a listen...</div>}

      {aiGenerateState === 'listened' && (
        <>
          <div>Did you like what you heard?</div>

          <div className={styles.buttonRow}>
            <Button
              ariaLabel={"No. Let's try again."}
              text={"No. Let's try again."}
              type="primary"
              color="black"
              size="s"
              onClick={() => dispatch(setAiGenerateState('none'))}
            />

            <Button
              ariaLabel={"Yes. Let's continue."}
              text={"Yes. Let's continue."}
              type="primary"
              color="black"
              size="s"
              onClick={() => dispatch(setAiGenerateState('editing'))}
            />
          </div>
        </>
      )}

      {aiGenerateState === 'editing' && (
        <div>Now it's your turn. Try editing the code.</div>
      )}

      {aiGenerateState === 'edited' && (
        <div>Nice. Now have another listen.</div>
      )}

      {aiGenerateState === 'listeningAfterEdit' && (
        <>
          <div>Keep editing, or continue when you're done.</div>
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

export default GenerateCode;
