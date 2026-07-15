import reseedablePageConstants from '@cdo/apps/p5lab/spritelab/lab2/redux/reseedablePageConstants';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';

// Lab2 switches levels in place and re-seeds pageConstants per level; the
// unwrapped legacy reducer throws on any value change ("Can't change value
// of key"), which crashed level-to-level navigation.
describe('reseedablePageConstants', () => {
  const seed = (channelId: string | undefined) =>
    setPageConstants({isBlockly: true, isShareView: false, channelId});

  it('accepts a re-seed with a different channel (last write wins)', () => {
    let state = reseedablePageConstants(undefined, {type: '@@INIT'});
    state = reseedablePageConstants(state, seed(undefined));
    state = reseedablePageConstants(state, seed('channel-a'));
    expect(state.channelId).toBe('channel-a');

    state = reseedablePageConstants(state, seed('channel-b'));
    expect(state.channelId).toBe('channel-b');
    expect(state.isBlockly).toBe(true);
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
