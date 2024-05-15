import {render, screen} from '@testing-library/react';
import React from 'react';

import AssignmentCompletionStatesBox from '@cdo/apps/templates/sectionProgressV2/AssignmentCompletionStatesBox';

import {expect} from '../../../util/reconfiguredChai';

describe('AssignmentCompletionStatesBox Component', () => {
  it('renders all options', () => {
    render(<AssignmentCompletionStatesBox />);
    expect(screen.getByText('Assignment Completion States')).to.exist;
    expect(screen.getByText('In progress')).to.exist;
    expect(screen.getByText('No online work')).to.exist;
    expect(screen.getByText('Submitted')).to.exist;
    expect(screen.getByText('Validated')).to.exist;
  });
});
