import { makeEnum } from '@cdo/apps/utils';

const SET_RESPONSIVE_SIZE = 'isRtl/SET_RESPONSIVE_SIZE';
export const setResponsiveSize = responsiveSize => ({ type: SET_RESPONSIVE_SIZE, responsiveSize });

export const ResponsiveSize = makeEnum('lg', 'md', 'sm', 'xs');

// Default window widths that are the starting points for each width category.
const Breakpoints = {
  [ResponsiveSize.lg]: 992,
  [ResponsiveSize.md]: 720,
  [ResponsiveSize.sm]: 650,
  [ResponsiveSize.xs]: 0,
};

export function getResponsiveBreakpoint() {
  const width = window.innerWidth;

  Object.entries(Breakpoints, ([responsiveSize, breakpointWidth]) => {
    if (width > breakpointWidth) {
      return responsiveSize;
    }
  });
}

const initialState = {
  responsiveSize: getResponsiveBreakpoint(),
};

/**
 * Reducer for responsive sizes. Only return a new state if we've actually
 * crossed into a new breakpoint width.
 */
export default function reducer(state = initialState, action) {
  if (action.type === SET_RESPONSIVE_SIZE && state.responsiveSize !== action.responsiveSize) {
    return {...state, responsiveSize: action.responsiveSize};
  }
  return state;
}
