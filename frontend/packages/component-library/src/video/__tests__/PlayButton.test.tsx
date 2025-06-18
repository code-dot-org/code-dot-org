import {render, screen} from '@testing-library/react';

import PlayButton from '../PlayButton';

const defaultProps = {
  label: 'Play video',
  onClick: jest.fn(),
};

describe('PlayButton Component', () => {
  it('renders the PlayButton component with the correct label', () => {
    render(<PlayButton {...defaultProps} />);
    const button = screen.getByRole('button', {name: /Play video/i});
    expect(button).toBeInTheDocument();
  });

  it('triggers focus when tabbed to', () => {
    render(<PlayButton {...defaultProps} />);
    const button = screen.getByRole('button', {name: /Play video/i});
    button.focus();
    expect(button).toHaveFocus();
  });

  it('handles click events correctly', () => {
    render(<PlayButton {...defaultProps} />);
    const button = screen.getByRole('button', {name: /Play video/i});
    button.click();
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });
});
