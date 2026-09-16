import '@testing-library/jest-dom';
import {cleanup, render} from '@testing-library/react';
import React, {act} from 'react';

import useBackgroundTheme from '@cdo/apps/code-studio/components/shareLogo/useBackgroundTheme';

// The hook's return value is not otherwise visible in the DOM, so surface it as
// the probe's text content.
function ThemeProbe() {
  const theme = useBackgroundTheme();
  return <span>{theme}</span>;
}

describe('useBackgroundTheme', () => {
  afterEach(() => {
    cleanup();
    document.body.className = '';
  });

  it('reports dark for background-dark', () => {
    document.body.className = 'background-dark';
    const {container} = render(<ThemeProbe />);
    expect(container).toHaveTextContent('dark');
  });

  it('reports light for background-light', () => {
    document.body.className = 'background-light';
    const {container} = render(<ThemeProbe />);
    expect(container).toHaveTextContent('light');
  });

  it('treats the legacy music-black class as dark', () => {
    document.body.className = 'music-black';
    const {container} = render(<ThemeProbe />);
    expect(container).toHaveTextContent('dark');
  });

  it('defaults to dark when no background class is set', () => {
    const {container} = render(<ThemeProbe />);
    expect(container).toHaveTextContent('dark');
  });

  it('updates when the body class changes after mount', async () => {
    document.body.className = 'background-dark';
    const {container} = render(<ThemeProbe />);
    expect(container).toHaveTextContent('dark');

    await act(async () => {
      document.body.className = 'background-light';
      await Promise.resolve();
    });
    expect(container).toHaveTextContent('light');
  });
});
