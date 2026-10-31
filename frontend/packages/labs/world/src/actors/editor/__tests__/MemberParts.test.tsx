// The parts of a design, as chips (specs/ACTOR_BLOCKS_PLAN.md, step 3).
//
// Dragging with a pointer is the browser's to check; everything else here is
// the keyboard's way to the same arrangement, and what it says and where it
// leaves focus.

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {useRef, useState} from 'react';
import {describe, expect, it} from 'vitest';

import type {ActorMemberPart} from '../../actorData';
import {designProblems} from '../memberEdits';
import {
  MemberParts,
  MoveHelp,
  useAnnouncer,
  type Arranged,
} from '../MemberParts';

const word = (text: string): ActorMemberPart => ({kind: 'label', text});
const row: ActorMemberPart = {kind: 'row'};
const value = (name: string): ActorMemberPart => ({
  kind: 'param',
  type: 'number',
  var: '',
  name,
});

/** The parts held as the page holds them, and what was said. */
const Harness = ({
  start,
  isReadOnly = false,
}: {
  start: ActorMemberPart[];
  isReadOnly?: boolean;
}) => {
  const keys = useRef(0);
  const mintKey = () => `k${(keys.current += 1)}`;
  const [arranged, setArranged] = useState<Arranged[]>(() =>
    start.map(part => ({key: mintKey(), part})),
  );
  const {said, say} = useAnnouncer();
  const parts = arranged.map(one => one.part);
  return (
    <>
      <MoveHelp />
      <MemberParts
        arranged={arranged}
        mintKey={mintKey}
        onArrange={(next, announcement) => {
          setArranged(next);
          say(announcement);
        }}
        problems={designProblems(parts, {id: 'm', kind: 'block', parts}, [])}
        name="heal"
        typeOptions={[['number', 'number']]}
        isReadOnly={isReadOnly}
      />
      <div role="status" id="said">
        {said}
      </div>
    </>
  );
};

const grips = () =>
  within(screen.getByRole('list', {name: 'Parts of heal'}))
    .getAllByRole('button')
    .map(grip => grip.getAttribute('aria-label'));

// By id: dnd-kit keeps a live region of its own beside this one.
const said = () => document.getElementById('said')?.textContent;

describe('the palette', () => {
  it('is a toolbar with one stop, walked by the arrow keys', () => {
    render(<Harness start={[word('heal')]} />);
    const toolbar = screen.getByRole('toolbar', {name: 'Parts to add'});
    const buttons = within(toolbar).getAllByRole('button');

    expect(buttons.filter(one => one.tabIndex === 0)).toHaveLength(1);
    buttons[0].focus();
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(buttons[1]);
    fireEvent.keyDown(toolbar, {key: 'End'});
    expect(document.activeElement).toHaveAccessibleName('Add a line break');
  });

  it('names each value with its article', () => {
    render(<Harness start={[word('heal')]} />);
    const toolbar = screen.getByRole('toolbar', {name: 'Parts to add'});
    expect(
      within(toolbar).getByRole('button', {name: 'Add an actor value'}),
    ).toBeInTheDocument();
    expect(
      within(toolbar).getByRole('button', {name: 'Add a number value'}),
    ).toBeInTheDocument();
  });

  it('adds after the chip with focus, focuses it and says where', async () => {
    render(<Harness start={[word('heal'), word('now')]} />);
    screen.getByRole('textbox', {name: 'Word, part 1'}).focus();

    fireEvent.click(screen.getByRole('button', {name: 'Add a number value'}));

    expect(grips()).toEqual([
      'heal, word, part 1 of 3, line 1',
      'amount, number value, part 2 of 3, line 1',
      'now, word, part 3 of 3, line 1',
    ]);
    expect(document.activeElement).toHaveAccessibleName(
      'Name of number value, part 2',
    );
    await waitFor(() =>
      expect(said()).toBe('Number added, part 2 of 3, line 1.'),
    );
  });
});

describe('a chip moved from the keys', () => {
  it('is picked up, moved by place and dropped, saying each', async () => {
    render(<Harness start={[word('heal'), value('amount'), word('now')]} />);
    const grip = screen.getByRole('button', {name: /^heal, word/});

    fireEvent.keyDown(grip, {key: ' '});
    expect(grip).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(said()).toMatch(/^heal picked up, part 1 of 3/));

    fireEvent.keyDown(grip, {key: 'ArrowRight'});
    await waitFor(() =>
      expect(said()).toBe('heal moved to part 2 of 3, line 1.'),
    );
    fireEvent.keyDown(document.activeElement!, {key: ' '});

    expect(grips()[1]).toBe('heal, word, part 2 of 3, line 1');
    expect(document.activeElement).toHaveAccessibleName(
      'heal, word, part 2 of 3, line 1',
    );
  });

  it('goes back where it was on Escape', async () => {
    render(<Harness start={[word('heal'), word('now')]} />);
    const grip = screen.getByRole('button', {name: /^heal, word/});

    fireEvent.keyDown(grip, {key: ' '});
    fireEvent.keyDown(grip, {key: 'ArrowRight'});
    fireEvent.keyDown(document.activeElement!, {key: 'Escape'});

    expect(grips()[0]).toBe('heal, word, part 1 of 2, line 1');
    await waitFor(() => expect(said()).toMatch(/^heal put back/));
  });

  it('is not moved by an arrow until it is picked up', () => {
    render(<Harness start={[word('heal'), word('now')]} />);
    fireEvent.keyDown(screen.getByRole('button', {name: /^heal, word/}), {
      key: 'ArrowRight',
    });
    expect(grips()[0]).toMatch(/^heal/);
  });
});

describe('a chip removed', () => {
  it('passes focus to the chip that took its place, and says so', async () => {
    render(<Harness start={[word('heal'), value('amount'), word('now')]} />);

    fireEvent.keyDown(screen.getByRole('button', {name: /^amount/}), {
      key: 'Delete',
    });

    expect(grips()).toHaveLength(2);
    expect(document.activeElement).toHaveAccessibleName(
      'now, word, part 2 of 2, line 1',
    );
    await waitFor(() => expect(said()).toBe('amount removed.'));
  });
});

describe('a line break', () => {
  it('names its line, and says so when it ends nothing', () => {
    render(<Harness start={[word('heal'), row, word('now'), row]} />);
    expect(grips()).toEqual([
      'heal, word, part 1 of 4, line 1',
      'Line break, part 2 of 4, line 1',
      'now, word, part 3 of 4, line 2',
      'Line break, part 4 of 4, line 2, does nothing here',
    ]);
  });

  it('ends its line only where it ends something', () => {
    render(<Harness start={[row, word('heal'), row, row, word('now'), row]} />);
    const surface = screen.getByRole('list', {name: 'Parts of heal'});
    expect(surface.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(1);
  });
});

describe('a problem', () => {
  it('is said on the field at fault', () => {
    render(
      <Harness start={[word('heal'), value('amount'), value('amount')]} />,
    );
    const field = screen.getByRole('textbox', {
      name: 'Name of number value, part 3',
    });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(
      'Two values are called amount; rename one.',
    );
  });

  it('of the whole design is an alert', () => {
    render(<Harness start={[value('amount')]} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/needs a word/);
  });
});

describe('when read-only', () => {
  it('offers nothing to add, move or type', () => {
    render(<Harness start={[word('heal')]} isReadOnly />);
    for (const button of within(
      screen.getByRole('toolbar', {name: 'Parts to add'}),
    ).getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
    expect(screen.getByRole('textbox', {name: 'Word, part 1'})).toHaveAttribute(
      'readonly',
    );
  });
});
