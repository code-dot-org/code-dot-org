import {render, screen} from '@testing-library/react';

import PlayButton from '../PlayButton';

describe('PlayButton Component', () => {
  it('renders the PlayButton component with the correct label', () => {
    render(<PlayButton label="Play video" />);
    const button = screen.getByRole('button', {name: 'Play video'});
    expect(button).toBeVisible();
  });

  it('triggers focus when tabbed to', async () => {
    render(<PlayButton label="Play video" />);
    const button = screen.getByRole('button', {name: 'Play video'});
    button.focus();
    expect(button).toHaveFocus();
  });
});
