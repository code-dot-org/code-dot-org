import Script from 'next/script';

import {PUBLIC_ENV_KEY} from '@/providers/environment/constants';

const EnvironmentLoader = () => {
  const publicEnvironmentVariables = {
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
    NEXT_PUBLIC_CONTAINER_DIGEST: process.env.NEXT_PUBLIC_CONTAINER_DIGEST,
    NEXT_PUBLIC_HONEYBADGER_BROWSER_API_KEY:
      process.env.NEXT_PUBLIC_HONEYBADGER_BROWSER_API_KEY,
  };

  return (
    <Script
      strategy={'beforeInteractive'}
      dangerouslySetInnerHTML={{
        __html: `window['${PUBLIC_ENV_KEY}'] = ${JSON.stringify(publicEnvironmentVariables)}`,
      }}
    />
  );
};

export default EnvironmentLoader;
