import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ChallengeBox from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengeBox';

// ChallengeBox is an empty placeholder for now. This smoke test guards the
// render path; add behavior-specific cases as content lands.
describe('ChallengeBox', () => {
  it('renders without crashing', () => {
    expect(() => render(<ChallengeBox />)).not.toThrow();
  });
});
