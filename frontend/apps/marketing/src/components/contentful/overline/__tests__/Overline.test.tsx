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
