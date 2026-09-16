import {render, screen} from '@testing-library/react';
import React from 'react';

import EmbedView from '@cdo/apps/weblab2/layout/EmbedView';

// HTMLPreview drags in the redux store, the sandboxed preview origin and a service
// worker. The point of this test is which panels EmbedView renders, so stub it out.
jest.mock('@cdo/apps/weblab2/htmlPreview/HTMLPreview', () => ({
  HTMLPreview: () => <div role="region" aria-label="Preview" />,
}));

jest.mock('@cdo/apps/lab2/views/components/layout/ShareButtonPanel', () => ({
  __esModule: true,
  default: () => <button type="button">Share</button>,
}));

describe('EmbedView', () => {
  it('renders the preview', () => {
    render(<EmbedView />);
    expect(screen.getByRole('region', {name: 'Preview'})).toBeInTheDocument();
  });

  it('renders nothing but the preview', () => {
    // The guarantee that makes this layout usable inside a page of markdown: no share
    // panel, no instructions panel, no workspace header, no view-mode toggle.
    render(<EmbedView />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getAllByRole('region')).toHaveLength(1);
  });
});
