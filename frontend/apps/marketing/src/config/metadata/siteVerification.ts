import {Metadata} from 'next';

import {Brand} from '@/config/brand';

export function getSiteVerification(
  brand: Brand,
): Metadata['verification'] | undefined {
  switch (brand) {
    case Brand.CODE_DOT_ORG:
      // This was done to separate code.org from studio.code.org
      // Other sites do not need this specific verification as they use domain verification.
      return {
        google: 'LX_oP5X8q2qzWY0u0Hsz9MT7Htdr-NYqJs1uqk1CiJ0',
      };
    case Brand.HOUR_OF_CODE:
    case Brand.CS_FOR_ALL:
      return undefined;
  }
}
