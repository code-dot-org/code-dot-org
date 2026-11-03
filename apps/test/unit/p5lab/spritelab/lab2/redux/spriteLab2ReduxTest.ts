import reducer, {
  askAiAnswered,
  askAiFailed,
  askAiPending,
  clearAskAi,
} from '@cdo/apps/p5lab/spritelab/lab2/redux/spriteLab2Redux';

const askAi = (...actions: {type: string; payload?: unknown}[]) =>
  actions.reduce(
    (state, action) => reducer(state, action),
    reducer(undefined, {type: '@@INIT'})
  ).askAi;

describe('spriteLab2 ask AI status', () => {
  it('starts with nothing to show', () => {
    expect(askAi()).toBeNull();
  });

  it('shows the spinner while a request is out', () => {
    expect(askAi(askAiPending())).toEqual({state: 'pending'});
  });

  it('replaces the spinner with the failure', () => {
    expect(askAi(askAiPending(), askAiFailed('no answer'))).toEqual({
      state: 'failed',
      message: 'no answer',
    });
  });

  it('replaces a failure with the spinner when another request starts', () => {
    expect(askAi(askAiFailed('no answer'), askAiPending())).toEqual({
      state: 'pending',
    });
  });

  it('takes the spinner down when an answer arrives', () => {
    expect(askAi(askAiPending(), askAiAnswered())).toBeNull();
  });

  // One request can answer while another has already failed; the student
  // still needs to read the failure.
  it('leaves a failure up when an answer arrives', () => {
    expect(
      askAi(askAiPending(), askAiFailed('no answer'), askAiAnswered())
    ).not.toBeNull();
  });

  it('clears whatever is showing', () => {
    expect(askAi(askAiFailed('no answer'), clearAskAi())).toBeNull();
  });
});
