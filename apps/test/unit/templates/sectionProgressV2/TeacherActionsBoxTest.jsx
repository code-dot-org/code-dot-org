import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import TeacherActionsBox from '@cdo/apps/templates/sectionProgressV2/TeacherActionsBox';

describe('TeacherActionsBox Component', () => {
  it('renders the box with only "Needs feedback" when user does not have a lesson open', () => {
    render(<TeacherActionsBox isViewingLevelProgress={false} />);
    expect(screen.getByText('Teacher Actions')).to.exist;
    expect(screen.getByText('Needs feedback')).to.exist;
    expect(screen.queryByText('Feedback given')).to.be.null;
    expect(screen.queryByText('Viewed')).to.be.null;
    expect(screen.queryByText("Marked as 'keep working'")).to.be.null;
  });

  it('renders the box with all available options when user has a lesson open', () => {
    render(<TeacherActionsBox isViewingLevelProgress={true} />);
    expect(screen.getByText('Teacher Actions')).to.exist;
    expect(screen.getByText('Needs feedback')).to.exist;
    expect(screen.getByText('Feedback given')).to.exist;
    expect(screen.getByText('Viewed')).to.exist;
    expect(screen.getByText("Marked as 'keep working'")).to.exist;
  });
});
