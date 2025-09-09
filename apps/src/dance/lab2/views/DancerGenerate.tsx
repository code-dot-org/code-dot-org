import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback, useState} from 'react';

import {getGeneratedDancerAssets} from '@cdo/apps/lab2/utils/GeneratedDancer';
import Adlib from '@cdo/apps/lab2/views/components/guide/Adlib';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import getRandomInt from '@cdo/apps/util/getRandomInt';

import moduleStyles from './dancer-generate.module.scss';

const adlibs = {
  basic: {
    template:
      'Please generate a dancer.  It should look like a {animal} with {appearance}.',
    options: {
      animal: ['frog', 'moose'],
      appearance: ['hair', 'glasses'],
    },
  },
};

const DancerGenerate: React.FunctionComponent = () => {
  const [adlibText, setAdlibText] = useState<string | undefined>(undefined);
  const [joinedChoicesText, setJoinedChoicesText] = useState('');

  const [aiGenerateState, setAiGenerateState] = useState<
    'none' | 'generating' | 'done'
  >('none');

  const [headImageUrl, setHeadImageUrl] = useState<string | undefined>(
    undefined
  );

  const delay = (time: number) => {
    return new Promise(res => {
      setTimeout(res, time);
    });
  };

  const generateDancerCache = useCallback(async () => {
    const startTime = Date.now();
    const variant = getRandomInt(0, 1);
    const {head} = await getGeneratedDancerAssets(
      'basic',
      joinedChoicesText,
      variant
    );
    setHeadImageUrl(head);
    const elapsedTime = Date.now() - startTime;
    const delayDuration = 2000; // 2 seconds.
    const remainingDelayDuration = Math.max(delayDuration - elapsedTime, 0);
    await delay(remainingDelayDuration);
  }, [joinedChoicesText]);

  const generateDancer = useCallback(async () => {
    setAiGenerateState('generating');
    await generateDancerCache();
    setAiGenerateState('done');
  }, [generateDancerCache]);

  return (
    <div id="dance-lab" className={moduleStyles.dancerGenerate}>
      <Guide id="generate-panel">
        {(aiGenerateState === 'generating' || aiGenerateState === 'done') && (
          <div className={moduleStyles.textArea}>{adlibText}</div>
        )}
        {aiGenerateState === 'none' && (
          <>
            <Adlib
              template={adlibs['basic'].template}
              options={adlibs['basic'].options}
              onChange={(adlibText, joinedChoicesText) => {
                setAdlibText(adlibText);
                setJoinedChoicesText(joinedChoicesText);
              }}
              className={moduleStyles.textArea}
            />
            <Button
              ariaLabel={'Generate dancer'}
              text={'Generate dancer'}
              type="primary"
              color="purple"
              size="s"
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
              color="purple"
              size="s"
              onClick={generateDancer}
            />

            <Button
              ariaLabel={'Adjust prompt'}
              text={'Adjust prompt'}
              type="primary"
              color="purple"
              size="s"
              onClick={() => setAiGenerateState('none')}
            />
          </>
        )}
      </Guide>
      {aiGenerateState === 'done' && (
        <img alt="" src={headImageUrl} className={moduleStyles.headImage} />
      )}
    </div>
  );
};

export default DancerGenerate;
