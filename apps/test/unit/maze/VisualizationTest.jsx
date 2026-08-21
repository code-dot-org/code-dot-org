import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Visualization from '@cdo/apps/maze/Visualization';

// Regression (f2ab81f): the keyboard-nav hooks live on the svg itself, not a
// wrapping div. That keeps the svg as #visualization's direct child, so the
// responsive scaling in `#visualization.responsive > *` anchors on it. An
// intermediate wrapper box shifted the scale origin and pushed the maze
// (notably the 800x800 neighborhood board) off-screen.
describe('maze Visualization', () => {
  it('makes the svg itself the focusable nav host, with no wrapper div', () => {
    const rendered = shallow(<Visualization useProtectedDiv={false} />);

    expect(rendered.find('div[role="application"]')).toHaveLength(0);

    const svg = rendered.find('svg#svgMaze');
    expect(svg).toHaveLength(1);
    expect(svg.prop('role')).toBe('application');
    expect(svg.prop('tabIndex')).toBe(0);
  });

  // The label is the only place the keys are announced, so it has to name all
  // of them. Painter passes its own wording through navHint.
  it('names every key in the default nav hint', () => {
    const label = shallow(<Visualization useProtectedDiv={false} />)
      .find('svg#svgMaze')
      .prop('aria-label');

    expect(label).toContain('Enter');
    expect(label).toContain('arrow keys');
    expect(label).toContain('P');
    expect(label).toContain('Escape');
  });

  it('uses a caller-supplied nav hint', () => {
    const rendered = shallow(
      <Visualization useProtectedDiv={false} navHint="Neighborhood grid." />
    );

    expect(rendered.find('svg#svgMaze').prop('aria-label')).toBe(
      'Neighborhood grid.'
    );
  });
});
