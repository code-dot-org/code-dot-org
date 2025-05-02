import {PublicEnvScript} from 'next-runtime-env';

import FontLoader from '@code-dot-org/fonts/FontLoader';

interface BootstrapProps {
  locale: string;
}
const Bootstrap = ({locale}: BootstrapProps) => {
  return (
    <>
      <PublicEnvScript disableNextScript={true} />
      <FontLoader locale={locale} />
    </>
  );
};

export default Bootstrap;
