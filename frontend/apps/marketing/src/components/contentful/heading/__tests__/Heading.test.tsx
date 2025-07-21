import {render, screen} from '@testing-library/react';

import Heading from '../Heading';

describe('Heading Component', () => {
  it('should render out all headings', async () => {
    render(
      <div>
        <Heading visualAppearance={'heading-xxl'} removeMarginBottom={false}>
          xxl - h1
        </Heading>
        <Heading visualAppearance={'heading-xl'} removeMarginBottom={false}>
          xl - h2
        </Heading>
        <Heading visualAppearance={'heading-lg'} removeMarginBottom={false}>
          lg - h3
        </Heading>
        <Heading visualAppearance={'heading-md'} removeMarginBottom={false}>
          md - h4
        </Heading>
        <Heading visualAppearance={'heading-sm'} removeMarginBottom={false}>
          sm - h5
        </Heading>
        <Heading visualAppearance={'heading-xs'} removeMarginBottom={false}>
          xs - h6
        </Heading>
      </div>,
    );

    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'xxl - h1',
    );
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'xl - h2',
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'lg - h3',
    );
    expect(screen.getByRole('heading', {level: 4})).toHaveTextContent(
      'md - h4',
    );
    expect(screen.getByRole('heading', {level: 5})).toHaveTextContent(
      'sm - h5',
    );
    expect(screen.getByRole('heading', {level: 6})).toHaveTextContent(
      'xs - h6',
    );
  });

  it('applies the color prop correctly', () => {
    render(
      <Heading
        visualAppearance="heading-lg"
        color="white"
        removeMarginBottom={false}
      >
        White Heading
      </Heading>,
    );
    const heading = screen.getByText('White Heading');
    expect(heading).toHaveStyle('color: white');
  });

  it('removes margin when removeMarginBottom is true', () => {
    render(
      <Heading visualAppearance={'heading-md'} removeMarginBottom={true}>
        No Margin
      </Heading>,
    );
    const heading = screen.getByText('No Margin');
    expect(window.getComputedStyle(heading).marginBottom).toBe('0px');
  });
});
