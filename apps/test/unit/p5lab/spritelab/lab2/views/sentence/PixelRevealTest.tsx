import {render, screen} from '@testing-library/react';
import React from 'react';

import {FirstShowingOnly} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/PixelReveal';

describe('FirstShowingOnly', () => {
  it('shows its children the first time a picture is shown, and not when it is shown again', () => {
    const shownIds = {current: new Set<string>()};
    const show = (id: string) =>
      render(
        <FirstShowingOnly id={id} shownIds={shownIds}>
          <span>reveal</span>
        </FirstShowingOnly>
      );
    const first = show('picture-1');
    expect(screen.getByText('reveal')).toBeTruthy();
    // A re-render while it is showing keeps the children.
    first.rerender(
      <FirstShowingOnly id="picture-1" shownIds={shownIds}>
        <span>reveal</span>
      </FirstShowingOnly>
    );
    expect(screen.getByText('reveal')).toBeTruthy();
    // Taken down and put back, as the frame is around a drawing.
    first.unmount();
    const second = show('picture-1');
    expect(screen.queryByText('reveal')).toBeNull();
    second.unmount();
    // A different picture is new.
    show('picture-2');
    expect(screen.getByText('reveal')).toBeTruthy();
  });
});
