import '@testing-library/jest-dom';
import {render, waitFor} from '@testing-library/react';
import React from 'react';

import useBackgroundTheme from '@cdo/apps/code-studio/components/shareLogo/useBackgroundTheme';

// The hook's return value is not otherwise visible in the DOM, so surface it as
// the probe's text content.
function ThemeProbe() {
  const theme = useBackgroundTheme();
  return <span>{theme}</span>;
}

describe('useBackgroundTheme', () => {
  afterEach(() => {
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

    // jsdom delivers the MutationObserver callback outside React's act scope,
    // so this emits a benign act(...) warning; the update itself is reliable.
    document.body.className = 'background-light';
    await waitFor(() => expect(container).toHaveTextContent('light'));
  });
});
