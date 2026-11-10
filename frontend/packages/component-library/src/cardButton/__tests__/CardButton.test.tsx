import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createRef} from 'react';
import {vi} from 'vitest';

import CardButton from '../CardButton';

describe('Design System - CardButton', () => {
  it('names the button by its title and describes it by its description', () => {
    render(
      <CardButton
        title="Practice"
        description="Five short puzzles"
        startContent={<img alt="Jane" src="" />}
      />,
    );
    const button = screen.getByRole('button', {name: 'Practice'});
    expect(button).toHaveAccessibleDescription('Five short puzzles');
  });

  it('defers to a consumer-supplied name', () => {
    render(
      <CardButton
        title="Practice"
        description="Five short puzzles"
        aria-label="Start practice"
      />,
    );
    const button = screen.getByRole('button', {name: 'Start practice'});
    expect(button).not.toHaveAttribute('aria-labelledby');
    expect(button).not.toHaveAttribute('aria-describedby');
  });

  it('omits an empty description', () => {
    render(<CardButton title="Practice" description="" />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/^Practice$/);
    expect(button).not.toHaveAttribute('aria-describedby');
  });

  it('renders a zero description and a zero startContent', () => {
    render(<CardButton title="Score" description={0} startContent={0} />);
    expect(screen.getByRole('button')).toHaveTextContent(/^0Score0$/);
  });

  it('renders start and end icons as solid by default', () => {
    render(
      <CardButton
        title="Next"
        startIcon={{iconName: 'fire'}}
        endIcon={{iconName: 'chevron-right'}}
      />,
    );
    const icons = screen.getAllByTestId('font-awesome-v6-icon');
    expect(icons).toHaveLength(2);
    expect(icons[0].className).toContain('fa-fire');
    expect(icons[0].className).toContain('fa-solid');
    expect(icons[1].className).toContain('fa-chevron-right');
  });

  it('lets the icon style be overridden', () => {
    render(
      <CardButton
        title="Next"
        startIcon={{iconName: 'fire', iconStyle: 'regular'}}
      />,
    );
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon.className).toContain('fa-regular');
    expect(icon.className).not.toContain('fa-solid');
  });

  it('leaves fa-solid off when only iconFamily is set', () => {
    render(
      <CardButton
        title="Code"
        startIcon={{iconName: 'github', iconFamily: 'brands'}}
      />,
    );
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon.className).toContain('fa-brands');
    expect(icon.className).not.toContain('fa-solid');
  });

  it('hides icons from assistive technology', () => {
    render(
      <CardButton
        title="Next"
        startIcon={{iconName: 'fire'}}
        endIcon={{iconName: 'chevron-right'}}
      />,
    );
    for (const icon of screen.getAllByTestId('font-awesome-v6-icon')) {
      expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
    }
    expect(screen.getByRole('button', {name: 'Next'})).toBeInTheDocument();
  });

  it('renders startContent in place of startIcon', () => {
    render(
      // @ts-expect-error startIcon and startContent are exclusive.
      <CardButton
        title="Section"
        startIcon={{iconName: 'fire'}}
        startContent={<span>avatar</span>}
      />,
    );
    expect(screen.getByText('avatar')).toBeInTheDocument();
    expect(
      screen.queryByTestId('font-awesome-v6-icon'),
    ).not.toBeInTheDocument();
  });

  it('drops the end icon on vertical cards', () => {
    render(
      // @ts-expect-error endIcon is horizontal only.
      <CardButton
        layout="vertical"
        title="Tile"
        startIcon={{iconName: 'fire'}}
        endIcon={{iconName: 'chevron-right'}}
      />,
    );
    const icons = screen.getAllByTestId('font-awesome-v6-icon');
    expect(icons).toHaveLength(1);
    expect(icons[0].className).toContain('fa-fire');
  });

  it('exposes aria-pressed only when selected is a boolean', () => {
    const {rerender} = render(<CardButton title="Audio" />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');

    rerender(<CardButton title="Audio" selected={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(<CardButton title="Audio" selected />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks a selected link aria-current instead of aria-pressed', () => {
    const {rerender} = render(
      <CardButton title="Lesson 2" href="/lessons/2" selected />,
    );
    const link = screen.getByRole('link', {name: 'Lesson 2'});
    expect(link).toHaveAttribute('href', '/lessons/2');
    expect(link).toHaveAttribute('aria-current', 'true');
    expect(link).not.toHaveAttribute('aria-pressed');

    rerender(
      <CardButton title="Lesson 2" href="/lessons/2" selected={false} />,
    );
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('lets a consumer override the default state attribute', () => {
    const {rerender} = render(
      <CardButton title="Audio" selected aria-pressed="mixed" />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'mixed');

    rerender(
      <CardButton
        title="Lesson 2"
        href="/lessons/2"
        selected
        aria-current="page"
      />,
    );
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
  });

  it('renders a disabled link as a disabled button', async () => {
    const user = userEvent.setup({pointerEventsCheck: 0});
    const onClick = vi.fn();
    render(
      <CardButton
        title="Lesson 2"
        href="/lessons/2"
        target="_blank"
        rel="noopener"
        onClick={onClick}
        disabled
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const button = screen.getByRole('button', {name: 'Lesson 2'});
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('href');
    expect(button).not.toHaveAttribute('target');
    expect(button).not.toHaveAttribute('rel');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('leaves selection semantics to an explicit role', () => {
    render(<CardButton title="Audio" role="radio" aria-checked selected />);
    const radio = screen.getByRole('radio', {name: 'Audio'});
    expect(radio).toHaveAttribute('aria-checked', 'true');
    expect(radio).not.toHaveAttribute('aria-pressed');
  });

  it('calls onClick from pointer and keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CardButton title="Go" onClick={onClick} />);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not fire onClick or take focus when disabled', async () => {
    // MUI sets pointer-events: none on a disabled ButtonBase; click anyway.
    const user = userEvent.setup({pointerEventsCheck: 0});
    const onClick = vi.fn();
    render(<CardButton title="Go" onClick={onClick} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await user.click(button);
    await user.tab();
    expect(onClick).not.toHaveBeenCalled();
    expect(button).not.toHaveFocus();
  });

  it('forwards the ref and merges className', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<CardButton ref={ref} title="Go" className="custom" />);
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(ref.current).toHaveClass('custom');
  });

  it('passes startIconColor through without dropping style', () => {
    render(
      <CardButton
        title="Go"
        startIcon={{iconName: 'fire'}}
        startIconColor="var(--text-success-primary)"
        style={{marginTop: 4}}
      />,
    );
    const button = screen.getByRole('button');
    expect(button.style.getPropertyValue('--card-button-start-custom')).toBe(
      'var(--text-success-primary)',
    );
    expect(button.style.marginTop).toBe('4px');
  });

  it('ignores startIconColor when startContent is set', () => {
    render(
      // @ts-expect-error startIconColor applies to startIcon only.
      <CardButton
        title="Go"
        startContent={<span>avatar</span>}
        startIconColor="var(--text-success-primary)"
      />,
    );
    expect(
      screen
        .getByRole('button')
        .style.getPropertyValue('--card-button-start-custom'),
    ).toBe('');
  });

  it('applies layout, size and fullWidth classes', () => {
    const {rerender} = render(<CardButton title="Go" />);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/cardButton-horizontal/);
    expect(button.className).toMatch(/cardButton-medium/);
    expect(button.className).not.toMatch(/cardButton-fullWidth/);

    rerender(
      <CardButton title="Go" layout="vertical" size="small" fullWidth />,
    );
    expect(button.className).toMatch(/cardButton-vertical/);
    expect(button.className).toMatch(/cardButton-small/);
    expect(button.className).toMatch(/cardButton-fullWidth/);
  });
});
