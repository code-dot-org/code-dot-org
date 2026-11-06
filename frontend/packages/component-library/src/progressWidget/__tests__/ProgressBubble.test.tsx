import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {ProgressBubble} from '../';

describe('ProgressBubble', () => {
  it('renders a link when given an href', () => {
    render(<ProgressBubble ariaLabel="Level 1, completed" href="/level/1" />);
    expect(
      screen.getByRole('link', {name: 'Level 1, completed'}),
    ).toHaveAttribute('href', '/level/1');
  });

  it('renders a button that calls onClick when given no href', async () => {
    const onClick = vi.fn();
    render(<ProgressBubble ariaLabel="Level 2" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', {name: 'Level 2'}));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('stays a link, without href or clicks, when disabled', async () => {
    const onClick = vi.fn();
    render(
      <ProgressBubble
        ariaLabel="Level 3, locked"
        href="/level/3"
        onClick={onClick}
        disabled
      />,
    );
    const bubble = screen.getByRole('link', {name: 'Level 3, locked'});
    expect(bubble).toHaveAttribute('aria-disabled', 'true');
    expect(bubble).not.toHaveAttribute('href');
    expect(bubble).not.toHaveAttribute('tabindex');
    await userEvent.click(bubble);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('stays a button, unclickable and unfocusable, when disabled', async () => {
    const onClick = vi.fn();
    render(
      <ProgressBubble ariaLabel="Level 4, locked" onClick={onClick} disabled />,
    );
    const bubble = screen.getByRole('button', {name: 'Level 4, locked'});
    expect(bubble).toHaveAttribute('aria-disabled', 'true');
    expect(bubble).toHaveAttribute('tabindex', '-1');
    await userEvent.click(bubble);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('stays an image when disabled with nothing to do', () => {
    render(<ProgressBubble ariaLabel="Level 5, locked" disabled />);
    expect(
      screen.getByRole('img', {name: 'Level 5, locked'}),
    ).toBeInTheDocument();
  });

  it('lets the keyboard reach a disabled bubble with a tooltip', () => {
    render(
      <ProgressBubble
        ariaLabel="Level 3, locked"
        href="/level/3"
        tooltip="Locked"
        disabled
      />,
    );
    expect(screen.getByRole('link', {name: 'Level 3, locked'})).toHaveAttribute(
      'tabindex',
      '0',
    );
  });

  it('runs onClick on a link bubble', async () => {
    const onClick = vi.fn((e: {preventDefault: () => void}) =>
      e.preventDefault(),
    );
    render(
      <ProgressBubble ariaLabel="Level 4" href="/level/4" onClick={onClick} />,
    );
    await userEvent.click(screen.getByRole('link', {name: 'Level 4'}));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the status and className', () => {
    render(
      <ProgressBubble
        ariaLabel="Level 5"
        status="keepWorking"
        className="extra"
        onClick={() => {}}
      />,
    );
    const bubble = screen.getByRole('button', {name: 'Level 5'});
    expect(bubble.className).toMatch(/keepWorking/);
    expect(bubble).toHaveClass('extra');
  });

  it('marks the active bubble as the current step and shows its number', () => {
    render(<ProgressBubble ariaLabel="Level 6" isActive levelNumber={6} />);
    const bubble = screen.getByLabelText('Level 6');
    expect(bubble).toHaveAttribute('aria-current', 'step');
    expect(bubble).toHaveTextContent('6');
  });

  it('hides the number while inactive', () => {
    render(<ProgressBubble ariaLabel="Level 7" levelNumber={7} />);
    const bubble = screen.getByLabelText('Level 7');
    expect(bubble).not.toHaveAttribute('aria-current');
    expect(bubble).not.toHaveTextContent('7');
  });

  it('adds a star to assessments', () => {
    const {container} = render(
      <ProgressBubble ariaLabel="Level 8" isAssessment />,
    );
    expect(container.querySelector('.fa-star')).toBeInTheDocument();
  });

  it('never stars a panel level', () => {
    const {container} = render(
      <ProgressBubble
        levelType="panelLevel"
        ariaLabel="Level 9"
        isAssessment
      />,
    );
    expect(container.querySelector('.fa-star')).not.toBeInTheDocument();
  });

  it('draws a flag for lesson extras', () => {
    const {container} = render(
      <ProgressBubble levelType="lessonExtras" ariaLabel="Lesson extras" />,
    );
    expect(container.querySelector('.fa-flag-checkered')).toBeInTheDocument();
  });
});
