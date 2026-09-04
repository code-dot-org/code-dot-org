import {render, screen} from '@testing-library/react';
import React from 'react';

import {GalleryCard} from '@cdo/apps/p5lab/spritelab/lab2/views/GenerateImagePane';

// Gallery cards carry no visible caption in the student gallery, so the alt
// text IS the card's accessible name — these tests pin that a screen reader
// hears the image's name, and that the card carries no title attribute
// (native tooltips are deliberately not used; the prompt lives in the
// dialog, not on the card).

describe('GalleryCard', () => {
  it('names the card by the image name, as the thumbnail alt text', () => {
    render(
      <GalleryCard
        animKey="k1"
        name="Background 2"
        thumb="data:image/png;base64,"
        onOpen={() => {}}
      />
    );
    const button = screen.getByRole('button', {name: 'Background 2'});
    expect(screen.getByAltText('Background 2')).toBeInTheDocument();
    expect(button).not.toHaveAttribute('title');
  });

  it('falls back to a generic alt when the image has no name', () => {
    render(
      <GalleryCard
        animKey="k1"
        thumb="data:image/png;base64,"
        onOpen={() => {}}
      />
    );
    expect(screen.getByAltText('image')).toBeInTheDocument();
  });

  it('shows the caption under the thumbnail only when one is given', () => {
    const {rerender} = render(
      <GalleryCard animKey="k1" name="Sprite 1" onOpen={() => {}} />
    );
    expect(screen.queryByText('Sprite 1')).not.toBeInTheDocument();
    rerender(
      <GalleryCard
        animKey="k1"
        name="Sprite 1"
        caption="Sprite 1"
        onOpen={() => {}}
      />
    );
    expect(screen.getByText('Sprite 1')).toBeInTheDocument();
  });
});
