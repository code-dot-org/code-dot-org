import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProgressWidget, {ProgressBubble} from '../';

const bubbles = <ProgressBubble ariaLabel="Level 1" isActive levelNumber={1} />;

describe('ProgressWidget', () => {
  it('opens the lesson menu from the lesson button', async () => {
    const onLessonClick = vi.fn();
    render(
      <ProgressWidget
        lessonLabel="Lesson 3: Puzzles"
        onLessonClick={onLessonClick}
        lessonMenuExpanded={false}
      >
        {bubbles}
      </ProgressWidget>,
    );
    const button = screen.getByRole('button', {name: 'Lesson 3: Puzzles'});
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(onLessonClick).toHaveBeenCalledTimes(1);
  });

  it('names the save icon after its status', () => {
    render(
      <ProgressWidget
        lessonLabel="Lesson 3"
        saveStatus="saved"
        saveStatusLabel="Saved 6 days ago"
      >
        {bubbles}
      </ProgressWidget>,
    );
    expect(
      screen.getByRole('img', {name: 'Saved 6 days ago'}),
    ).toBeInTheDocument();
  });

  it('draws no save icon by default', () => {
    const {container} = render(
      <ProgressWidget lessonLabel="Lesson 3">{bubbles}</ProgressWidget>,
    );
    expect(container.querySelector('.fa-cloud-check')).not.toBeInTheDocument();
    expect(container.querySelector('.fa-cloud-slash')).not.toBeInTheDocument();
  });

  it('renders the bubbles and the action', () => {
    render(
      <ProgressWidget lessonLabel="Lesson 3" action={<button>Continue</button>}>
        {bubbles}
      </ProgressWidget>,
    );
    expect(screen.getByLabelText('Level 1')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Continue'})).toBeInTheDocument();
  });
});
