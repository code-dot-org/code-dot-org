// The link back to a lesson, wherever a thing it granted is offered.

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import {RootStateProvider} from '@code-dot-org/core/redux';

import {LessonLink} from '../LessonLink';
import {ProgressionProvider} from '../ProgressionProvider';

// The drawn block under an unlock injects a real Blockly workspace, which
// needs a real browser — jsdom cannot parse the stylesheet Blockly writes.
// Stubbed here for the reason `__tests__/App` stubs the block editor; the
// preview is exercised where it can be, in `BlockPreview.test`.
vi.mock('../BlockPreview', () => ({
  BlockPreview: () => null,
  blockForRule: () => undefined,
}));

/**
 * The providers the dialog needs around it.
 *
 * The redux store because the dialog asks which lesson the lab has loaded
 * (`state.lab.channel`), which is what decides whether "Check my work" is
 * offered — a check measures the open project, so it may only be offered for
 * the tile that project belongs to.
 */
const inLab = (node: React.ReactNode) =>
  render(
    <RootStateProvider>
      <ProgressionProvider initiallyCompleted={[]}>{node}</ProgressionProvider>
    </RootStateProvider>,
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
      <RootStateProvider>
        <LessonLink unlock={{kind: 'rule', id: 'gravity'}} />
      </RootStateProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
