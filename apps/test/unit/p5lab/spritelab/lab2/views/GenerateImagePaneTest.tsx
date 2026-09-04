import {render, screen} from '@testing-library/react';
import React from 'react';

import {
  GalleryCard,
  galleryCardLabel,
} from '@cdo/apps/p5lab/spritelab/lab2/views/GenerateImagePane';

// Gallery cards carry no visible caption in the student gallery, so the
// label IS the card's accessible name — these tests pin what a screen
// reader announces and what the hover tooltip shows.

describe('galleryCardLabel', () => {
  const props = {
    name: 'image_1',
    generation: {prompt: 'a purple witch flying on a broom'},
  };

  it('labels student cards by prompt and advanced cards by name', () => {
    expect(galleryCardLabel(props, false)).toBe(
      'a purple witch flying on a broom'
    );
    expect(galleryCardLabel(props, true)).toBe('image_1');
  });

  it('falls back to the name when an image has no prompt', () => {
    expect(galleryCardLabel({name: 'drawing_2'}, false)).toBe('drawing_2');
    expect(galleryCardLabel(undefined, false)).toBeUndefined();
  });

  it('leaves labels of up to 125 characters untouched', () => {
    const label = 'x'.repeat(125);
    expect(galleryCardLabel({name: label}, true)).toBe(label);
  });

  it('caps longer labels at 125 characters, ending in an ellipsis', () => {
    const truncated = galleryCardLabel({name: 'y'.repeat(200)}, true);
    expect(truncated).toHaveLength(125);
    expect(truncated).toBe('y'.repeat(124) + '…');
  });

  it('does not leave a dangling space before the ellipsis', () => {
    const wordy = ('word '.repeat(40) + 'tail').slice(0, 200);
    expect(galleryCardLabel({name: wordy}, true)).not.toContain(' …');
  });
});

describe('GalleryCard', () => {
  it('exposes the label as the thumbnail alt text and tooltip', () => {
    render(
      <GalleryCard
        animKey="k1"
        label="a purple witch flying on a broom"
        thumb="data:image/png;base64,"
        onOpen={() => {}}
      />
    );
    const button = screen.getByRole('button', {
      name: 'a purple witch flying on a broom',
    });
    expect(button).toHaveAttribute('title', 'a purple witch flying on a broom');
    expect(
      screen.getByAltText('a purple witch flying on a broom')
    ).toBeInTheDocument();
  });

  it('shows the caption under the thumbnail only when one is given', () => {
    const {rerender} = render(
      <GalleryCard animKey="k1" label="prompt text" onOpen={() => {}} />
    );
    expect(screen.queryByText('image_1')).not.toBeInTheDocument();
    rerender(
      <GalleryCard
        animKey="k1"
        label="prompt text"
        caption="image_1"
        onOpen={() => {}}
      />
    );
    expect(screen.getByText('image_1')).toBeInTheDocument();
  });
});
