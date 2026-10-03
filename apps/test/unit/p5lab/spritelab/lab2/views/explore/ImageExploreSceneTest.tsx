import {render, screen} from '@testing-library/react';
import React from 'react';

import ImageExploreScene from '@cdo/apps/p5lab/spritelab/lab2/views/explore/ImageExploreScene';

describe('ImageExploreScene', () => {
  it('shows the image area and the editing controls', () => {
    render(<ImageExploreScene imageType="sprite" defaultStyle="pixel" />);
    expect(screen.getByRole('region', {name: 'Your image'})).toBeTruthy();
    expect(screen.getByRole('radio', {name: /Pixel/})).toBeTruthy();
    expect(screen.getByRole('radio', {name: /Smooth/})).toBeTruthy();
    expect(screen.getByRole('checkbox', {name: 'Make it move'})).toBeTruthy();
    expect(
      (screen.getByRole('button', {name: 'Generate'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(
      screen.getByRole('button', {name: "I'll draw it myself"})
    ).toBeTruthy();
  });

  it('offers no animation for an object', () => {
    render(
      <ImageExploreScene
        imageType="sprite"
        imageSubject="object"
        defaultStyle="smooth"
      />
    );
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});
