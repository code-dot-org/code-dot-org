import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Link from '@cdo/apps/componentLibrary/link';

describe('Design System - Link', () => {
  it('Link - renders with correct text when passed as children prop', () => {
    render(<Link href="https://studio.code.org/home">Home</Link>);

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toBeDefined();
    expect(link.href).toBe('https://studio.code.org/home');
  });

  it('Link - renders with correct text when passed as text prop', () => {
    render(<Link href="https://studio.code.org/home" text="Home" />);

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toBeDefined();
    expect(link.href).toBe('https://studio.code.org/home');
  });

  it('Link - openInNewTab adds target attribute', () => {
    render(
      <Link href="https://studio.code.org/home" openInNewTab>
        Home
      </Link>
    );

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toBeDefined();
    expect(link.target).toBe('_blank');
    expect(link.href).toBe('https://studio.code.org/home');
  });

  it('Link - external adds rel attribute', () => {
    render(
      <Link href="https://studio.code.org/home" external>
        Home
      </Link>
    );

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toBeDefined();
    expect(link.rel).toBe('noopener noreferrer');
    expect(link.href).toBe('https://studio.code.org/home');
  });

  it('Link - onClick is correctly called when clicked', async () => {
    const user = userEvent.setup();
    const spyOnClick = jest.fn();

    const linkToRender = <Link onClick={spyOnClick}>Home</Link>;

    const {rerender} = render(linkToRender);

    await user.click(screen.getByText('Home'));

    rerender(linkToRender);

    expect(spyOnClick).toHaveBeenCalledTimes(1);
  });

  it('Link - doesn`t call onClick when disabled', async () => {
    const user = userEvent.setup();
    const spyOnClick = jest.fn();
    const linkToRender = (
      <Link disabled onClick={spyOnClick}>
        Home
      </Link>
    );
    const {rerender} = render(linkToRender);

    rerender(linkToRender);

    await user.click(screen.getByText('Home'));

    expect(spyOnClick).not.toHaveBeenCalled();
  });
});
