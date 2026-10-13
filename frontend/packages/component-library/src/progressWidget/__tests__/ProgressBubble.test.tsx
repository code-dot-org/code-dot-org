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

  it('is neither link nor button when disabled', () => {
    render(<ProgressBubble ariaLabel="Level 3" href="/level/3" disabled />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Level 3')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
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
