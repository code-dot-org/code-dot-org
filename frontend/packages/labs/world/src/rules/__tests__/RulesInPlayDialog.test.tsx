// The rules a project holds, and what can be done to each from the panel
// (specs/SHELL_FINISH_PLAN.md, step 4): open, rename and clone beside
// remove, and a new one from nothing.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {heldRules} from '../removeRule';
import {RulesInPlayDialog} from '../RulesInPlayDialog';

const SOURCE = WORLD_SCENARIOS.simple.source;

const mount = (editable: boolean) => {
  const handlers = {
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onOpen: vi.fn(),
    onRename: vi.fn(),
    onClone: vi.fn(),
    onNew: vi.fn(),
    onClose: vi.fn(),
  };
  render(
    <RulesInPlayDialog source={SOURCE} editable={editable} {...handlers} />,
  );
  return handlers;
};

describe('the Rules in Play panel', () => {
  it('opens, renames and clones a rule, and writes a new one', () => {
    const gravity = heldRules(SOURCE).find(
      rule => rule.path === 'rules/gravity',
    )!;
    const named = gravity.ability ?? gravity.name;
    const handlers = mount(true);

    fireEvent.click(screen.getByRole('button', {name: `Open ${named}`}));
    expect(handlers.onOpen).toHaveBeenCalledWith(gravity);

    fireEvent.click(screen.getByRole('button', {name: `More for ${named}`}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Rename…'}));
    expect(handlers.onRename).toHaveBeenCalledWith(gravity);

    fireEvent.click(screen.getByRole('button', {name: `More for ${named}`}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Clone…'}));
    expect(handlers.onClone).toHaveBeenCalledWith(gravity);

    fireEvent.click(screen.getByRole('button', {name: 'Write a new rule…'}));
    expect(handlers.onNew).toHaveBeenCalled();
  });

  it('opens a rule in a project handed out to read, and changes nothing', () => {
    const handlers = mount(false);
    expect(
      screen.queryByRole('button', {name: 'Write a new rule…'}),
    ).toBeNull();
    expect(screen.queryByRole('button', {name: /^More for/})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Remove'})).toBeNull();
    fireEvent.click(screen.getAllByRole('button', {name: /^Open /})[0]);
    expect(handlers.onOpen).toHaveBeenCalled();
  });
});
