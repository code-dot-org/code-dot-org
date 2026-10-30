import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import NavMenu from '../NavMenu';

const ITEMS = [
  {label: 'Teachers', href: '/teachers'},
  {label: 'Districts', href: '/districts'},
  {label: 'About', href: '/about', alignEnd: true as const},
  {label: 'Donate', href: '/donate', alignEnd: true as const},
];

describe('NavMenu', () => {
  it('renders every item as a link, in order', () => {
    render(<NavMenu menuItems={ITEMS} />);
    const links = screen.getAllByRole('link', {hidden: true});
    expect(links.map(link => link.textContent)).toEqual([
      'Teachers',
      'Districts',
      'About',
      'Donate',
    ]);
  });

  it('does not add the marketing-nav class by default', () => {
    const {container} = render(<NavMenu menuItems={ITEMS} />);
    expect(container.querySelector('.marketing-nav')).not.toBeInTheDocument();
  });

  it('adds the marketing-nav class to the list when marketingNav is set', () => {
    const {container} = render(<NavMenu menuItems={ITEMS} marketingNav />);
    expect(container.querySelector('.marketing-nav')).toBeInTheDocument();
  });

  it('marks only the first alignEnd item with the auto-margin class', () => {
    render(<NavMenu menuItems={ITEMS} marketingNav />);
    const about = screen.getByRole('link', {name: 'About', hidden: true});
    const donate = screen.getByRole('link', {name: 'Donate', hidden: true});
    const teachers = screen.getByRole('link', {name: 'Teachers', hidden: true});

    expect(about.closest('li')).toHaveClass('navItemAlignEndFirst');
    expect(about.closest('li')).toHaveClass('navItemAlignEnd');
    expect(donate.closest('li')).toHaveClass('navItemAlignEnd');
    expect(donate.closest('li')).not.toHaveClass('navItemAlignEndFirst');
    expect(teachers.closest('li')).not.toHaveClass('navItemAlignEnd');
  });

  it('renders no alignEnd items when none are marked', () => {
    render(
      <NavMenu
        menuItems={[{label: 'Teachers', href: '/teachers'}]}
        marketingNav
      />,
    );
    expect(
      screen.getByRole('link', {name: 'Teachers', hidden: true}).closest('li'),
    ).not.toHaveClass('navItemAlignEnd');
  });
});
