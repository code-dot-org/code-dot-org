import {Icon} from 'next/dist/lib/metadata/types/metadata-types';

import {Brand} from '@/config/brand';

import CDOFavIcon from './favicons/code.org.ico';
import CSForAllFavIcon from './favicons/csforall.ico';
import HOCFavIcon from './favicons/hourofcode.ico';

function getFavIconImage(brand: Brand) {
  switch (brand) {
    case Brand.CODE_DOT_ORG:
      return CDOFavIcon;
    case Brand.HOUR_OF_CODE:
      return HOCFavIcon;
    case Brand.CS_FOR_ALL:
      return CSForAllFavIcon;
  }
}

export function getIcons(brand: Brand): Array<Icon> {
  // Temporary favicon location for Pegasus compatability.
  // Remove when Pegasus is deprecated.
  // TODO: https://codedotorg.atlassian.net/browse/CMS-731
  if (brand === Brand.CODE_DOT_ORG) {
    return [
      {
        url: '/images/favicon.ico',
        href: '/images/favicon.ico',
      },
    ];
  }

  const favIcon = getFavIconImage(brand);

  return [
    {
      url: favIcon.src,
      href: favIcon.src,
    },
  ];
}
