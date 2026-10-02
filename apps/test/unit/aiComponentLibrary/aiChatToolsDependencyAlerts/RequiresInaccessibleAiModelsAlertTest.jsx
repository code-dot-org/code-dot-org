import {render, screen} from '@testing-library/react';
import React from 'react';

import {
  AI_COUNTRY_AVAILABILITY_SUPPORT_LINK,
  usOnlyModelsEssentialMessage,
} from '@cdo/apps/aichat/constants';
import RequiresInaccessibleAiModelsAlert from '@cdo/apps/aiComponentLibrary/aiChatToolsDependencyAlerts/RequiresInaccessibleAiModelsAlert';

describe('RequiresInaccessibleAiModelsAlert', () => {
  // Each page answers for its own subject, so the noun has to follow the
  // caller rather than being fixed at "course".
  it('names the course when the course page renders it', () => {
    render(<RequiresInaccessibleAiModelsAlert subject="course" />);

    screen.getByText(usOnlyModelsEssentialMessage('course'));
    expect(screen.queryByText(usOnlyModelsEssentialMessage('unit'))).toBeNull();
  });

  it('names the unit when the unit page renders it', () => {
    render(<RequiresInaccessibleAiModelsAlert subject="unit" />);

    screen.getByText(usOnlyModelsEssentialMessage('unit'));
    expect(
      screen.queryByText(usOnlyModelsEssentialMessage('course'))
    ).toBeNull();
  });

  // Nothing in AI settings can reach a model the region blocks, so this alert
  // sends the teacher to the article on where AI tools are available instead.
  it('links to the country availability article', () => {
    render(<RequiresInaccessibleAiModelsAlert subject="course" />);

    expect(
      screen.getByRole('link', {name: /Learn more/}).getAttribute('href')
    ).toBe(AI_COUNTRY_AVAILABILITY_SUPPORT_LINK);
  });
});
