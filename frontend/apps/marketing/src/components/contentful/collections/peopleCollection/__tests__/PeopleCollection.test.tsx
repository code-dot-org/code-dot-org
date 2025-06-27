import {render, screen} from '@testing-library/react';

import PeopleCollection, {PeopleCollectionProps} from '../PeopleCollection';

const mockPeople: PeopleCollectionProps['people'] = [
  {
    fields: {
      name: 'Clarissa',
      title: 'CEO',
      image: {
        fields: {
          file: {url: '/clarissa.jpg'},
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      bio: 'Clarissa is the CEO.',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  {
    fields: {
      name: 'Alex',
      title: 'Engineer',
      image: {
        fields: {
          file: {url: '/alex.jpg'},
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      bio: 'Alex is an engineer.',
      personalLink: {
        fields: {
          primaryTarget: 'https://alex.com',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  {
    fields: {
      name: 'Bob',
      title: 'Designer',
      bio: 'Bob is a designer.',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
];

describe('PeopleCollection', () => {
  it('renders people with all fields', () => {
    render(<PeopleCollection people={mockPeople} />);
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByText('Alex is an engineer.')).toBeInTheDocument();
    expect(document.querySelector('img[src*="alex.jpg"]')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /Visit personal page/i}),
    ).toHaveAttribute('href', 'https://alex.com');
  });

  it('renders people without image and personalLink', () => {
    render(<PeopleCollection people={mockPeople} />);
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
    expect(screen.getByText('Bob is a designer.')).toBeInTheDocument();
    // Bob has no image, Clarissa has an image
    expect(
      document.querySelector('img[src*="bob.jpg"]'),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('img[src*="clarissa.jpg"]'),
    ).toBeInTheDocument();
    // Only Alex should have a personal link
    const links = screen.getAllByRole('link', {name: /Visit personal page/i});
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://alex.com');
  });

  it('sorts people alphabetically by name', () => {
    render(
      <PeopleCollection
        people={[mockPeople[2], mockPeople[1], mockPeople[0]]}
      />,
    );
    const headings = screen.getAllByRole('heading', {level: 3});
    expect(headings[0]).toHaveTextContent('Alex');
    expect(headings[1]).toHaveTextContent('Bob');
    expect(headings[2]).toHaveTextContent('Clarissa');
  });
});
