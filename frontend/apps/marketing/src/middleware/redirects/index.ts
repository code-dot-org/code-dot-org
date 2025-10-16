import {NextRequest} from 'next/server';

import {Brand} from '@/config/brand';
import {getRedirects as getCorporateSiteRedirects} from '@/middleware/redirects/corporate';

/**
 * Brand specific redirects
 */
export function getBrandRedirects(brand: Brand, request: NextRequest) {
  switch (brand) {
    case Brand.CODE_DOT_ORG: {
      return getCorporateSiteRedirects(request);
    }
    default: {
      return undefined;
    }
  }
}
