import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import AssignmentCompletionStatesBox from '@cdo/apps/templates/sectionProgressV2/AssignmentCompletionStatesBox';

describe('AssignmentCompletionStatesBox Component', () => {
  it('renders all but the "Validated" icon when user is viewing the Assignment Completion States without a validated level open', () => {
    render(<AssignmentCompletionStatesBox hasValidatedLevels={false} />);
    expect(screen.getByText('Assignment Completion States')).to.exist;
    expect(screen.getByText('Not started')).to.exist;
    expect(screen.getByText('In progress')).to.exist;
    expect(screen.getByText('No online work')).to.exist;
    expect(screen.getByText('Submitted')).to.exist;
    expect(screen.queryByText('Validated')).to.be.null;
  });

  it('renders all icons when a user is viewing a validated level', () => {
    render(<AssignmentCompletionStatesBox hasValidatedLevels={true} />);
    expect(screen.getByText('Assignment Completion States')).to.exist;
    expect(screen.getByText('Not started')).to.exist;
    expect(screen.getByText('In progress')).to.exist;
    expect(screen.getByText('No online work')).to.exist;
    expect(screen.getByText('Submitted')).to.exist;
    expect(screen.getByText('Validated')).to.exist;
  });
});
