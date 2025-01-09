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

  it('renders all breadcrumbs with correct text and href', () => {
    setup();

    breadcrumbsData.slice(0, 2).forEach(({text, href}) => {
      const link = screen.getByText(text) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link.href).toContain(href);
    });
  });

  it('renders correct test id for the breadcrumbs container', () => {
    setup();

    // TODO [Design2-197] - Create a visual test for this case instead of checking for class name
    // eslint-disable-next-line no-restricted-properties
    const container = screen.getByTestId('breadcrumbs-test-breadcrumbs');
    expect(container).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-class';
    setup({className: customClass});

    // TODO [Design2-197] - Create a visual test for this case instead of checking for class name
    // eslint-disable-next-line no-restricted-properties
    const container = screen.getByTestId('breadcrumbs-test-breadcrumbs');
    // TODO [Design2-197] - Create a visual test for this case instead of checking for class name
    // eslint-disable-next-line no-restricted-properties
    expect(container).toHaveClass(customClass);
  });

  it('renders chevron icon between breadcrumbs except after the last one', () => {
    setup();

    // TODO [Design2-197] - Create a visual test for this case instead of checking for class name
    // Since the FontAwesome icon might not have a clear role, check it by query
    // eslint-disable-next-line no-restricted-properties
    const chevrons = screen.getAllByTestId('font-awesome-v6-icon');
    expect(chevrons.length).toBe(breadcrumbsData.length - 1); // Should be one less than breadcrumbs
  });

  it('allows clicking on all links except the last one', async () => {
    const user = userEvent.setup();
    setup();

    // First link should be clickable
    const firstLink = screen.getByText('Home');
    await user.click(firstLink);
    expect(firstLink).not.toHaveAttribute('aria-disabled');

    // Second link should be clickable
    const secondLink = screen.getByText('Products');
    await user.click(secondLink);
    expect(secondLink).not.toHaveAttribute('aria-disabled');

    // Last link should not be clickable as it should be visually and functionally disabled
    const lastLink = screen.getByText('Electronics');
    expect(lastLink).toHaveAttribute('aria-disabled', 'true');
    expect(lastLink).not.toHaveAttribute('href');
  });
});
