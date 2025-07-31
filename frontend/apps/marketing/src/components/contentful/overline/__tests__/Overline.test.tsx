import {render, screen} from '@testing-library/react';

import Overline from '../Overline';

describe('Overline Component', () => {
  it('renders Overline with default props', () => {
    render(
      <Overline size="m" color="primary" removeMarginBottom={false}>
        Test Overline
      </Overline>,
    );

    const overlineElement = screen.getByText('Test Overline');

    expect(overlineElement).toBeInTheDocument();
    expect(overlineElement.tagName.toLowerCase()).toBe('p'); // Ensures semanticTag="p"
  });

  it('applies the correct variant for primary color', () => {
    render(
      <Overline size="m" color="primary" removeMarginBottom={false}>
        Primary Test Overline
      </Overline>,
    );
    const overlineElement = screen.getByText('Primary Test Overline');
    expect(overlineElement).toHaveClass('overline--color-primary');
  });

  it('applies the correct variant for secondary color', () => {
    render(
      <Overline size="m" color="secondary" removeMarginBottom={false}>
        Secondary Test Overline
      </Overline>,
    );
    const overlineElement = screen.getByText('Secondary Test Overline');
    expect(overlineElement).toHaveClass('overline--color-secondary');
  });

  it('applies the correct size class', () => {
    render(
      <Overline size="l" color="primary" removeMarginBottom={false}>
        Large Test Overline
      </Overline>,
    );
    const overlineElement = screen.getByText('Large Test Overline');
    expect(overlineElement).toHaveClass('overline--size-l');
  });

  it('removes margin when removeMarginBottom is true', () => {
    render(
      <Overline size="m" color="primary" removeMarginBottom={true}>
        Test Overline No Margin
      </Overline>,
    );

    const overlineElement = screen.getByText('Test Overline No Margin');
    expect(window.getComputedStyle(overlineElement).marginBottom).toBe('0px');
  });
});
