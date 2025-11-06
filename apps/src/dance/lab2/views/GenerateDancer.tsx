import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {Heading4} from '@code-dot-org/component-library/typography';
import {sample} from 'lodash';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useParentLevelProperties} from '@cdo/apps/bubbleChoice/customModes/MusicDanceAi/ParentLevelPropertiesContext';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {DanceLevelProperties} from '@cdo/apps/dance/types';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
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
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import getRandomInt from '@cdo/apps/util/getRandomInt';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {trySetLocalStorage} from '@cdo/apps/utils';
import dancerEmptyHeadShoulders from '@cdo/static/dance/dancer-empty-head-shoulders.png';

import {getConfigValue} from '../../lottie/LottieDancerUtils';

import moduleStyles from './generate-dancer.module.scss';

const BODY_VARIANT_COUNT = 5;

const GENERATE_DELAY_DURATION = 5000;

const adlibOptions = {
  creature: [
    {id: 'axolotl', text: 'axolotl'},
    {id: 'cat', text: 'cat'},
    {id: 'dog', text: 'dog'},
    {id: 'flame', text: 'flame'},
    {id: 'fox', text: 'fox'},
    {id: 'frilled_lizard', text: 'frilled lizard'},
    {id: 'frog', text: 'frog'},
    {id: 'giraffe', text: 'giraffe'},
    {id: 'koala', text: 'koala'},
    {id: 'moose', text: 'moose'},
    {id: 'rabbit', text: 'rabbit'},
    {id: 'squirrel', text: 'squirrel'},
    {id: 'tiger', text: 'tiger'},
    {id: 'wolf', text: 'wolf'},
    {id: 'zombie', text: 'zombie'},
  ],
  attire: [
    {id: 'beanie', text: 'beanie'},
    {id: 'colorful_hair', text: 'colorful hair'},
    {id: 'crown', text: 'crown'},
    {id: 'headphones', text: 'headphones'},
    {id: 'headscarf', text: 'headscarf'},
    {id: 'sunglasses', text: 'sunglasses'},
    {id: 'no_accessories', text: 'no accessories'},
  ],
  mood: [
    {id: 'confused', text: 'confused'},
    {id: 'fierce', text: 'fierce'},
    {id: 'happy', text: 'happy'},
    {id: 'silly', text: 'silly'},
    {id: 'sleepy', text: 'sleepy'},
    {id: 'surprised', text: 'surprised'},
  ],
  style: [
    {id: 'classic', text: 'classic'},
    {id: 'fantasy', text: 'fantasy'},
    {id: 'kpop', text: 'K-pop'},
    {id: 'preppy', text: 'preppy'},
    {id: 'retro', text: 'retro'},
    {id: 'rock', text: 'rock'},
    {id: 'scifi', text: 'sci-fi'},
    {id: 'sporty', text: 'sporty'},
    {id: 'streetwear', text: 'streetwear'},
  ],
};

const adlibs: AdlibsType = {
  'creature-05': {
    template: 'Design a {creature}.',
    options: {creature: adlibOptions.creature},
    variantCount: 7,
  },
  'creature-attire-05': {
    template: 'Design a {creature} wearing {attire}.',
    options: {
      creature: adlibOptions.creature,
      attire: adlibOptions.attire,
    },
    variantCount: 7,
  },
  'creature-attire-mood-style-05': {
    template:
      'Design a {creature} wearing {attire}, in a {mood} mood, with a {style} style.',
    options: {
      creature: adlibOptions.creature,
      attire: adlibOptions.attire,
      mood: adlibOptions.mood,
      style: adlibOptions.style,
    },
    variantCount: 7,
  },
};

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

  const getInitialChoices = () => {
    const initial: AdlibChoices = {};
    Object.keys(adlibs[adlibOption]?.options || []).forEach(key => {
      const opts = adlibs[adlibOption].options[key];
      initial[key] = sample(opts)?.id || '';
    });
    return initial;
  };

  const [adlibChoices, setAdlibChoices] = useState<AdlibChoices>(() => {
    return getInitialChoices();
  });

  const [promptText, setPromptText] = useState<string>('');

  const variantHistory = useRef<number[]>([]);

  const [aiGenerateState, setAiGenerateState] = useState<
    'none' | 'generating' | 'reviewing'
  >('none');
  const [dancerMetadata, setDancerMetadata] = useState<string | null>(
    localStorage.getItem('dancer-ai-generate')
  );

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setAiGenerateState('none');
    setAdlibChoices(getInitialChoices());
    setPromptText('');
    variantHistory.current = [];
  });

  const generateDancerCache = useCallback(async () => {
    const startTime = Date.now();

    // Avoid showing a variant if it was shown recently.
    let variant, bodyVariant;
    do {
      variant = getRandomInt(0, adlibs[adlibOption].variantCount - 1);
      bodyVariant = getRandomInt(0, BODY_VARIANT_COUNT - 1);
    } while (variantHistory.current.includes(variant));
    const newVariantsHistory = [...variantHistory.current, variant];
    // Keep the array length at a maximum of 3
    if (newVariantsHistory.length > adlibs[adlibOption].variantCount - 2) {
      newVariantsHistory.shift(); // Remove the oldest entry
    }
    variantHistory.current = newVariantsHistory;

    // Special case: for the creature-attire-mood-style-04 adlib only,
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

    const newDancerMetadata = JSON.stringify({
      adlibOption,
      path: queryParams('ai-dancer-path') || pathToSave,
      choices: choicesToSave,
      choicesExtra: choicesExtraToSave,
      variant,
      extraVariant: bodyVariant,
    });
    trySetLocalStorage('dancer-ai-generate', newDancerMetadata);
    setDancerMetadata(newDancerMetadata);

    const elapsedTime = Date.now() - startTime;
    const remainingDelayDuration = Math.max(
      GENERATE_DELAY_DURATION - elapsedTime,
      0
    );
    await new Promise(res => setTimeout(res, remainingDelayDuration));
  }, [adlibChoices, adlibOption]);

  const generateDancer = useCallback(async () => {
    setAiGenerateState('generating');
    await generateDancerCache();
    setAiGenerateState('reviewing');
  }, [generateDancerCache]);

  const glowSpeed = aiGenerateState === 'generating' ? 'fast' : 'normal';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
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

  // We artificially increase the 'generating' time so that the image doesn't appear
  // too soon.
  const showPlaceholder = aiGenerateState === 'generating' || isPreviewLoading;

  const parentProperties = useParentLevelProperties();
  const showNavigation =
    !levelProperties.isProjectLevel && !parentProperties?.isProjectLevel;

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
          {['none', 'generating'].includes(aiGenerateState) &&
            levelProperties.longInstructions && (
              <MainInstructionsContent
                instructionsText={levelProperties.longInstructions}
                markdownClassName={moduleStyles.markdown}
              />
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
                    onClick={generateDancer}
                    className={moduleStyles.buttonWide}
                  />
                </div>
              </>
            )}
          {aiGenerateState === 'reviewing' && (
            <div>
              <Heading4>Decide what to do next</Heading4>
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
                  onClick={() => setAiGenerateState('none')}
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
                  />
                )}
              </div>
            </>
          )}
        </Guide>
        <div className={moduleStyles.dancerContainer} ref={containerRef}>
          <div>
            {showPlaceholder && <img alt="" src={dancerEmptyHeadShoulders} />}
            <DancerCanvas
              key={dancerMetadata || 'none'}
              size={containerHeight}
              move={getConfigValue('danceMove') || 'rest'}
              onLoadingChange={setIsPreviewLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateDancer;
