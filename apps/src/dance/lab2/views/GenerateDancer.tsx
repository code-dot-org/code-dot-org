import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {Heading5} from '@code-dot-org/component-library/typography';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import BackToParentProject from '@cdo/apps/bubbleChoice/BackToParentProject';
import {DanceLevelProperties} from '@cdo/apps/dance/types';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {AdlibsType} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import DancerCanvas from '@cdo/apps/lab2/views/DancerCanvas';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import getRandomInt from '@cdo/apps/util/getRandomInt';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {trySetLocalStorage} from '@cdo/apps/utils';
import dancerEmptyHeadShoulders from '@cdo/static/dance/dancer-empty-head-shoulders.png';

import moduleStyles from './generate-dancer.module.scss';

const adlibs: AdlibsType = {
  basic: {
    template:
      'Please generate a dancer.  It should look like a {animal} with {appearance}.',
    options: {
      animal: ['frog', 'moose'],
      appearance: ['hair', 'glasses'],
    },
    variantCount: 2,
  },
  'animal-02': {
    template: 'Please generate a dancer.  It should look like a {animal}.',
    options: {
      animal: ['wolf', 'moose', 'frog', 'tiger', 'panda'],
    },
    variantCount: 5,
  },
  'animal-attire-02': {
    template:
      'Please generate a dancer.  It should look like a {animal} wearing a {attire}.',
    options: {
      animal: ['wolf', 'moose', 'frog', 'tiger', 'panda'],
      attire: ['headscarf', 'sunglasses', 'headphones', 'crown', 'beanie'],
    },
    variantCount: 5,
  },
  'adjective-animal-attire-02': {
    template:
      'Please generate a dancer.  It should look like a {adjective} {animal} wearing a {attire}.',
    options: {
      adjective: ['basic', 'emo', 'sporty', 'streetwear', 'fancy', 'preppy'],
      animal: ['wolf', 'moose', 'frog', 'tiger', 'panda'],
      attire: ['headscarf', 'sunglasses', 'headphones', 'crown', 'beanie'],
    },
    variantCount: 5,
  },
  // Earlier adlibs which will be removed soon:
  animal: {
    template: 'Please generate a dancer.  It should look like a {animal}.',
    options: {
      animal: ['frog', 'moose', 'wolf'],
    },
    variantCount: 3,
  },
  'animal-attire': {
    template:
      'Please generate a dancer.  It should look like a {animal} wearing a {attire}.',
    options: {
      animal: ['frog', 'moose', 'wolf'],
      attire: [
        'headphones',
        'sunglasses',
        'crown',
        'headscarf',
        'baseball-cap',
        'beanie',
        'headband',
      ],
    },
    variantCount: 3,
  },
  'adjective-animal-attire': {
    template:
      'Please generate a dancer.  It should look like a {adjective} {animal} wearing a {attire}.',
    options: {
      adjective: ['basic', 'goth'],
      animal: ['frog', 'moose', 'wolf'],
      attire: [
        'headphones',
        'sunglasses',
        'crown',
        'headscarf',
        'baseball-cap',
        'beanie',
        'headband',
      ],
    },
    variantCount: 3,
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
    'none' | 'generating' | 'done'
  >('none');
  const [dancerSignature, setDancerSignature] = useState<string | null>(
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
    let variant = undefined;
    do {
      variant = getRandomInt(0, adlibs[adlibOption].variantCount - 1);
    } while (variantHistory.current.includes(variant));
    const newVariantsHistory = [...variantHistory.current, variant];
    // Keep the array length at a maximum of 3
    if (newVariantsHistory.length > adlibs[adlibOption].variantCount - 2) {
      newVariantsHistory.shift(); // Remove the oldest entry
    }
    variantHistory.current = newVariantsHistory;

    const newDancerPayload = JSON.stringify({adlibOption, choices, variant});
    trySetLocalStorage('dancer-ai-generate', newDancerPayload);
    setDancerSignature(newDancerPayload);
    const elapsedTime = Date.now() - startTime;
    const delayDuration = 2000; // 2 seconds.
    const remainingDelayDuration = Math.max(delayDuration - elapsedTime, 0);
    await new Promise(res => setTimeout(res, remainingDelayDuration));
  }, [adlibOption, choices, variantHistory]);

  const generateDancer = useCallback(async () => {
    setAiGenerateState('generating');
    await generateDancerCache();
    setAiGenerateState('done');
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

  return (
    <div id="dance-lab" className={moduleStyles.dancerGenerate}>
      <Guide id="generate-panel" glowSpeed={glowSpeed}>
        <Heading5 className={moduleStyles.heading}> Use AI</Heading5>
        {(aiGenerateState === 'generating' || aiGenerateState === 'done') && (
          <div className={moduleStyles.textArea}>{promptText}</div>
        )}
        {aiGenerateState === 'none' && (
          <>
            {levelProperties.aiDancerGenerateText && (
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
            {!levelProperties.aiDancerGenerateText && (
              <>
                <Adlib
                  adlib={adlibs[adlibOption]}
                  onChange={(promptText, choices) => {
                    setPromptText(promptText);
                    setChoices(choices);
                    variantHistory.current = [];
                  }}
                  className={moduleStyles.textArea}
                />
                <Button
                  ariaLabel={'Generate dancer'}
                  text={'Generate dancer'}
                  type="primary"
                  color="black"
                  size="s"
                  iconLeft={{iconName: 'sparkles'}}
                  onClick={generateDancer}
                />
              </>
            )}
          </>
        )}
        {aiGenerateState === 'generating' ? 'Generating a dancer...' : ''}
        {aiGenerateState === 'done' && isPreviewLoading && 'Loading preview...'}
        {aiGenerateState === 'done' && !isPreviewLoading && (
          <>
            <div>Here is the dancer that was generated.</div>

            <Button
              ariaLabel={'Generate again'}
              text={'Generate again'}
              type="primary"
              color="black"
              size="s"
              iconLeft={{iconName: 'sparkles'}}
              onClick={generateDancer}
            />

            <Button
              ariaLabel={'Adjust prompt'}
              text={'Adjust prompt'}
              type="primary"
              color="black"
              size="s"
              onClick={() => setAiGenerateState('none')}
            />

            <Button
              ariaLabel={'Continue'}
              text={'Continue'}
              type="primary"
              color="black"
              size="s"
              iconRight={{iconName: 'arrow-right', iconStyle: 'solid'}}
              onClick={() => dispatch(continueOrFinishLesson())}
            />
          </>
        )}
        <BackToParentProject
          text="Go to Hub"
          iconLeft={{iconName: 'home'}}
          type="secondary"
          size="s"
        />
      </Guide>
      <div className={moduleStyles.dancerContainer} ref={containerRef}>
        {aiGenerateState === 'generating' || !dancerSignature ? (
          <img alt="" src={dancerEmptyHeadShoulders} />
        ) : (
          <>
            <DancerCanvas
              key={dancerSignature || 'none'}
              size={containerHeight}
              move="rest"
              onLoadingChange={setIsPreviewLoading}
            />
            {isPreviewLoading && (
              <div className={moduleStyles.spinnerOverlay}>
                <Spinner size="large" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateDancer;
