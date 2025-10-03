import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {Heading5} from '@code-dot-org/component-library/typography';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import LottieDancerRenderer from '@cdo/apps/dance/lottie/LottieDancerRenderer';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import Adlib, {AdlibsType} from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
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
  levelProperties: LevelProperties;
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

  const [adlibText, setAdlibText] = useState<string | undefined>(undefined);
  const [choices, setChoices] = useState<string[] | undefined>(undefined);

  const [aiGenerateState, setAiGenerateState] = useState<
    'none' | 'generating' | 'done'
  >('none');

  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    setAiGenerateState('none');
  });

  const generateDancerCache = useCallback(async () => {
    const startTime = Date.now();
    const variant = getRandomInt(0, adlibs[adlibOption].variantCount - 1);

    trySetLocalStorage(
      'dancer-ai-generate',
      JSON.stringify({adlibOption, choices, variant})
    );

    const elapsedTime = Date.now() - startTime;
    const delayDuration = 2000; // 2 seconds.
    const remainingDelayDuration = Math.max(delayDuration - elapsedTime, 0);
    await new Promise(res => setTimeout(res, remainingDelayDuration));
  }, [adlibOption, choices]);

  const generateDancer = useCallback(async () => {
    setAiGenerateState('generating');
    await generateDancerCache();
    setAiGenerateState('done');
  }, [generateDancerCache]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<LottieDancerRenderer | null>(null);
  useEffect(() => {
    if (aiGenerateState !== 'done') {
      // Tear down any existing renderer when we leave "done"
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      rendererRef.current?.destroyAnim();
      rendererRef.current = null;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Make the canvas a square matching the container’s height
    const resizeCanvas = () => {
      const h = containerRef.current?.clientHeight ?? 0;
      if (h > 0) {
        canvas.width = h;
        canvas.height = h;
        rendererRef.current?.resize();
      }
    };
    resizeCanvas();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;

    (async () => {
      // Create/init renderer and load the 'rest' move.
      const r = new LottieDancerRenderer();
      r.init(ctx as unknown as CanvasRenderingContext2D);
      await r.setSource('rest');
      if (cancelled) return;

      rendererRef.current = r;

      // Simple RAF loop over frames (mirror after each full loop)
      let frame = 0; // floating frame counter; renderer floors internally
      let loopIndex = 0; // which loop we’re on
      let mirror = false; // flip every time we start a new loop
      const speed = 0.5; // frames advanced per RAF tick (your previous "/ 2")

      const tick = () => {
        const total = (r.getTotalFrames() ?? 1) || 1;

        // If we advanced into a new loop, toggle mirror
        const nextLoopIndex = Math.floor(frame / total);
        if (nextLoopIndex !== loopIndex) {
          loopIndex = nextLoopIndex;
          mirror = !mirror;
        }

        r.renderFrame(frame);
        frame += speed;

        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    })();

    // Keep canvas sized to container
    const ro = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      cancelled = true;
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      rendererRef.current?.destroyAnim();
      rendererRef.current = null;
    };
  }, [aiGenerateState]);

  return (
    <div id="dance-lab" className={moduleStyles.dancerGenerate}>
      <Guide id="generate-panel">
        <Heading5 className={moduleStyles.heading}> Use AI</Heading5>
        {(aiGenerateState === 'generating' || aiGenerateState === 'done') && (
          <div className={moduleStyles.textArea}>{adlibText}</div>
        )}
        {aiGenerateState === 'none' && (
          <>
            <Adlib
              adlib={adlibs[adlibOption]}
              onChange={(adlibText, choices) => {
                setAdlibText(adlibText);
                setChoices(choices);
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
        {aiGenerateState === 'generating' ? 'Generating a dancer...' : ''}
        {aiGenerateState === 'done' && (
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
      </Guide>

      <div className={moduleStyles.dancerContainer}>
        <div className={moduleStyles.dancerContainer} ref={containerRef}>
          {aiGenerateState === 'done' ? (
            <canvas ref={canvasRef} aria-label="Generated dancer animation" />
          ) : (
            <img alt="" src={dancerEmptyHeadShoulders} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateDancer;
