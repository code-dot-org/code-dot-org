// The dialog that gives an actor something it lacks.
//
// The list is the Actor Creator's checklist and has its own tests; what this
// frame has to get right is the words around it, that nothing is applied
// until the press, and that the press hands back the whole answer at once.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {EnhanceActorDialog} from '../EnhanceActorDialog';
import {healthEnhancement} from '../health';

const PLAYER = {
  kind: 'actor' as const,
  path: 'actors/player',
  name: 'Platformer Player',
};

type Source = typeof WORLD_SCENARIOS.empty.source;

const withPlayer = (): Source =>
  importStockActor(WORLD_SCENARIOS.empty.source, stockActorById('player')!)
    .source;

const at = (source: Source, path: string) =>
  source.files[fileIdAt(source, path) ?? '']?.contents ?? '';

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

/**
 * Unfold the group a row is under, then find the row.
 *
 * The shelf is long enough to fold, and a shut group hides its rows from
 * anything reading the page — which is what a learner meets too.
 */
const row = (group: RegExp, name: RegExp) => {
  const heading = screen.getByRole('button', {name: group});
  if (heading.getAttribute('aria-expanded') === 'false') {
    fireEvent.click(heading);
  }
  return screen.getByRole('checkbox', {name});
};

const HEALTH = [/Health, scoring and speech/, /Health, and a bar/] as const;
const ENEMY = [/Being an enemy/, /Walks a beat/] as const;

describe('EnhanceActorDialog', () => {
  it('names the actor it is about', () => {
    open();

    // The other half of the question, answered before this opened: a dialog
    // that said "Enhance an actor" would leave the learner to remember which.
    expect(
      screen.getByRole('dialog', {name: /Enhance Platformer Player/}),
    ).toBeTruthy();
  });

  it('says what an enhancement will add, for the row asked about', () => {
    open();
    row(...HEALTH);

    // It edits files the learner made, which no other library act does — so
    // what it will write is there to read, behind the row's own chevron.
    fireEvent.click(
      screen.getByRole('button', {name: /What Health, and a bar .* does/}),
    );
    expect(screen.getByText(/Also adds:/).textContent).toContain('Has Health');
    expect(screen.getByText(/Also adds:/).textContent).toContain('Health Bar');
  });

  it('shows what the actor already has as ticked and locked', () => {
    const source = healthEnhancement.apply(withPlayer(), PLAYER);
    open({source});

    const tick = row(...HEALTH);
    expect(tick).toBeDisabled();
    expect(tick).toBeChecked();
    // Said beside the row — the Player's own controls say it too, further up.
    expect(tick.closest('li')?.textContent).toContain('already');
  });

  it('leaves out the one it makes no sense for', () => {
    open({
      target: {kind: 'actor', path: 'actors/healthBar', name: 'Health Bar'},
    });

    // A Health Bar cannot be given a health bar, and the list is about what
    // this actor CAN do — so the row is not there, rather than there and
    // locked with a reason about some other actor.
    row(/Health, scoring and speech/, /Collects things/);
    expect(screen.queryByRole('checkbox', {name: /Health, and a bar/})).toBe(
      null,
    );
  });

  it('applies nothing until the press, then everything ticked at once', () => {
    const onEnhance = vi.fn();
    open({onEnhance});

    const enhance = () => screen.getByRole('button', {name: 'Enhance'});
    expect(enhance()).toBeDisabled();

    fireEvent.click(row(...HEALTH));
    fireEvent.click(row(...ENEMY));
    expect(onEnhance).not.toHaveBeenCalled();

    fireEvent.click(enhance());
    expect(onEnhance).toHaveBeenCalledTimes(1);
    const enhanced = onEnhance.mock.calls[0][0] as Source;
    const player = at(enhanced, 'actors/player.actor');
    expect(player).toContain('Health#HasHealthTrait');
    expect(player).toContain('Patrol#PatrolsAcrossTrait');
    // …and the rules they need came with them.
    expect(at(enhanced, 'rules/patrol.rule')).toBeTruthy();
  });

  it('lets a tick be taken back', () => {
    const onEnhance = vi.fn();
    open({onEnhance});

    fireEvent.click(row(...HEALTH));
    fireEvent.click(row(...ENEMY));
    fireEvent.click(row(...HEALTH));
    fireEvent.click(screen.getByRole('button', {name: 'Enhance'}));

    const player = at(
      onEnhance.mock.calls[0][0] as Source,
      'actors/player.actor',
    );
    expect(player).not.toContain('Health#HasHealthTrait');
    expect(player).toContain('Patrol#PatrolsAcrossTrait');
  });

  it('offers the other end of a pair once its partner is ticked', () => {
    const onEnhance = vi.fn();
    const source = importStockActor(
      withPlayer(),
      stockActorById('coin')!,
    ).source;
    open({source, onEnhance});

    // Nothing carries yet, so nothing is offered a ride.
    const carries = row(/Gravity and ground/, /Carries what stands on it/);
    const rides = () =>
      screen.queryByRole('checkbox', {name: /Rides moving platforms/});
    expect(rides()).toBe(null);

    // Ticking the platform's end is what puts a carrier in the project — in
    // the draft, which is what the gate reads — so the passenger's end
    // appears without closing and reopening.
    fireEvent.click(carries);
    expect(rides()).not.toBe(null);
    fireEvent.click(rides()!);

    // …and unticking the carrier takes the ride back with it, rather than
    // keeping a tick off screen and applying it unseen at the press.
    fireEvent.click(carries);
    expect(rides()).toBe(null);
    fireEvent.click(row(...ENEMY));
    fireEvent.click(screen.getByRole('button', {name: 'Enhance'}));

    const player = at(
      onEnhance.mock.calls[0][0] as Source,
      'actors/player.actor',
    );
    expect(player).not.toContain('Carrying#CarriesTrait');
    expect(player).not.toContain('Carrying#RidesTrait');
    expect(player).toContain('Patrol#PatrolsAcrossTrait');
  });

  it('answers a row’s question on the tick, so the press is not held up', () => {
    const onEnhance = vi.fn();
    const source = importStockActor(
      withPlayer(),
      stockActorById('coin')!,
    ).source;
    open({source, onEnhance});

    // Chasing asks whom, and the first actor on offer is the answer until it
    // is changed — so Enhance is live the moment the row is ticked.
    fireEvent.click(row(/Being an enemy/, /Chases somebody/));
    const enhance = screen.getByRole('button', {name: 'Enhance'});
    expect(enhance).toBeEnabled();

    fireEvent.click(enhance);
    expect(
      at(onEnhance.mock.calls[0][0] as Source, 'actors/player.actor'),
    ).toContain('Steering#ChasesTrait');
  });
});
