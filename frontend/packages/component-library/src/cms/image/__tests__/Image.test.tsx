import {render, screen} from '@testing-library/react';
import {Image} from '../';

describe('Image Component', () => {
  it('renders Image component', () => {
    render(<Image src="test.jpg" altText={'This is an image'} />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'This is an image');
  });
});
