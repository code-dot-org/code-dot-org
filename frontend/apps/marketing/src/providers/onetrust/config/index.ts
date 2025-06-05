import {Brand} from '@/config/brand';
import {getStage} from '@/config/stage';

/**
 * Retrieves the OneTrust domain id by brand.
 * @param brand Code.org brand
 */
function getOneTrustDomainIdByBrand(brand: Brand) {
  switch (brand) {
    case Brand.CODE_DOT_ORG:
      return '27cca70a-7db3-4852-9ef0-a6660fd0977d';
    case Brand.HOUR_OF_CODE:
      return '7c79c547-a2fc-4998-9b21-0c7a5e67e345';
    default:
      return undefined;
  }
}

/**
 * Returns the OneTrust asset base path. For production, it is self-hosted. For pre-production, it is sourced from the
 * OneTrust CDN so that it enables live testing without having to upload new self-hosted files.
 * @param brand Code.org brand
 */
function getOneTrustAssetBasePath(brand: Brand) {
  const stage = getStage();

  switch (stage) {
    case 'production':
      /**
       * TODO: Once Pegasus is deprecated, uncomment this line and remove the extra cp from package.json in
       * copy:static-assets to the .next/static/public directory
       * https://codedotorg.atlassian.net/browse/CMS-786
       */
      return `/_next/static/public/onetrust/${brand}`;
    default:
      return `https://cdn.cookielaw.org`;
  }
}

/**
 * Returns the OneTrust domain id to use. For production, it returns the normal domain id. For pre-production, it
 * returns the test version of the domain id.
 * @param brand Code.org brand
 */
export function getOneTrustDomainId(brand: Brand) {
  const stage = getStage();
  const onetrustDomainId = getOneTrustDomainIdByBrand(brand);

  switch (stage) {
    case 'production':
      return onetrustDomainId;
    default:
      return `${onetrustDomainId}-test`;
  }
}

/**
 * Returns the OneTrust Auto Block script path
 * @param brand Code.org brand
 */
export function getOnetrustAutoBlockScriptPath(brand: Brand) {
  return `${getOneTrustAssetBasePath(brand)}/consent/${getOneTrustDomainId(brand)}/OtAutoBlock.js`;
}

/**
 * Returns the OneTrust SDK script path
 * @param brand Code.org brand
 */
export function getOnetrustStubScriptPath(brand: Brand) {
  return `${getOneTrustAssetBasePath(brand)}/scripttemplates/otSDKStub.js`;
}
