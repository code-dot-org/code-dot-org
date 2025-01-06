import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

describe('Design System - FontAwesomeV6Icon', () => {
  const defaultProps: FontAwesomeV6IconProps = {
    iconStyle: 'solid',
    iconName: 'check',
    title: 'check-icon',
    className: 'test-class',
  };

  it('renders with correct attributes and classNames', () => {
    render(<FontAwesomeV6Icon {...defaultProps} />);

    const icon = screen.getByTitle('check-icon');
    expect(icon).toBeInTheDocument();
    // TODO [Design2-197] - Create a visual test for this case checking the icon style and name.
    expect(icon.classList.contains('fa-solid')).toBe(true);
    expect(icon.classList.contains('fa-check')).toBe(true);
    expect(icon.classList.contains('test-class')).toBe(true);
  });

  it('applies a different icon style and name', () => {
    const props: FontAwesomeV6IconProps = {
      ...defaultProps,
      iconStyle: 'regular',
      iconName: 'circle',
    };

    render(<FontAwesomeV6Icon {...props} />);

    const icon = screen.getByTitle('check-icon'); // Title remains consistent.
    expect(icon).toBeInTheDocument();
    // TODO [Design2-197] - Create a visual test for this case checking the icon style and name.
    expect(icon.classList.contains('fa-regular')).toBe(true);
    expect(icon.classList.contains('fa-circle')).toBe(true);
  });
});
