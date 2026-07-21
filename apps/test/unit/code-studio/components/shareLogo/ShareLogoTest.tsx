import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import ShareLogo from '@cdo/apps/code-studio/components/shareLogo/ShareLogo';

// Note: jest maps every *.svg import to one shared stub module, so the two
// logos are indistinguishable here — asset selection by theme is covered at the
// hook level (useBackgroundThemeTest) and verified manually. These tests cover
// the home link and label.

describe('ShareLogo', () => {
  afterEach(() => {
    document.body.className = '';
  });

  it('links to the provided home url', () => {
    render(<ShareLogo homeUrl="/home" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/home');
  });

  it('labels the logo for screen readers', () => {
    render(<ShareLogo homeUrl="/home" />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'CodeAI home');
  });
});
