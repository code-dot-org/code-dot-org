import {Brand} from '@/config/brand';

import HeaderCorporateSite from './corporateSite';
import HeaderCSforAll from './csForAll';

export const getHeader = (brand: Brand) => {
  switch (brand) {
    case Brand.CS_FOR_ALL:
      return <HeaderCSforAll />;
    case Brand.CODE_DOT_ORG:
      return <HeaderCorporateSite />;
  }
};
