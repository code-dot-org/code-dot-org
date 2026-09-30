import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {GalleryCard} from '../GenerateImagePane';

vi.mock('@code-dot-org/core/api', async importOriginal => ({
  ...(await importOriginal<typeof import('@code-dot-org/core/api')>()),
  DashboardApiClient: vi.fn(),
}));
vi.mock('../../ai/images/imageGeneration', () => ({generateImage: vi.fn()}));
vi.mock('../../ai/images/characterSet', async importOriginal => ({
  ...(await importOriginal<typeof import('../../ai/images/characterSet')>()),
  generateCharacterSet: vi.fn(),
}));
vi.mock('../../redux/store', () => ({
  default: {getState: vi.fn(), dispatch: vi.fn()},
  useAppSelector: vi.fn(),
  useAppDispatch: () => vi.fn(),
}));

// Gallery cards carry no visible caption in the student gallery, so the alt
// text is the card's accessible name; no title attribute renders (the full
// prompt lives in the image's dialog, not on the card).

describe('GalleryCard', () => {
  it('names the card by the image name, as the thumbnail alt text', () => {
    render(
      <GalleryCard
        animKey="k1"
        name="Background 2"
        thumb="data:image/png;base64,"
        onOpen={() => {}}
      />,
    );
    const button = screen.getByRole('button', {name: 'Background 2'});
    expect(screen.getByAltText('Background 2')).toBeTruthy();
    expect(button.hasAttribute('title')).toBe(false);
  });

  it('falls back to a generic alt when the image has no name', () => {
    render(
      <GalleryCard
        animKey="k1"
        thumb="data:image/png;base64,"
        onOpen={() => {}}
      />,
    );
    expect(screen.getByAltText('image')).toBeTruthy();
  });

  it('shows the caption under the thumbnail only when one is given', () => {
    const {rerender} = render(
      <GalleryCard animKey="k1" name="Sprite 1" onOpen={() => {}} />,
    );
    expect(screen.queryByText('Sprite 1')).toBeNull();
    rerender(
      <GalleryCard
        animKey="k1"
        name="Sprite 1"
        caption="Sprite 1"
        onOpen={() => {}}
      />,
    );
    expect(screen.getByText('Sprite 1')).toBeTruthy();
  });
});
