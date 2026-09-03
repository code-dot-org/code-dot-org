// The dialog that gives an actor something it lacks.
//
// One question, because the actor was chosen on its own row before this
// opened — so what it has to get right is saying what an enhancement will
// TOUCH, and saying nothing when there is nothing to do.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {EnhanceActorDialog} from '../EnhanceActorDialog';
import {healthEnhancement} from '../health';

const PLAYER = {path: 'actors/player', name: 'Platformer Player'};

const withPlayer = () =>
  importStockActor(WORLD_SCENARIOS.empty.source, stockActorById('player')!)
    .source;

const open = (
  props: Partial<React.ComponentProps<typeof EnhanceActorDialog>> = {},
) =>
  render(
    <EnhanceActorDialog
      source={withPlayer()}
      target={PLAYER}
      onEnhance={vi.fn()}
      onCancel={vi.fn()}
      {...props}
    />,
  );

describe('EnhanceActorDialog', () => {
  it('names the actor it is about', () => {
    open();

    // The other half of the question, answered before this opened: a dialog
    // that said "Enhance an actor" would leave the learner to remember which.
    expect(
      screen.getByRole('dialog', {name: /Enhance Platformer Player/}),
    ).toBeTruthy();
  });

  it('says what an enhancement will add', () => {
    open();

    // It edits files the learner made, which no other library act does — so
    // what it will write is on the row, not behind it.
    const row = screen.getByRole('button', {name: /Health, and a bar/});
    expect(row.textContent).toContain('Has Health');
    expect(row.textContent).toContain('Health Bar');
  });

  it('offers nothing to an actor that already has it', () => {
    const source = healthEnhancement.apply(withPlayer(), PLAYER);
    open({source});

    const row = screen.getByRole('button', {name: /Health, and a bar/});
    expect(row).toBeDisabled();
    expect(row.textContent).toContain('Already has this');
  });

  it('refuses the one it makes no sense for', () => {
    open({target: {path: 'actors/healthBar', name: 'Health Bar'}});

    const row = screen.getByRole('button', {name: /Health, and a bar/});
    expect(row).toBeDisabled();
    expect(row.textContent).toContain('own health');
  });

  it('hands back what was chosen', () => {
    const onEnhance = vi.fn();
    open({onEnhance});

    fireEvent.click(screen.getByRole('button', {name: /Health, and a bar/}));
    fireEvent.click(screen.getByRole('button', {name: 'Enhance'}));

    expect(onEnhance).toHaveBeenCalledWith(healthEnhancement);
  });
});
