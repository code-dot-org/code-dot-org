import {render, screen} from '@testing-library/react';
import React from 'react';

import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

import {expect} from '../../util/reconfiguredChai';

describe('Design System - Tooltip', () => {
  it('Tooltip - renders with correct label', () => {
    const WithTooltipToRender = () => (
      <WithTooltip tooltipProps={{tooltipId: 'tooltip1', text: 'tooltipText'}}>
        <button type="button">hover me</button>
      </WithTooltip>
    );
    const {rerender} = render(<WithTooltipToRender />);

    let tooltip = screen.getByText('tooltipText');
    let tooltipTrigger = screen.getByText('hover me');

    expect(tooltip).to.exist;
    expect(tooltipTrigger).to.exist;

    rerender(<WithTooltipToRender />);

    tooltip = screen.getByText('tooltipText');
    expect(tooltip).to.exist;
  });
});
