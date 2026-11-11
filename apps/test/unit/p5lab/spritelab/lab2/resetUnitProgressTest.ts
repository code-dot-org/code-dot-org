import {resetUnitProgress} from '@cdo/apps/p5lab/spritelab/lab2/resetUnitProgress';
import HttpClient from '@cdo/apps/util/HttpClient';

describe('resetUnitProgress', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('clears the progress in the page once the server has cleared its own', async () => {
    const post = jest
      .spyOn(HttpClient, 'post')
      .mockResolvedValue(new Response(null, {status: 204}));
    window.sessionStorage.setItem(
      'progress',
      JSON.stringify({'my-unit': {1: 100}, 'other-unit': {2: 100}})
    );
    const dispatch = jest.fn();

    expect(await resetUnitProgress('my-unit', dispatch)).toBe(true);

    expect(post).toHaveBeenCalledWith(
      '/api/user_progress/my-unit/reset',
      undefined,
      true
    );
    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      'progress/clearResults',
      'progress/setScriptProgress',
    ]);
    // Only this unit's cached progress is forgotten.
    expect(
      JSON.parse(window.sessionStorage.getItem('progress') as string)
    ).toEqual({'other-unit': {2: 100}});
  });

  it('changes nothing when the server refuses, as it does for most units', async () => {
    jest.spyOn(HttpClient, 'post').mockRejectedValue(new Error('403'));
    window.sessionStorage.setItem(
      'progress',
      JSON.stringify({'my-unit': {1: 100}})
    );
    const dispatch = jest.fn();

    expect(await resetUnitProgress('my-unit', dispatch)).toBe(false);

    expect(dispatch).not.toHaveBeenCalled();
    expect(
      JSON.parse(window.sessionStorage.getItem('progress') as string)
    ).toEqual({'my-unit': {1: 100}});
  });
});
