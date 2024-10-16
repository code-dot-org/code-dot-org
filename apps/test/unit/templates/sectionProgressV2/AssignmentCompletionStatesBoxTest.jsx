import {render, screen} from '@testing-library/react';
import React from 'react';

import AssignmentCompletionStatesBox from '@cdo/apps/templates/sectionProgressV2/AssignmentCompletionStatesBox';

describe('AssignmentCompletionStatesBox Component', () => {
  it('renders all options', () => {
    render(<AssignmentCompletionStatesBox />);
    expect(screen.getByText('Assignment Completion States')).toBeDefined();
    expect(screen.getByText('In progress')).toBeDefined();
    expect(screen.getByText('No online work')).toBeDefined();
    expect(screen.getByText('Submitted')).toBeDefined();
    expect(screen.getByText('Validated')).toBeDefined();
  });
});
