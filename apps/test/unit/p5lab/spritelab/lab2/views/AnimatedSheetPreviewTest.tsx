import {render, screen} from '@testing-library/react';
import React from 'react';

import {CHARACTER_STRIP_POSES} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import AnimatedSheetPreview from '@cdo/apps/p5lab/spritelab/lab2/views/AnimatedSheetPreview';

// jsdom has no canvas context, so the player never starts; what renders
// is tested.
describe('AnimatedSheetPreview', () => {
  it('is a canvas named for assistive tech, at the frame size', () => {
    render(
      <AnimatedSheetPreview
        src="data:sheet"
        frameSize={{x: 64, y: 48}}
        poses={CHARACTER_STRIP_POSES}
      />
    );
    const canvas = screen.getByLabelText('Animation preview');
    expect(canvas).toHaveAttribute('width', '64');
    expect(canvas).toHaveAttribute('height', '48');
  });

  it('plays one pose on request, and nothing for a pose the set lacks', () => {
    render(
      <AnimatedSheetPreview
        src="data:sheet"
        frameSize={{x: 64, y: 64}}
        poses={CHARACTER_STRIP_POSES}
        only="jump-left"
      />
    );
    expect(screen.getByLabelText('Animation preview')).toBeTruthy();
  });
});
