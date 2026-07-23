import reseedablePageConstants, {
  RESET_PAGE_CONSTANTS,
} from '@cdo/apps/p5lab/spritelab/lab2/redux/reseedablePageConstants';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';

// Lab2 switches levels in place and seeds pageConstants per level; the
// legacy reducer throws on any value change ("Can't change value of key")
// and has no reset action, which crashed level-to-level navigation. The
// lab's seeding effect resets in its cleanup so every seed lands fresh.
describe('reseedablePageConstants', () => {
  const seed = (channelId: string | undefined) =>
    setPageConstants({isBlockly: true, isShareView: false, channelId});

  it('accepts a different channel after a reset (the cleanup/seed cycle)', () => {
    let state = reseedablePageConstants(undefined, {type: '@@INIT'});
    state = reseedablePageConstants(state, seed('channel-a'));
    expect(state.channelId).toBe('channel-a');

    state = reseedablePageConstants(state, {type: RESET_PAGE_CONSTANTS});
    state = reseedablePageConstants(state, seed('channel-b'));
    expect(state.channelId).toBe('channel-b');
    expect(state.isBlockly).toBe(true);
  });

  it('still forbids changing a key without a reset (legacy guard intact)', () => {
    let state = reseedablePageConstants(undefined, {type: '@@INIT'});
    state = reseedablePageConstants(state, seed('channel-a'));
    expect(() => reseedablePageConstants(state, seed('channel-b'))).toThrow(
      /Can't change value of key/
    );
  });

  it('still rejects keys the legacy reducer disallows', () => {
    const state = reseedablePageConstants(undefined, {type: '@@INIT'});
    expect(() =>
      reseedablePageConstants(state, setPageConstants({notARealKey: 1}))
    ).toThrow(/may not be set/);
  });

  it('delegates unrelated actions to the legacy reducer', () => {
    let state = reseedablePageConstants(undefined, {type: '@@INIT'});
    state = reseedablePageConstants(state, seed('channel-a'));
    const after = reseedablePageConstants(state, {type: 'unrelated/ACTION'});
    expect(after).toBe(state);
  });
});
