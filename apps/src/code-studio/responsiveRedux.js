import { makeEnum } from '@cdo/apps/utils';

const SET_RESPONSIVE_SIZE = 'responsive/SET_RESPONSIVE_SIZE';
export const setResponsiveSize = responsiveSize => ({ type: SET_RESPONSIVE_SIZE, responsiveSize });

export const ResponsiveSize = makeEnum('lg', 'md', 'sm', 'xs');

// Default window widths that are the starting points for each width category.
const Breakpoints = [
  {breakpoint: 992, responsiveSize: ResponsiveSize.lg},
  {breakpoint: 720, responsiveSize: ResponsiveSize.md},
  {breakpoint: 650, responsiveSize: ResponsiveSize.sm},
  {breakpoint: 0, responsiveSize: ResponsiveSize.xs},
];

export function getResponsiveBreakpoint(width) {
  return Breakpoints.find(({breakpoint}) => width > breakpoint).responsiveSize;
}

const initialState = {
  responsiveSize: getResponsiveBreakpoint(window.innerWidth),
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
