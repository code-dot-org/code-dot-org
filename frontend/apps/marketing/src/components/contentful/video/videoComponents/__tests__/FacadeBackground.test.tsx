import {render, screen, fireEvent} from '@testing-library/react';

import FacadeBackground, {FacadeProps} from '../FacadeBackground';

describe('FacadeBackground', () => {
  const defaultProps: FacadeProps = {
    posterThumbnail: 'test-thumbnail.jpg',
    alt: 'Test Alt Text',
    onClick: jest.fn(),
  };

  it('renders an image with the provided alt text', () => {
    render(<FacadeBackground {...defaultProps} />);
    const image = screen.getByAltText(defaultProps.alt);
    expect(image).toBeInTheDocument();
  });

  it('does not render an image if no posterThumbnail is provided', () => {
    render(<FacadeBackground alt="No Thumbnail" />);
    expect(screen.queryByAltText(defaultProps.alt)).not.toBeInTheDocument();
  });

  it('triggers onClick when the image is clicked', () => {
    render(<FacadeBackground {...defaultProps} />);
    const image = screen.getByAltText(defaultProps.alt);
    fireEvent.click(image);
    expect(defaultProps.onClick).toHaveBeenCalled();
  });
});
