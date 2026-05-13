import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PanelsView from '@cdo/apps/panels/PanelsView';
import {Panel} from '@cdo/apps/panels/types';

jest.mock('@cdo/apps/localization', () => ({
  __esModule: true,
  default: {translate: (value: string) => value},
}));

jest.mock('@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper', () => ({
  useBrowserTextToSpeech: () => ({cancel: jest.fn()}),
}));

const DEFAULT_PROPS = {
  onContinue: jest.fn(),
  targetWidth: 1920,
  targetHeight: 1080,
  offerBrowserTts: false,
  levelId: null,
};

describe('PanelsView', () => {
  const panelWithImages: Panel = {
    key: 'panel-1',
    imageUrl: 'background.png',
    text: '',
    images: [
      {
        imageUrl: 'overlay-1.png',
        altText: 'Overlay one',
        x: 25,
        y: 75,
        width: 35,
      },
      {
        imageUrl: 'overlay-2.png',
        altText: 'Overlay two',
        x: 60,
        y: 20,
        width: 15,
      },
    ],
  };

  it('renders image overlays in link mode', () => {
    render(
      <PanelsView {...DEFAULT_PROPS} panels={[panelWithImages]} useLinks />
    );

    const firstImage = screen.getByAltText('Overlay one');
    const secondImage = screen.getByAltText('Overlay two');
    expect(firstImage).toHaveAttribute('src', 'overlay-1.png');
    expect(firstImage).toHaveStyle({left: '25%', top: '75%', width: '35%'});
    expect(secondImage).toHaveAttribute('src', 'overlay-2.png');
    expect(secondImage).toHaveStyle({left: '60%', top: '20%', width: '15%'});
  });

  it('renders the first image as the forward-most image', () => {
    render(
      <PanelsView {...DEFAULT_PROPS} panels={[panelWithImages]} useLinks />
    );

    expect(
      screen.getAllByRole('img').map(image => image.getAttribute('alt'))
    ).toEqual(['Overlay two', 'Overlay one']);
  });

  it('does not render image overlays outside link mode', () => {
    render(<PanelsView {...DEFAULT_PROPS} panels={[panelWithImages]} />);

    expect(screen.queryByAltText('Overlay one')).toBeNull();
    expect(screen.queryByAltText('Overlay two')).toBeNull();
  });
});
