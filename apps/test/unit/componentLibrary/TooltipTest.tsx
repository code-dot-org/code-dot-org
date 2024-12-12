import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import {WithTooltip, TooltipProps} from '@cdo/apps/componentLibrary/tooltip';

describe('Design System - Tooltip', () => {
  const renderWithTooltip = (tooltipProps: Partial<TooltipProps>) => {
    const WithTooltipToRender: React.FC = () => (
      <WithTooltip
        tooltipProps={{
          tooltipId: 'tooltip1',
          text: 'tooltipText',
          ...tooltipProps,
        }}
      >
        <button type="button">hover me</button>
      </WithTooltip>
    );
    return render(<WithTooltipToRender />);
  };

  it('renders with correct label and shows tooltip on hover', async () => {
    const user = userEvent.setup();

    renderWithTooltip({text: 'tooltipText'});

    // Initial state: Tooltip should not be present
    const tooltipTrigger = screen.getByText('hover me');
    expect(screen.queryByText('tooltipText')).not.toBeInTheDocument();
    expect(tooltipTrigger).toBeInTheDocument();

    // Hover over the trigger to show the tooltip
    await user.hover(tooltipTrigger);

    // Tooltip should now be present
    expect(screen.getByText('tooltipText')).toBeInTheDocument();
  });
});
