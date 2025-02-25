import Overline from '@/components/overline';
import {render, screen} from '@testing-library/react';

type OverlineColorClassMap = [
  'primary' | 'secondary',
  `overline-color-${'primary' | 'secondary'}`,
][];

const colorClassMappings: OverlineColorClassMap = [
  ['primary', 'overline-color-primary'],
  ['secondary', 'overline-color-secondary'],
];

type OverlineSizeClassMap = [
  's' | 'm' | 'l',
  `overline-${'three' | 'two' | 'one'}`,
][];

const sizeClassMappings: OverlineSizeClassMap = [
  ['s', 'overline-three'],
  ['m', 'overline-two'],
  ['l', 'overline-one'],
];

describe('Overline Component', () => {
  it('renders Overline with default props', () => {
    render(
      <Overline size="m" color="primary">
        Test Overline
      </Overline>,
    );

    const overlineElement = screen.getByText('Test Overline');

    expect(overlineElement).toBeInTheDocument();
    expect(overlineElement.tagName.toLowerCase()).toBe('p'); // Ensures semanticTag="p"
  });

  it.each(colorClassMappings)(
    'applies the correct color class for color=%s',
    (color, expectedClass) => {
      render(
        <Overline size="m" color={color}>
          Test Overline
        </Overline>,
      );

      const overlineElement = screen.getByText('Test Overline');
      expect(overlineElement).toHaveClass(expectedClass);
    },
  );

  it.each(sizeClassMappings)(
    'sets correct visualAppearance for size=%s',
    (size, expectedAppearance) => {
      render(
        <Overline size={size} color="primary">
          Test Overline
        </Overline>,
      );

      const overlineElement = screen.getByText('Test Overline');
      expect(overlineElement.className.includes(expectedAppearance)).toBe(true);
    },
  );
});
