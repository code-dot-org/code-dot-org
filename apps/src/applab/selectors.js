/** @file App Lab redux selectors */
import _ from 'lodash';
import {selectors as makerSelectors} from '../lib/kits/maker/redux';

export default {
  // Curry maker selectors so they accept the applab root state.
  maker: _.mapValues(makerSelectors, selector => state => selector(state.maker))
};
