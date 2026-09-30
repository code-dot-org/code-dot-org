import {createContext, useContext} from 'react';

/**
 * Width of the box Lab2Wrapper hands the lab, in pixels, or undefined where
 * nothing is measuring one.
 *
 * A lab sizes its panels against this rather than against the window, because
 * the two differ: Lab2Wrapper lays the TA drawer out beside the lab, so the
 * window is wider than the lab by whatever the drawer is taking. Measuring the
 * box keeps a lab honest about its own space without it having to know the
 * drawer exists.
 *
 * Read it with useMeasuredLabWidth and resolve the undefined case where the
 * width is actually used, rather than at render: a lab rendered outside a
 * Lab2Wrapper falls back to the window, and that fallback has to be re-read on
 * every resize, not captured once.
 */
const LabContentWidthContext = createContext<number | undefined>(undefined);

export const LabContentWidthProvider = LabContentWidthContext.Provider;

export function useMeasuredLabWidth(): number | undefined {
  return useContext(LabContentWidthContext);
}

export default LabContentWidthContext;
