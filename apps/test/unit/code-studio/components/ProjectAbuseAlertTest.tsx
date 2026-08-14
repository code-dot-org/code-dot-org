import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ProjectAbuseAlert from '@cdo/apps/code-studio/components/ProjectAbuseAlert';

const SHARE_URL = 'https://studio.code.org/projects/sketchlab/abc123';

describe('ProjectAbuseAlert', () => {
  it('warns that the project cannot be shared and links to TOS and support', () => {
    render(<ProjectAbuseAlert shareUrl={SHARE_URL} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /terms of service/i})
    ).toHaveAttribute('href', 'http://code.org/tos');

    const contactHref = screen
      .getByRole('link', {name: /contact us/i})
      .getAttribute('href');
    expect(contactHref).toMatch(/support\.code\.org/);
    expect(contactHref).toContain(
      encodeURIComponent(`Abuse error for project at url: ${SHARE_URL}`)
    );
  });
});
