import {render, screen} from '@testing-library/react';
import React from 'react';

import SignInInstructions from '@cdo/apps/templates/teacherDashboard/SignInInstructions';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

describe('SignInInstructions', () => {
  it('opens at heading level two on its own', () => {
    render(<SignInInstructions loginType={SectionLoginType.email} />);

    expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
  });

  it('drops to level three when nested under another heading', () => {
    render(
      <SignInInstructions
        loginType={SectionLoginType.email}
        headingLevel="h3"
      />
    );

    expect(screen.getByRole('heading', {level: 3})).toBeInTheDocument();
    expect(screen.queryByRole('heading', {level: 2})).toBeNull();
  });
});
