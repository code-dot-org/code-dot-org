// The abilities step's list, and the one thing the wizard's own tests cannot
// reach: what it does when there are more rows than fit.
//
// The fold exists for a list that has grown, and the shelf holds ten. Rather
// than wait for it to hold thirty to find out whether the rule works, the
// groups are stood in for — `groupsFor` is the only thing this reads the shelf
// through.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {EnhancementChecklist} from '../EnhancementChecklist';
import type {Enhancement, EnhanceTarget} from '../enhancements';

const TARGET: EnhanceTarget = {
  kind: 'actor',
  path: 'actors/chaser',
  name: 'Chaser',
};

const SOURCE = {folders: {}, files: {}, openFiles: []} as never;

/** An ability that does nothing, which is all this list needs of one. */
const ability = (id: string, has = false): Enhancement => ({
  id,
  subject: 'actor',
  name: id,
  description: `What ${id} does.`,
  brings: [],
  applied: () => has,
  apply: (source: MultiFileSource) => source,
});

/** `n` groups of three, the last of which the actor already has one of. */
const shelf = (groups: number) =>
  Array.from({length: groups}, (_, at) => ({
    name: `Group ${at + 1}`,
    members: [
      ability(`a${at}`, at === groups - 1),
      ability(`b${at}`),
      ability(`c${at}`),
    ],
  }));

const groupsFor = vi.fn();
vi.mock('../enhancements', async importActual => ({
  ...(await importActual<object>()),
  groupsFor: (target: EnhanceTarget) =>
    (groupsFor as unknown as (t: EnhanceTarget) => unknown)(target),
}));

const show = () =>
  render(
    <EnhancementChecklist
      source={SOURCE}
      target={TARGET}
      picked={[]}
      onPick={vi.fn()}
      answers={{}}
      onAnswer={vi.fn()}
    />,
  );

const openness = (name: string) =>
  screen
    .getByRole('button', {name: new RegExp(name)})
    .getAttribute('aria-expanded');

beforeEach(() => vi.clearAllMocks());

describe('folding the groups', () => {
  it('leaves a short list open, because room is not what is short', () => {
    // Four groups of three is twelve rows: a list you can see all of is one
    // you scan rather than navigate.
    groupsFor.mockReturnValue(shelf(4));
    show();

    for (let at = 1; at <= 4; at++) {
      expect(openness(`Group ${at}`)).toBe('true');
    }
  });

  it('folds a long one, so the headings are what it is read by', () => {
    // Five groups of three is fifteen, which is five walls unfolded.
    groupsFor.mockReturnValue(shelf(5));
    show();

    for (let at = 1; at <= 4; at++) {
      expect(openness(`Group ${at}`)).toBe('false');
    }
  });

  it('keeps open whatever the actor already has, however long the list', () => {
    // The one thing on this step which is a fact rather than an offer. Hiding
    // it behind a press would hide the answer to the question the step asks.
    groupsFor.mockReturnValue(shelf(5));
    show();

    expect(openness('Group 5')).toBe('true');
  });

  it('says how many are under a heading, shut or open', () => {
    groupsFor.mockReturnValue(shelf(5));
    show();

    expect(screen.getByRole('button', {name: /Group 1 3/})).toBeTruthy();
  });

  it('opens one that was folded', () => {
    groupsFor.mockReturnValue(shelf(5));
    show();
    expect(screen.queryByRole('checkbox', {name: 'a0'})).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: /Group 1/}));

    expect(screen.getByRole('checkbox', {name: 'a0'})).toBeTruthy();
  });
});
