import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import ShareLogo from '@cdo/apps/code-studio/components/shareLogo/ShareLogo';
import type {BrandCode} from '@cdo/apps/util/brand';
import {SiteConfigProvider} from '@cdo/apps/util/SiteConfigContext';

// Note: jest maps every *.svg import to one shared stub module, so the four
// brand logos are indistinguishable here — asset selection by theme is covered
// at the hook level (useBackgroundThemeTest) and verified manually. These tests
// cover the brand-dependent label and the home link.

function renderShareLogo(brand: BrandCode = 'codeai', homeUrl = '/home') {
  return render(
    <SiteConfigProvider config={{brand}}>
      <ShareLogo homeUrl={homeUrl} />
    </SiteConfigProvider>
  );
}

describe('ShareLogo', () => {
  afterEach(() => {
    document.body.className = '';
  });

  it('links to the provided home url', () => {
    renderShareLogo('codeai', '/home');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/home');
  });

  it('labels the logo with the CodeAI brand name', () => {
    renderShareLogo('codeai');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'CodeAI home');
  });

  it('labels the logo with the Code.org brand name for the code brand', () => {
    renderShareLogo('code');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Code.org home');
  });

  it('renders the CodeAI label for codeai-family brands', () => {
    renderShareLogo('codeai-audit');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'CodeAI home');
  });
});
