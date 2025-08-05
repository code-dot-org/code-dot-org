import {Brand} from '@/config/brand';

import HeaderCorporateSite from './corporateSite/HeaderCorporateSite';
import HeaderCSforAll from './csForAll/HeaderCSforAll';

export const getHeader = (brand: Brand) => {
  switch (brand) {
    case Brand.CS_FOR_ALL:
      return <HeaderCSforAll />;
    case Brand.CODE_DOT_ORG:
      return <HeaderCorporateSite />;
  }
};
