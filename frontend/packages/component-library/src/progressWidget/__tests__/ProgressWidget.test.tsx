import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProgressWidget, {ProgressBubble, ProgressWidgetProps} from '../';

const bubbles = <ProgressBubble ariaLabel="Level 1" isActive levelNumber={1} />;

function renderWidget(props: Partial<ProgressWidgetProps> = {}) {
  return render(
    <ProgressWidget
      lessonLabel="Lesson 3: Puzzles"
      onLessonClick={() => {}}
      bubblesLabel="Lesson progress"
      {...(props as object)}
    >
      {bubbles}
    </ProgressWidget>,
  );
}

describe('ProgressWidget', () => {
  it('opens the lesson menu from the lesson button', async () => {
    const onLessonClick = vi.fn();
    renderWidget({onLessonClick, lessonMenuExpanded: false});
    const button = screen.getByRole('button', {name: 'Lesson 3: Puzzles'});
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(onLessonClick).toHaveBeenCalledTimes(1);
  });

  it('reports the menu as open', () => {
    renderWidget({lessonMenuExpanded: true});
    expect(
      screen.getByRole('button', {name: 'Lesson 3: Puzzles'}),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('names the bubble row', () => {
    renderWidget();
    expect(
      screen.getByRole('group', {name: 'Lesson progress'}),
    ).toContainElement(screen.getByLabelText('Level 1'));
  });

  it('names the save icon after its status', () => {
    renderWidget({saveStatus: 'saved', saveStatusLabel: 'Saved 6 days ago'});
    expect(
      screen.getByRole('img', {name: 'Saved 6 days ago'}),
    ).toBeInTheDocument();
  });

  it('spins the icon while saving', () => {
    const {container} = renderWidget({
      saveStatus: 'saving',
      saveStatusLabel: 'Saving...',
    });
    expect(container.querySelector('.fa-spinner.fa-spin')).toBeInTheDocument();
  });

  it.each([
    ['failed', 'cloud-exclamation'],
    ['offline', 'cloud-slash'],
  ] as const)('draws the %s icon', (saveStatus, icon) => {
    const {container} = renderWidget({saveStatus, saveStatusLabel: 'x'});
    expect(container.querySelector(`.fa-${icon}`)).toBeInTheDocument();
  });

  it('announces a failed save but not a routine one', () => {
    const {rerender} = renderWidget({
      saveStatus: 'saved',
      saveStatusLabel: 'Saved just now',
    });
    expect(screen.getByRole('status')).toHaveTextContent('');
    rerender(
      <ProgressWidget
        lessonLabel="Lesson 3: Puzzles"
        onLessonClick={() => {}}
        bubblesLabel="Lesson progress"
        saveStatus="failed"
        saveStatusLabel="Not saved"
      >
        {bubbles}
      </ProgressWidget>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Not saved');
  });

  it('draws no save icon by default', () => {
    const {container} = renderWidget();
    expect(
      container.querySelector('[class*="fa-cloud"], .fa-spinner'),
    ).not.toBeInTheDocument();
  });

  it('renders the action', () => {
    renderWidget({action: <button>Continue</button>});
    expect(screen.getByRole('button', {name: 'Continue'})).toBeInTheDocument();
  });
});
