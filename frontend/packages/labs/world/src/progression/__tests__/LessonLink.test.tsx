// The link back to a lesson, wherever a thing it granted is offered.

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import {LessonLink} from '../LessonLink';
import {ProgressionProvider} from '../ProgressionProvider';

const inLab = (node: React.ReactNode) =>
  render(
    <ProgressionProvider initiallyCompleted={[]}>{node}</ProgressionProvider>,
  );

describe('a lesson link', () => {
  it('names the lesson rather than saying "learn more"', () => {
    inLab(<LessonLink unlock={{kind: 'rule', id: 'gravity'}} />);
    expect(
      screen.getByRole('button', {name: /How this works: Down/}),
    ).toBeInTheDocument();
  });

  it('opens the map on that lesson', async () => {
    inLab(<LessonLink unlock={{kind: 'rule', id: 'gravity'}} />);
    await userEvent.click(screen.getByRole('button', {name: /How this works/}));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Down'})).toBeInTheDocument();
  });

  // Two modals at once is what the accessibility checklist says to avoid rather
  // than manage, so the dialog this sits in closes itself on the way.
  it('lets the dialog it sits in close first', async () => {
    const onNavigate = vi.fn();
    inLab(
      <LessonLink
        unlock={{kind: 'rule', id: 'gravity'}}
        onNavigate={onNavigate}
      />,
    );
    await userEvent.click(screen.getByRole('button', {name: /How this works/}));
    expect(onNavigate).toHaveBeenCalled();
  });

  it('draws nothing for something no lesson granted', () => {
    // Every stock RULE has a lesson (the layout test says so), so the example
    // has to be something else — a block nothing unlocks.
    const {container} = inLab(
      <LessonLink unlock={{kind: 'block', type: 'world_log'}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  // The import dialogs have tests of their own that render them alone. A link
  // that threw there would have made the dialogs untestable in isolation.
  it('draws nothing outside the lab', () => {
    const {container} = render(
      <LessonLink unlock={{kind: 'rule', id: 'gravity'}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
