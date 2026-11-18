import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import FreeplayIntroDialog from '@cdo/apps/p5lab/spritelab/lab2/views/FreeplayIntroDialog';

describe('FreeplayIntroDialog', () => {
  it('closes from Start free play', () => {
    const onClose = jest.fn();
    render(<FreeplayIntroDialog onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', {name: /Start free play/}));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("names Discover blocks and I'm finished as text, not buttons", () => {
    render(<FreeplayIntroDialog onClose={jest.fn()} />);
    for (const name of ['Discover blocks', "I'm finished"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.queryByRole('button', {name})).not.toBeInTheDocument();
    }
  });
});
