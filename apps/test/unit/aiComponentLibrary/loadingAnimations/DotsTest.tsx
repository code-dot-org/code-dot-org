import {render} from '@testing-library/react';
import React from 'react';

import Dots from '@cdo/apps/aiComponentLibrary/loadingAnimations/Dots';

import moduleStyles from '@cdo/apps/aiComponentLibrary/loadingAnimations/dots.module.scss';

// The dots are hidden from screen readers, so no role or text query finds
// them.
function renderDots(props: Partial<React.ComponentProps<typeof Dots>> = {}) {
  const firstDotRef = React.createRef<SVGCircleElement>();
  const dots = (stopping: boolean) => (
    <Dots stopping={stopping} firstDotRef={firstDotRef} {...props} />
  );
  const {rerender} = render(dots(false));
  return {
    drawing: () => firstDotRef.current?.ownerSVGElement,
    setStopping: (stopping: boolean) => rerender(dots(stopping)),
  };
}

describe('Dots', () => {
  it('draws three dots, hidden from screen readers', () => {
    const {drawing} = renderDots();
    expect(drawing()?.getAttribute('aria-hidden')).toBe('true');
    expect(drawing()?.getElementsByTagName('circle')).toHaveLength(3);
  });

  it('bounces until it is told to stop', () => {
    const {drawing, setStopping} = renderDots();
    expect(drawing()?.classList.contains(moduleStyles.thinking)).toBe(true);
    expect(drawing()?.classList.contains(moduleStyles.stopping)).toBe(false);

    setStopping(true);
    expect(drawing()?.classList.contains(moduleStyles.stopping)).toBe(true);
    expect(drawing()?.classList.contains(moduleStyles.thinking)).toBe(false);
  });

  it('takes its width from the caller', () => {
    const {drawing} = renderDots({width: 48});
    expect(drawing()?.getAttribute('width')).toBe('48');
  });
});
