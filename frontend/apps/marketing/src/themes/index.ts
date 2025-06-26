import {Brand} from '@/config/brand';

import CDOTheme from './code.org';
import CSForAllTheme from './csforall';

export function getMuiTheme(brand: Brand) {
  switch (brand) {
    case Brand.CS_FOR_ALL:
      return CSForAllTheme;
    case Brand.CODE_DOT_ORG:
    default:
      return CDOTheme;
  }
}
