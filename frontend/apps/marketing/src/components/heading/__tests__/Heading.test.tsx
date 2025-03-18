import Heading from '@/components/heading';
import {render, screen} from '@testing-library/react';

describe('Heading Component', () => {
  it('should render out all headings', async () => {
    render(
      <div>
        <Heading visualAppearance={'heading-xxl'}>xxl - h1</Heading>
        <Heading visualAppearance={'heading-xl'}>xl - h2</Heading>
        <Heading visualAppearance={'heading-lg'}>lg - h3</Heading>
        <Heading visualAppearance={'heading-md'}>md - h4</Heading>
        <Heading visualAppearance={'heading-sm'}>sm - h5</Heading>
        <Heading visualAppearance={'heading-xs'}>xs - h6</Heading>
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
});
