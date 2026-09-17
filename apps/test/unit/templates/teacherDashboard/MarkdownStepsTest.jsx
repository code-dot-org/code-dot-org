import {render, screen} from '@testing-library/react';
import React from 'react';

import MarkdownSteps from '@cdo/apps/templates/teacherDashboard/MarkdownSteps';

describe('MarkdownSteps', () => {
  it('renders a run of steps as a single ordered list', () => {
    render(<MarkdownSteps steps={['1. First step', '2. Second step']} />);

    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('starts the list at the first step number', () => {
    render(<MarkdownSteps steps={['3. Third step', '4. Fourth step']} />);

    expect(screen.getByRole('list')).toHaveAttribute('start', '3');
  });

  it('drops steps that do not apply to this section', () => {
    render(
      <MarkdownSteps steps={['1. First step', false, '2. Second step']} />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
