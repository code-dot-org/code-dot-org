import {render, screen, fireEvent} from '@testing-library/react';

import Facade from '../Facade';

describe('Facade', () => {
  const mockOnClick = jest.fn();
  const defaultProps = {
    label: 'Play Video',
    posterThumbnail: 'thumbnail.jpg',
    onClick: mockOnClick,
  };

  it('renders the Facade component with the correct label and poster thumbnail', () => {
    render(<Facade {...defaultProps} />);

    expect(screen.getByAltText(defaultProps.label)).toBeInTheDocument();
    expect(screen.getByAltText(defaultProps.label)).toHaveAttribute(
      'src',
      defaultProps.posterThumbnail,
    );
    expect(
      screen.getByRole('button', {name: defaultProps.label}),
    ).toBeInTheDocument();
  });

  it('calls the onClick handler when the FacadeBackground is clicked', () => {
    render(<Facade {...defaultProps} />);

    const facadeBackground = screen.getByAltText(defaultProps.label);
    fireEvent.click(facadeBackground);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls the onClick handler when the PlayButton is clicked', () => {
    render(<Facade {...defaultProps} />);

    const playButton = screen.getByRole('button', {name: defaultProps.label});
    fireEvent.click(playButton);

    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('renders with the correct class name', () => {
    render(<Facade {...defaultProps} />);

    const facadeElement = screen
      .getByAltText(defaultProps.label)
      .closest('div');
    expect(facadeElement).toHaveClass('facade');
  });
});
