import {render, screen} from '@testing-library/react';
import React from 'react';

import TeacherActionsBox from '@cdo/apps/templates/sectionProgressV2/TeacherActionsBox';

import {expect} from '../../../util/reconfiguredChai';

describe('TeacherActionsBox Component', () => {
  it('renders all options', () => {
    render(<TeacherActionsBox />);
    expect(screen.getByText('Teacher Actions')).to.exist;
    expect(screen.getByText('Needs feedback')).to.exist;
    expect(screen.getByText('Feedback given')).to.exist;
    expect(screen.getByText("Marked as 'keep working'")).to.exist;
  });
});
