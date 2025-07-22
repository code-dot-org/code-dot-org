import {render, screen} from '@testing-library/react';

import Button from '../Button';

describe('Button', () => {
  it('renders with required props', () => {
    render(
      <Button
        text="Click me"
        type="primary"
        size="medium"
        href="https://example.com"
      />,
    );
    expect(screen.getByRole('link', {name: /click me/i})).toBeInTheDocument();
  });

  it('applies the correct variant for emphasized type', () => {
    render(
      <Button
        text="Emphasized"
        type="emphasized"
        size="large"
        href="https://example.com"
      />,
    );
    const button = screen.getByRole('link', {name: /emphasized/i});
    expect(button.className).toMatch(/button--color-emphasized/);
  });

  it('applies the correct variant for primary type', () => {
    render(
      <Button
        text="Primary"
        type="primary"
        size="small"
        href="https://example.com"
      />,
    );
    const button = screen.getByRole('link', {name: /primary/i});
    expect(button.className).toMatch(/button--color-primary/);
  });

  it('applies the correct variant for secondary type', () => {
    render(
      <Button
        text="Secondary"
        type="secondary"
        size="small"
        href="https://example.com"
      />,
    );
    const button = screen.getByRole('link', {name: /secondary/i});
    expect(button.className).toMatch(/button--color-secondary/);
  });

  it('renders with external link attributes when isLinkExternal is true', () => {
    render(
      <Button
        text="External"
        type="primary"
        size="medium"
        href="https://external.com"
        isLinkExternal
      />,
    );
    const button = screen.getByRole('link', {name: /external/i});
    expect(button).toHaveAttribute('target', '_blank');
    expect(button).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render target or rel when isLinkExternal is false', () => {
    render(
      <Button text="Internal" type="primary" size="medium" href="/internal" />,
    );
    const button = screen.getByRole('link', {name: /internal/i});
    expect(button).not.toHaveAttribute('target');
    expect(button).not.toHaveAttribute('rel');
  });

  it('renders with aria-label when provided', () => {
    render(
      <Button
        text="Aria"
        type="primary"
        size="medium"
        href="/aria"
        ariaLabel="Aria Label"
      />,
    );
    const button = screen.getByRole('link', {name: /aria label/i});
    expect(button).toHaveAttribute('aria-label', 'Aria Label');
  });

  it('does not render anything if href is not provided', () => {
    const {container} = render(
      <Button text="No Href" type="primary" size="medium" />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
