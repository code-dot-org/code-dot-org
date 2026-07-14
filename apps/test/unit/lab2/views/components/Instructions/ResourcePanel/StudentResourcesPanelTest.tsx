import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import StudentResourcesPanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/StudentResources/StudentResourcesPanel';

// GuidedWalkthroughs pulls in shepherd.js and analytics; stub it so these
// tests exercise only the panel's section-gating logic.
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/StudentResources/GuidedWalkthroughs',
  () => () => <div>Guided walkthroughs stub</div>
);

describe('StudentResourcesPanel', () => {
  it('renders the shortcuts section when only shortcuts are provided', () => {
    render(
      <StudentResourcesPanel
        levelTours={[]}
        otherAvailableTours={[]}
        shortcuts={{Navigation: [{shortcut: 'Tab', explanation: 'Move focus'}]}}
      />
    );
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
    expect(
      screen.queryByText('Guided walkthroughs stub')
    ).not.toBeInTheDocument();
  });

  it('omits the shortcuts section when no shortcuts are provided', () => {
    render(<StudentResourcesPanel levelTours={[]} otherAvailableTours={[]} />);
    expect(screen.queryByText('Keyboard shortcuts')).not.toBeInTheDocument();
  });
});
