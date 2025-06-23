import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Breadcrumbs, {BreadcrumbsProps} from './../index';

describe('Breadcrumbs Component', () => {
  const breadcrumbsData = [
    {text: 'Home', href: '/'},
    {text: 'Products', href: '/products'},
    {text: 'Electronics', href: '/products/electronics'},
  ];

  const setup = (props: Partial<BreadcrumbsProps> = {}) => {
    render(
      <Breadcrumbs
        breadcrumbs={breadcrumbsData}
        name="test-breadcrumbs"
        {...props}
      />,
    );
  };

  it('renders all breadcrumbs with correct text and href except the last one', () => {
    setup();

    breadcrumbsData.slice(0, -1).forEach(({text, href}) => {
      const link = screen.getByRole('link', {name: text}) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
      expect(link).not.toHaveAttribute('aria-disabled');
    });

    const lastBreadcrumb = screen.getByText('Electronics');
    expect(lastBreadcrumb).toBeInTheDocument();
    expect(lastBreadcrumb).toHaveAttribute('aria-disabled', 'true');
    expect(lastBreadcrumb).not.toHaveAttribute('href');
  });

  it('renders the breadcrumbs container with correct test id', () => {
    setup();

    const container = screen.getByTestId('breadcrumbs-test-breadcrumbs');
    expect(container).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-class';
    setup({className: customClass});

    const container = screen.getByTestId('breadcrumbs-test-breadcrumbs');
    expect(container).toHaveClass(customClass);
  });

  it('renders chevron icons correctly between breadcrumbs', () => {
    setup();

    const chevrons = screen.getAllByTestId('font-awesome-v6-icon');
    expect(chevrons.length).toBe(breadcrumbsData.length - 1);
  });

  describe('Home Icon', () => {
    it('renders home icon when showHomeIcon is true', () => {
      setup({showHomeIcon: true});
      const homeIcon = screen.getByTitle('Home');
      expect(homeIcon).toBeInTheDocument();
    });

    it('does not render home icon when showHomeIcon is false', () => {
      setup({showHomeIcon: false});
      const homeIcon = screen.queryByTitle('Home');
      expect(homeIcon).not.toBeInTheDocument();
    });

    it('renders home icon with correct href when homeIconHref is provided', () => {
      setup({showHomeIcon: true, homeIconHref: '/dashboard'});
      const homeLink = screen.getByTitle('Home').closest('a');
      expect(homeLink).toHaveAttribute('href', '/dashboard');
    });

    it('defaults home icon link to root when homeIconHref is not provided', () => {
      setup({showHomeIcon: true});
      const homeLink = screen.getByTitle('Home').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('home icon link is clickable', async () => {
      const user = userEvent.setup();
      setup({showHomeIcon: true});
      const homeLink = screen.getByTitle('Home').closest('a');
      await user.click(homeLink!);
      expect(homeLink).not.toHaveAttribute('aria-disabled');
    });
  });
});
