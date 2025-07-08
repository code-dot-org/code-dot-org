import {Brand} from '@/config/brand';

export const BRAND_OPENGRAPH_DEFAULT_IMAGE_URL: {
  [brand in Brand]: string | undefined;
} = {
  [Brand.CODE_DOT_ORG]:
    'https://contentful-images.code.org/90t6bu6vlf76/6QAykNTAjFdgHya4lBchyF/539e119f045b74395ec9aca97bacf6ed/opengraph-default.png',
  [Brand.HOUR_OF_CODE]: undefined,
  [Brand.CS_FOR_ALL]: undefined, // https://codedotorg.atlassian.net/browse/CMS-847
};
