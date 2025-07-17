import {render, screen} from '@testing-library/react';

import {SpacingProps} from '@/components/common/types';

import Divider, {DividerProps} from '../Divider';

describe('Divider Component', () => {
  it('renders Divider component', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  describe('renders margin based on margin prop', () => {
    const marginTestCases = [
      {margin: 'none', expected: 'margin: 0px 0px 0px 0px'},
      {margin: 'xs', expected: 'margin: 8px 0px 8px 0px'},
      {margin: 's', expected: 'margin: 16px 0px 16px 0px'},
      {margin: 'm', expected: 'margin: 32px 0px 32px 0px'},
      {margin: 'l', expected: 'margin: 64px 0px 64px 0px'},
    ];

    marginTestCases.forEach(({margin, expected}) => {
      it(`applies ${margin} margin correctly`, () => {
        render(<Divider margin={margin as keyof SpacingProps} />);
        expect(screen.getByRole('separator')).toHaveStyle(expected);
      });
    });
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
