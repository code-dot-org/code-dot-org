import {Brand} from '@/config/brand';

export const GOOGLE_ANALYTICS_CONFIG = {
  [Brand.CODE_DOT_ORG]: 'G-L9HT5MZ3HD',
  [Brand.HOUR_OF_CODE]: 'G-Z6QQP1041C',
  [Brand.CS_FOR_ALL]: undefined, // https://codedotorg.atlassian.net/browse/CMS-846
};

export function getGoogleAnalyticsMeasurementId(brand: Brand) {
  return GOOGLE_ANALYTICS_CONFIG[brand];
}
