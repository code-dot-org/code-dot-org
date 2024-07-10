import debounce from 'lodash/debounce';

import {getStore} from '../redux';

import {getResponsiveBreakpoint, setResponsiveSize} from './responsiveRedux';

/**
 * Listen for page resize and dispatch events to Redux when if cross a
 * responsive breakpoint width.
 */
export default function initResponsive() {
  const store = getStore();

  window.addEventListener(
    'resize',
    debounce(() => {
      store.dispatch(
        setResponsiveSize(getResponsiveBreakpoint(window.innerWidth))
      );
    }, 100)
  );
}
