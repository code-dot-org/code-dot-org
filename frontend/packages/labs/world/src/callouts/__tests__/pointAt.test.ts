// "Show me": reveal, ring, focus, say (specs/SHOW_ME_PLAN.md).

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {
  clearRing,
  lastAnnounced,
  MARK_ATTRIBUTE,
  onAnnounce,
  pointAt,
  RING_ATTRIBUTE,
} from '../pointAt';
import {setRevealer} from '../reveal';

const button = (mark: string): HTMLButtonElement => {
  const made = document.createElement('button');
  made.setAttribute(MARK_ATTRIBUTE, mark);
  document.body.appendChild(made);
  return made;
};

describe('pointAt', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    clearRing();
    setRevealer('file', null);
    setRevealer('view', null);
    setRevealer('placement', null);
    setRevealer('toolbox', null);
  });

  it('rings the target, focuses it, and says where it is', async () => {
    const world = button('view.world');
    const heard = vi.fn();
    const stop = onAnnounce(heard);

    expect(await pointAt('view.world')).toBe(true);

    expect(world).toHaveAttribute(RING_ATTRIBUTE, 'true');
    expect(document.activeElement).toBe(world);
    expect(heard).toHaveBeenCalledWith(expect.stringContaining('World is'));
    stop();
  });

  it('asks for what the place needs, in order, before it looks', async () => {
    const asked: string[] = [];
    setRevealer('view', step => {
      asked.push(`view:${step.view}`);
    });
    setRevealer('placement', step => {
      asked.push(`placement:${step.named}`);
      // The thing the reveal brings on screen, as a selection would.
      button('map.enhance');
    });

    expect(await pointAt('map.enhance:Hero')).toBe(true);
    expect(asked).toEqual(['view:map', 'placement:Hero']);
  });

  it('keeps one ring: a second place takes the first’s off', async () => {
    const map = button('view.map');
    const world = button('view.world');
    await pointAt('view.map');
    await pointAt('view.world');
    expect(map).not.toHaveAttribute(RING_ATTRIBUTE);
    expect(world).toHaveAttribute(RING_ATTRIBUTE, 'true');
  });

  it('takes the ring off when the target is used, and on Escape', async () => {
    const world = button('view.world');
    await pointAt('view.world');
    world.click();
    expect(world).not.toHaveAttribute(RING_ATTRIBUTE);

    await pointAt('view.world');
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(world).not.toHaveAttribute(RING_ATTRIBUTE);
  });

  it('still says the words when the target is not there', async () => {
    expect(await pointAt('map.layers')).toBe(false);
    expect(lastAnnounced()).toContain('Layers is the list');
  });

  it('rings nothing when a reveal is refused, and still says the words', async () => {
    // The map's script view: a reveal never leaves a script a learner has
    // open, even when the target happens to be in the document.
    const enhance = button('map.enhance');
    setRevealer('view', () => false);
    expect(await pointAt('map.enhance:Hero')).toBe(false);
    expect(enhance).not.toHaveAttribute(RING_ATTRIBUTE);
    expect(lastAnnounced()).toContain(
      'Enhance is the sparkles beside the name in the properties of Hero',
    );
  });

  it('adds what a revealer found to what is said', async () => {
    setRevealer('toolbox', () => 'It is in the Text drawer.');
    await pointAt('toolbox.block:world_print');
    expect(lastAnnounced()).toMatch(/toolbox.*It is in the Text drawer\./);
  });

  it('says it again when asked again', async () => {
    button('view.world');
    const heard = vi.fn();
    const stop = onAnnounce(heard);
    await pointAt('view.world');
    await pointAt('view.world');
    // A status region is silent when its text does not change.
    expect(heard.mock.calls[0][0]).not.toBe(heard.mock.calls[1][0]);
    expect(heard.mock.calls[1][0].trim()).toBe(heard.mock.calls[0][0].trim());
    stop();
  });

  it('waits for a revealer that answers with a promise', async () => {
    // A workspace is injected after its editor mounts, so the toolbox waits
    // for its own rather than making this guess a delay.
    const order: string[] = [];
    setRevealer('file', async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      order.push('file');
      button('view.world');
      return true;
    });
    setRevealer('view', () => {
      order.push('view');
    });

    await pointAt('world.blocks');
    expect(order).toEqual(['file', 'view']);
  });

  it('stops at a file it cannot find, and says the words', async () => {
    setRevealer('file', () => false);
    const asked = vi.fn();
    setRevealer('toolbox', asked);

    expect(await pointAt('toolbox.block:world_print@Dragon')).toBe(false);
    expect(asked).not.toHaveBeenCalled();
    expect(lastAnnounced()).toContain('The block is in the toolbox');
  });

  it('does nothing for a name the lab does not have', async () => {
    const before = lastAnnounced();
    expect(await pointAt('map.teleporter')).toBe(false);
    expect(lastAnnounced()).toBe(before);
  });
});
