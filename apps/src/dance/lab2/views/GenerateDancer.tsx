import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {Heading4} from '@code-dot-org/component-library/typography';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {DanceLevelProperties} from '@cdo/apps/dance/types';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {useMultiProject} from '@cdo/apps/lab2/projects/MultiProjectContainer';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {AdlibsType} from '@cdo/apps/lab2/views/components/guide/Adlib';
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

const GENERATE_DELAY_DURATION = 7000;

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
    {id: 'jellyfish', text: 'jellyfish'},
    {id: 'koala', text: 'koala'},
    {id: 'moose', text: 'moose'},
    {id: 'mushroom', text: 'mushroom'},
    {id: 'planet', text: 'planet'},
    {id: 'rabbit', text: 'rabbit'},
    {id: 'squirrel', text: 'squirrel'},
    {id: 'tiger', text: 'tiger'},
    {id: 'turtle', text: 'turtle'},
    {id: 'volcano', text: 'volcano'},
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
  'animal-02': {
    template: 'Create {animal}.',
    options: {
      animal: [
        {id: 'wolf', text: 'a wolf'},
        {id: 'moose', text: 'a moose'},
        {id: 'frog', text: 'a frog'},
        {id: 'tiger', text: 'a tiger'},
        {id: 'panda', text: 'a panda'},
      ],
    },
    variantCount: 5,
  },
  'animal-attire-02': {
    template: 'Create {animal} wearing {attire}.',
    options: {
      animal: [
        {id: 'wolf', text: 'a wolf'},
        {id: 'moose', text: 'a moose'},
        {id: 'frog', text: 'a frog'},
        {id: 'tiger', text: 'a tiger'},
        {id: 'panda', text: 'a panda'},
      ],
      attire: [
        {id: 'headscarf', text: 'a headscarf'},
        {id: 'sunglasses', text: 'sunglasses'},
        {id: 'headphones', text: 'headphones'},
        {id: 'crown', text: 'a crown'},
        {id: 'beanie', text: 'a beanie'},
      ],
    },
    variantCount: 5,
  },
  'adjective-animal-attire-02': {
    template: 'Create {animal} wearing {attire}, with {adjective} style.',
    options: {
      adjective: [
        {id: 'basic', text: 'a basic'},
        {id: 'emo', text: 'an emo'},
        {id: 'sporty', text: 'a sporty'},
        {id: 'streetwear', text: 'a streetwear'},
        {id: 'fancy', text: 'a fancy'},
        {id: 'preppy', text: 'a preppy'},
      ],
      animal: [
        {id: 'wolf', text: 'a wolf'},
        {id: 'moose', text: 'a moose'},
        {id: 'frog', text: 'a frog'},
        {id: 'tiger', text: 'a tiger'},
        {id: 'panda', text: 'a panda'},
      ],
      attire: [
        {id: 'headscarf', text: 'a headscarf'},
        {id: 'sunglasses', text: 'sunglasses'},
        {id: 'headphones', text: 'headphones'},
        {id: 'crown', text: 'a crown'},
        {id: 'beanie', text: 'a beanie'},
      ],
    },
    variantCount: 5,
  },
  'adjective-animal-attire-mood-03': {
    template:
      'Create {animal} wearing {attire}, in {mood} mood, with {adjective} style.',
    options: {
      adjective: [
        {id: 'basic', text: 'a basic'},
        {id: 'emo', text: 'an emo'},
        {id: 'sporty', text: 'a sporty'},
        {id: 'streetwear', text: 'a streetwear'},
        {id: 'fancy', text: 'a fancy'},
        {id: 'preppy', text: 'a preppy'},
      ],
      animal: [
        {id: 'wolf', text: 'a wolf'},
        {id: 'moose', text: 'a moose'},
        {id: 'frog', text: 'a frog'},
        {id: 'tiger', text: 'a tiger'},
        {id: 'panda', text: 'a panda'},
      ],
      attire: [
        {id: 'headscarf', text: 'a headscarf'},
        {id: 'sunglasses', text: 'sunglasses'},
        {id: 'headphones', text: 'headphones'},
        {id: 'crown', text: 'a crown'},
        {id: 'beanie', text: 'a beanie'},
      ],
      mood: [
        {id: 'happy', text: 'a happy'},
        {id: 'silly', text: 'a silly'},
        {id: 'sleepy', text: 'a sleepy'},
        {id: 'surprised', text: 'a surprised'},
        {id: 'confused', text: 'a confused'},
        {id: 'fierce', text: 'a fierce'},
      ],
    },
    variantCount: 5,
  },
  'creature-04': {
    template: 'Design a {creature}.',
    options: {creature: adlibOptions.creature},
    variantCount: 5,
  },
  'creature-attire-04': {
    template: 'Design a {creature} wearing {attire}.',
    options: {
      creature: adlibOptions.creature,
      attire: adlibOptions.attire,
    },
    variantCount: 5,
  },
  'creature-attire-mood-style-04': {
    template:
      'Design a {creature} wearing {attire}, in a {mood} mood, with a {style} style.',
    options: {
      creature: adlibOptions.creature,
      attire: adlibOptions.attire,
      mood: adlibOptions.mood,
      style: adlibOptions.style,
    },
    variantCount: 5,
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

  const [promptText, setPromptText] = useState<string>('');
  const [choices, setChoices] = useState<string[] | undefined>(undefined);

  const variantHistory = useRef<number[]>([]);

  const [aiGenerateState, setAiGenerateState] = useState<
    'none' | 'generating' | 'reviewing'
  >('none');
  const [dancerMetadata, setDancerMetadata] = useState<string | null>(
    localStorage.getItem('dancer-ai-generate')
  );

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setAiGenerateState('none');
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
    if (adlibOption === 'creature-attire-mood-style-04') {
      pathToSave = 'creature-attire-mood-04';
      choicesToSave = choices?.slice(0, -1);
      choicesExtraToSave = [choices?.at(-1)];
    } else {
      pathToSave = adlibOption;
      choicesToSave = choices;
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
  }, [adlibOption, choices]);

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

  const onAdlibChange = useCallback((promptText: string, choices: string[]) => {
    setPromptText(promptText);
    setChoices([...choices]);
    variantHistory.current = [];
  }, []);

  // We artificially increase the 'generating' time so that the image doesn't appear
  // too soon.
  const showPlaceholder = aiGenerateState === 'generating' || isPreviewLoading;

  const multiProject = useMultiProject();
  const showNavigation = !levelProperties.isProjectLevel && !multiProject;

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
                  readOnly={['generating', 'reviewing'].includes(
                    aiGenerateState
                  )}
                  glowSpeed={glowSpeed}
                  onChange={onAdlibChange}
                />
                {aiGenerateState === 'none' && (
                  <div className={moduleStyles.buttonRow}>
                    <Button
                      ariaLabel={'Generate dancer'}
                      text={'Generate dancer'}
                      type="primary"
                      color="black"
                      size="s"
                      iconLeft={{iconName: 'sparkles'}}
                      onClick={generateDancer}
                      className={moduleStyles.buttonWide}
                    />
                  </div>
                )}
              </>
            )}
          {aiGenerateState === 'generating' ? 'Generating dancer.' : ''}
          {aiGenerateState === 'reviewing' && (
            <div>
              <Heading4>Your Dancer is Ready</Heading4>
              <div>Do you want to keep what AI generated?</div>
            </div>
          )}
          {aiGenerateState === 'reviewing' && (
            <>
              <div className={moduleStyles.buttonRow}>
                <Button
                  ariaLabel={'Try prompting again'}
                  text={'Try prompting again'}
                  type="primary"
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
