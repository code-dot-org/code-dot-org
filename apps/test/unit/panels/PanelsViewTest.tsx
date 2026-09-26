import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import PanelsView from '@cdo/apps/panels/PanelsView';
import {Panel} from '@cdo/apps/panels/types';

const panels: Panel[] = [
  {
    key: 'choice',
    imageUrl: '',
    text: 'Pick a path',
    links: [
      {text: 'Story', x: 30, y: 60, targetKey: '', url: '/s/unit/levels/3'},
      {text: 'Details', x: 70, y: 60, targetKey: 'details'},
    ],
  },
  {key: 'details', imageUrl: '', text: 'More about it'},
];

function renderView() {
  const handlers = {onContinue: jest.fn(), onFollowLink: jest.fn()};
  render(
    <PanelsView
      panels={panels}
      useLinks
      targetWidth={800}
      targetHeight={600}
      offerBrowserTts={false}
      levelId="1"
      {...handlers}
    />
  );
  return handlers;
}

describe('PanelsView links', () => {
  it('follows a link with a URL instead of changing panels', () => {
    const handlers = renderView();
    fireEvent.click(screen.getByRole('button', {name: 'Story'}));
    expect(handlers.onFollowLink).toHaveBeenCalledWith('/s/unit/levels/3');
    expect(handlers.onContinue).not.toHaveBeenCalled();
    expect(screen.getByText('Pick a path')).toBeTruthy();
  });

  it('jumps to the target panel for a link without a URL', () => {
    const handlers = renderView();
    fireEvent.click(screen.getByRole('button', {name: 'Details'}));
    expect(handlers.onFollowLink).not.toHaveBeenCalled();
    expect(screen.getByText('More about it')).toBeTruthy();
  });
});
