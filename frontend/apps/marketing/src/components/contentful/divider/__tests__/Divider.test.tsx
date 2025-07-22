import {render, screen} from '@testing-library/react';

import Divider, {DividerProps} from '../Divider';

describe('Divider Component', () => {
  it('renders Divider component', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies the correct margin class based on the margin prop', () => {
    render(<Divider margin="l" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('divider--margin-l');
  });

  describe('renders color based on color prop', () => {
    const colorTestCases: {color: DividerProps['color']; expected: string}[] = [
      {
        color: 'primary',
        expected: 'var(--background-neutral-quaternary)', // TODO: Replace with MUI theme color
      },
      {
        color: 'strong',
        expected: 'var(--background-neutral-senary)', // TODO: Replace with MUI theme color
      },
    ];

    colorTestCases.forEach(({color, expected}) => {
      it(`applies ${color} color correctly`, () => {
        render(<Divider color={color} />);
        expect(screen.getByRole('separator')).toHaveStyle({
          backgroundColor: expected,
        });
      });
    });
  });
});
