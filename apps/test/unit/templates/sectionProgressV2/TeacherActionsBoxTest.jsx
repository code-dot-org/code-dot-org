import {render, screen} from '@testing-library/react';
import React from 'react';

import TeacherActionsBox from '@cdo/apps/templates/sectionProgressV2/TeacherActionsBox';

describe('TeacherActionsBox Component', () => {
  it('renders all options', () => {
    render(<TeacherActionsBox />);
    expect(screen.getByText('Teacher Actions')).toBeDefined();
    expect(screen.getByText('Needs feedback')).toBeDefined();
    expect(screen.getByText('Feedback given')).toBeDefined();
    expect(screen.getByText("Marked as 'keep working'")).toBeDefined();
  });
});
