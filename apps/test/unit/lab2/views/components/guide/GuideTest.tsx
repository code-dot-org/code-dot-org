import {render, screen} from '@testing-library/react';
import React from 'react';

import Guide from '@cdo/apps/lab2/views/components/guide/Guide';

// The panel is the element holding the guide's text.
const panel = () => screen.getByText('hi');

describe('Guide width', () => {
  it('takes a named share by class and no inline width', () => {
    render(
      <Guide id="g" width="narrow">
        hi
      </Guide>
    );
    expect(panel().className).toMatch(/NarrowWidth/);
    expect(panel().style.width).toBe('');
  });

  it('takes a fixed width in px inline, with no share class', () => {
    render(
      <Guide id="g" width={400}>
        hi
      </Guide>
    );
    expect(panel().style.width).toBe('400px');
    expect(panel().className).not.toMatch(/Width/);
  });

  it('lets a collapsed guide shrink-wrap instead of keeping the fixed width', () => {
    render(
      <Guide id="g" width={400} collapsed>
        hi
      </Guide>
    );
    expect(panel().style.width).toBe('');
    expect(panel().className).toMatch(/Collapsed/);
  });
});
