import Script from 'next/script';

import {Brand} from '@/config/brand';
import {
  getOnetrustAutoBlockScriptPath,
  getOneTrustDomainId,
  getOnetrustStubScriptPath,
} from '@/providers/onetrust/config';

/**
 * Loads OneTrust in an SSR & CSR environment.
 *
 * See: https://developer.onetrust.com/onetrust/docs/javascript-api
 */
const OneTrustLoader = ({brand}: {brand: Brand}) => {
  if (!brand) {
    return null;
  }

  return (
    <>
      {/* OneTrust auto block script. */}
      <Script
        src={getOnetrustAutoBlockScriptPath(brand)}
        strategy={'beforeInteractive'}
      />

      {/* OneTrust SDK script. */}
      <Script
        src={getOnetrustStubScriptPath(brand)}
        data-domain-script={getOneTrustDomainId(brand)}
        strategy={'beforeInteractive'}
      />

      {/* OneTrust promise initializer to denote when OneTrust has loaded. */}
      <Script strategy={'beforeInteractive'} id="onetrust-promise">{`
      window.oneTrustPromise = new Promise(function (resolve) {
          window.OptanonWrapper = function OptanonWrapper() {
            resolve(window.OneTrust);
          };
        });
        `}</Script>
    </>
  );
};

export default OneTrustLoader;
