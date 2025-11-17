import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {Heading3} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import {sample} from 'lodash';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useParentLevelProperties} from '@cdo/apps/bubbleChoice/customModes/MusicDanceAi/ParentLevelPropertiesContext';
import {sendSuccessReportForLevel} from '@cdo/apps/code-studio/progressRedux';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  DanceLevelProperties,
  DanceProjectSources,
  GeneratedDancerMetadata,
} from '@cdo/apps/dance/types';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {
  AdlibsType,
  AdlibChoices,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import DancerCanvas from '@cdo/apps/lab2/views/DancerCanvas';
import {useSources} from '@cdo/apps/lab2/views/SourcesContainer';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import getRandomInt from '@cdo/apps/util/getRandomInt';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {trySetSessionStorage} from '@cdo/apps/utils';
import backgroundImage from '@cdo/static/dance/generateDancer/generate-dancer-background.png';
import dancerSilhouetteBrightImage from '@cdo/static/dance/generateDancer/generate-dancer-silhouette-bright.svg';

import {GENERATED_DANCER_STORAGE_KEY} from '../../ai/constants';
import {getConfigValue} from '../../lottie/LottieDancerUtils';

import adlibsDefault from './dancerAdlibsDefault';

import moduleStyles from './generate-dancer.module.scss';

const BODY_VARIANT_COUNT = 5;

// A little time for the previous dancer to fade out.
const GENERATE_INITIAL_DELAY_DURATION = 250;

// The total time we spend on the generation process.
const GENERATE_TOTAL_DELAY_DURATION = 5000;

type AdlibsBlockList = {[key: string]: string[]};

interface AdlibsManifest {
  adlibs: AdlibsType;
  blockList: AdlibsBlockList;
}

interface DancerGenerateProps {
  adlibOption: string;
  levelProperties: DanceLevelProperties;
}

// This UI takes over the entire lab area and allows the user to generate a dancer using
// a Guide UI component containing an Adlib UI component.  Pre-generated dancer assets are
// retrieved from an online cache.  Information about the generated dancer is written to local
// storage.
const GenerateDancer: React.FunctionComponent<DancerGenerateProps> = ({
  adlibOption,
  levelProperties,
}) => {
  const dispatch = useAppDispatch();

  const {setTheme} = useTheme();

  useEffect(() => {
    setTheme('Dark');
  }, [setTheme]);

  const [aiGenerateState, setAiGenerateState] = useState<
    'loading' | 'none' | 'generating' | 'reviewing'
  >('loading');

  const [adlibs, setAdlibs] = useState<AdlibsType | undefined>(undefined);

  const [adlibChoices, setAdlibChoices] = useState<AdlibChoices | undefined>(
    undefined
  );

  const [promptText, setPromptText] = useState<string>('');

  const variantHistory = useRef<number[]>([]);

  const {currentSources, updateSources} = useSources<DanceProjectSources>();

  const blockList = useRef<AdlibsBlockList | undefined>(undefined);

  const getInitialChoices = useCallback(
    (adlibsValue: AdlibsType) => {
      const initial: AdlibChoices = {};
      if (adlibsValue) {
        const lastChoices = [
          ...(currentSources.generatedDancer?.choices || []),
          ...(currentSources.generatedDancer?.choicesExtra || []),
        ];

        Object.keys(adlibsValue[adlibOption]?.options || []).forEach(
          (key, index) => {
            const options = adlibsValue[adlibOption].options[key];

            if (
              options
                .map(option => option.id)
                .includes(lastChoices?.[index] || '')
            ) {
              // Use a value from the last saved dancer.
              initial[key] = lastChoices?.[index] || '';
            } else {
              // Select a random value.
              initial[key] = sample(options)?.id || '';
            }
          }
        );
      }
      return initial;
    },
    [adlibOption, currentSources.generatedDancer]
  );

  useEffect(() => {
    const fetchAdlib = async () => {
      if (aiGenerateState !== 'loading') {
        return;
      }

      let adlibsValue = adlibsDefault;

      const manifestFilename =
        ((queryParams('dancer-adlib-manifest') as string) || 'adlib-manifest') +
        '.json';
      const adlibsFilePath =
        'https://curriculum.code.org/media/musiclab/generate/dancer/manifest/' +
        manifestFilename;

      try {
        const {value} = await HttpClient.fetchJson<AdlibsManifest>(
          adlibsFilePath
        );
        adlibsValue = value.adlibs;
        blockList.current = value.blockList;
      } catch (error) {
        console.log("Couldn't retrieve adlib manifest.", error);
        Lab2Registry.getInstance().getMetricsReporter().logWarning({
          message: 'Error loading adlib manifest',
          manifestFilename,
        });
      }

      setAiGenerateState('none');
      setAdlibs(adlibsValue);
      setPromptText('');
      variantHistory.current = [];
    };

    fetchAdlib();
  }, [adlibs, aiGenerateState, getInitialChoices]);

  useEffect(() => {
    if (adlibs && currentSources) {
      setAdlibChoices(getInitialChoices(adlibs));
    }
  }, [adlibs, currentSources, getInitialChoices]);

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setAiGenerateState('loading');
    setHasGenerated(false);
  });

  const generateDancerCache = useCallback(
    async (regenerate = false) => {
      const startTime = Date.now();

      if (!adlibs || !adlibChoices) {
        return;
      }

      // Special case: for the creature-attire-mood-style-05 adlib only,
      // move mood from choices to choicesExtra, and use a unique path.
      // This is because the style option is not used in retrieving the
      // head image, and is instead used to retrieve the body.
      let choicesToSave;
      let choicesExtraToSave;
      let pathToSave;
      if (
        [
          'creature-attire-mood-style-04',
          'creature-attire-mood-style-05',
        ].includes(adlibOption)
      ) {
        pathToSave =
          adlibOption === 'creature-attire-mood-style-04'
            ? 'creature-attire-mood-04'
            : 'creature-attire-mood-05';
        choicesToSave = Object.keys(adlibChoices)
          .slice(0, -1)
          .map(key => adlibChoices[key]);
        choicesExtraToSave = Object.keys(adlibChoices)
          .slice(-1)
          .map(key => adlibChoices[key]);
      } else {
        pathToSave = adlibOption;
        choicesToSave = Object.keys(adlibChoices).map(key => adlibChoices[key]);
        choicesExtraToSave = undefined;
      }

      // Build a list of available variants, excluding blocked ones.
      const variants = [];
      for (
        let variant = 0;
        variant <= adlibs[adlibOption].variantCount - 1;
        variant++
      ) {
        // Generate a filename that will match an entry in the block list.
        const assetFilename = `${choicesToSave?.join('-')}-${variant
          .toString()
          .padStart(2, '0')}`;

        if (!blockList.current?.[adlibOption].includes(assetFilename)) {
          variants.push(variant);
        }
      }

      // Build a smaller set of available variants, by excluding recently-shown
      // ones.
      const newVariants = variants.filter(
        variant => !variantHistory.current.includes(variant)
      );

      const variant = sample(newVariants) as number;
      const bodyVariant = getRandomInt(0, BODY_VARIANT_COUNT - 1);

      // Keep the recently-shown array length at a maximum that ensures
      // there are still two choices to be made each time.
      const availableVariantCount = variants.length;
      const lengthOfVariantsHistory = Math.max(availableVariantCount - 2, 2);
      const newVariantsHistory: number[] = [...variantHistory.current, variant];
      if (newVariantsHistory.length > lengthOfVariantsHistory) {
        newVariantsHistory.shift(); // Remove the oldest entry.
      }
      variantHistory.current = newVariantsHistory;

      const newDancerMetadata: GeneratedDancerMetadata = {
        adlibOption,
        path: (queryParams('ai-dancer-path') as string) || pathToSave,
        choices: choicesToSave,
        choicesExtra: choicesExtraToSave,
        variant,
        extraVariant: bodyVariant,
      };
      analyticsReporter.sendEvent(
        EVENTS[`${regenerate ? 'REGENERATE' : 'GENERATE'}_DANCER_CLICKED`],
        {
          ...newDancerMetadata,
          levelPath: window.location.pathname,
        }
      );
      updateSources(
        {...currentSources, generatedDancer: newDancerMetadata},
        true
      );

      const elapsedTime = Date.now() - startTime;
      const remainingDelayDuration = Math.max(
        GENERATE_TOTAL_DELAY_DURATION -
          GENERATE_INITIAL_DELAY_DURATION -
          elapsedTime,
        0
      );
      await new Promise(res => setTimeout(res, remainingDelayDuration));
    },
    [adlibChoices, adlibOption, adlibs, updateSources, currentSources]
  );

  // Update session storage whenever the generated dancer metadata changes and update the canvas key so the canvas refreshes.
  const [canvasKey, setCanvasKey] = useState<string>();
  useEffect(() => {
    const metadataString = JSON.stringify(currentSources.generatedDancer);
    if (metadataString) {
      trySetSessionStorage(GENERATED_DANCER_STORAGE_KEY, metadataString);
    } else {
      // If no dancer has been generated on this level, clear session storage to prevent stale artifacts from showing.
      sessionStorage.removeItem(GENERATED_DANCER_STORAGE_KEY);
    }
    setCanvasKey(metadataString || 'none');
  }, [currentSources]);

  const [hasGenerated, setHasGenerated] = useState(false);
  const signedIn = useAppSelector(state => state.currentUser.signInState);
  const scriptName = useAppSelector(state => state.progress.scriptName);
  const logLevelActivity = useCallback(() => {
    const eventName = levelProperties.isProjectLevel
      ? EVENTS.PROJECT_ACTIVITY
      : EVENTS.LEVEL_ACTIVITY;

    analyticsReporter.sendEvent(eventName, {
      signedIn: signedIn,
      unitName: scriptName,
      levelId: levelProperties.id,
      levelName: levelProperties.name,
    });
  }, [levelProperties, signedIn, scriptName]);

  const generateDancer = useCallback(
    async (regenerate = false) => {
      if (!hasGenerated) {
        logLevelActivity();
      }
      setAiGenerateState('generating');
      await new Promise(res =>
        setTimeout(res, GENERATE_INITIAL_DELAY_DURATION)
      );
      await generateDancerCache(regenerate);
      setAiGenerateState('reviewing');
      setHasGenerated(true);
    },
    [generateDancerCache, hasGenerated, logLevelActivity]
  );

  const glowSpeed = aiGenerateState === 'generating' ? 'fast' : 'normal';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      setContainerHeight(containerRef.current?.clientHeight ?? 0);
    });
    resizeObserver.observe(containerRef.current);
    setContainerHeight(containerRef.current.clientHeight ?? 0);
    return () => resizeObserver.disconnect();
  }, []);

  const onAdlibChoicesChange = useCallback((choices: AdlibChoices) => {
    setAdlibChoices({...choices});
    variantHistory.current = [];
  }, []);

  const onAdlibTextChange = useCallback((text: string) => {
    setPromptText(text);
  }, []);

  const parentProperties = useParentLevelProperties();
  const showNavigation =
    !levelProperties.isProjectLevel && !parentProperties?.isProjectLevel;
  const sublevelOnContinue = useCallback(() => {
    dispatch(
      sendSuccessReportForLevel(
        levelProperties.id.toString(),
        levelProperties.appName
      )
    );
  }, [dispatch, levelProperties.appName, levelProperties.id]);

  return (
    <div id="dance-lab" className={moduleStyles.dancerGenerate}>
      <div className={moduleStyles.mainContent}>
        <ResourcePanel
          levelProperties={levelProperties}
          hasRun={false}
          hasEdited={false}
          isRunning={false}
          // We only display the sidebar, so none of the above props matter.
          sidebarOnly={true}
        />
        <Guide id="generate-panel">
          {aiGenerateState === 'none' && levelProperties.longInstructions && (
            <MainInstructionsContent
              instructionsText={levelProperties.longInstructions}
              markdownClassName={moduleStyles.markdown}
            />
          )}

          {aiGenerateState === 'generating' && (
            <div>
              <Heading3>Generating...</Heading3>
              AI is generating a dancer based on your prompt.
            </div>
          )}

          {aiGenerateState === 'none' &&
            levelProperties.aiDancerGenerateText && (
              <>
                <div>Describe the dancer you'd like AI to create.</div>
                <textarea
                  id="generate-description"
                  onChange={evt => {
                    setPromptText(evt.target.value);
                  }}
                  value={promptText}
                  rows={4}
                  className={moduleStyles.textArea}
                />
                <Button
                  ariaLabel={'Continue'}
                  text={'Continue'}
                  type="primary"
                  color="black"
                  size="s"
                  iconRight={{iconName: 'arrow-right', iconStyle: 'solid'}}
                  onClick={() => {
                    dispatch(continueOrFinishLesson());
                    analyticsReporter.sendEvent('hoai2025-dancer-prompt', {
                      promptText,
                    });
                  }}
                />
              </>
            )}
          {['none', 'generating'].includes(aiGenerateState) &&
            !levelProperties.aiDancerGenerateText && (
              <>
                {adlibs && adlibChoices && (
                  <Adlib
                    adlib={adlibs[adlibOption]}
                    adlibChoices={adlibChoices}
                    readOnly={['generating', 'reviewing'].includes(
                      aiGenerateState
                    )}
                    glowSpeed={glowSpeed}
                    onChoicesChange={onAdlibChoicesChange}
                    onTextChange={onAdlibTextChange}
                  />
                )}
                <div className={moduleStyles.buttonRow}>
                  <Button
                    ariaLabel={
                      aiGenerateState === 'none'
                        ? 'Generate dancer'
                        : 'Generating dancer'
                    }
                    text={
                      aiGenerateState === 'none'
                        ? 'Generate dancer'
                        : 'Generating dancer'
                    }
                    type="primary"
                    color="black"
                    size="s"
                    iconLeft={{iconName: 'sparkles'}}
                    isPending={aiGenerateState === 'generating'}
                    disabled={aiGenerateState === 'generating'}
                    onClick={() => generateDancer()}
                    className={moduleStyles.buttonWide}
                  />
                </div>
              </>
            )}
          {aiGenerateState === 'reviewing' && (
            <div>
              <Heading3>Decide what to do next</Heading3>
              <div>
                AI generated a dancer based on your prompt, "{promptText}"
              </div>
            </div>
          )}
          {aiGenerateState === 'reviewing' && (
            <>
              <div className={moduleStyles.buttonRow}>
                <Button
                  ariaLabel={'Back to prompt'}
                  text={'Back to prompt'}
                  type="secondary"
                  color="black"
                  size="s"
                  onClick={() => {
                    analyticsReporter.sendEvent(
                      EVENTS.GENERATE_DANCER_BACK_TO_PROMPT_CLICKED,
                      {
                        levelPath: window.location.pathname,
                      }
                    );
                    setAiGenerateState('none');
                  }}
                  className={moduleStyles.buttonWide}
                />

                <Button
                  ariaLabel={'Regenerate'}
                  text={'Regenerate'}
                  type="secondary"
                  color="black"
                  size="s"
                  iconLeft={{iconName: 'sparkles'}}
                  onClick={() => generateDancer(true)}
                  className={moduleStyles.buttonWide}
                />

                {showNavigation && (
                  <NavigationArea
                    levelProperties={levelProperties}
                    // The following props don't really matter as we don't have a Submit button or validation here.
                    hasRun={true}
                    hasEdited={true}
                    isRunning={false}
                    className={moduleStyles.buttonWide}
                    // If on a Music Dance AI sublevel, make sure we report success for this specific sublevel so that progress is correctly updated.
                    onContinue={
                      parentProperties ? sublevelOnContinue : undefined
                    }
                  />
                )}
              </div>
            </>
          )}
          {/* Retain focus with a hidden button. */}
          {['generating'].includes(aiGenerateState) && (
            <div
              tabIndex={0}
              role="button"
              className={moduleStyles.hiddenButton}
            />
          )}
        </Guide>
        <div className={moduleStyles.dancerContainer} ref={containerRef}>
          <div className={moduleStyles.background}>
            <img
              src={backgroundImage}
              alt=""
              className={moduleStyles.backgroundImage}
            />
          </div>

          {aiGenerateState === 'generating' && (
            <div className={moduleStyles.dancerSilhouetteBright}>
              <img alt="" src={dancerSilhouetteBrightImage} />
            </div>
          )}

          {canvasKey && (
            <div
              className={classNames(
                moduleStyles.dancer,
                aiGenerateState === 'generating' && moduleStyles.dancerHidden
              )}
            >
              <DancerCanvas
                key={canvasKey}
                size={containerHeight * 1.1}
                move={getConfigValue('danceMove') || 'rest'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateDancer;
