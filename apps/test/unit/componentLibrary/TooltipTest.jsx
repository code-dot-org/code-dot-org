import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

describe('Design System - Tooltip', () => {
  it('Tooltip - renders with correct label', async () => {
    const user = userEvent.setup();

    const WithTooltipToRender = () => (
      <WithTooltip tooltipProps={{tooltipId: 'tooltip1', text: 'tooltipText'}}>
        <button type="button">hover me</button>
      </WithTooltip>
    );
    const {rerender} = render(<WithTooltipToRender />);

    let tooltip = screen.queryByText('tooltipText');
    let tooltipTrigger = screen.getByText('hover me');

    expect(tooltip).toBeFalsy();
    expect(tooltipTrigger).toBeDefined();

    await user.hover(tooltipTrigger);

    rerender(<WithTooltipToRender />);

    tooltip = screen.getByText('tooltipText');
    expect(tooltip).toBeDefined();
  });
});
