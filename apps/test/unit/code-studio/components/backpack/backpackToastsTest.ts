import {toastOptionsFor} from '@cdo/apps/sharedComponents/backpack/backpackToasts';

describe('backpackToasts', () => {
  it('keeps an error up longer than a success', () => {
    expect(toastOptionsFor('danger')).toEqual({
      type: 'danger',
      autoHideDuration: 8000,
    });
    expect(toastOptionsFor('success')).toEqual({
      type: 'success',
      autoHideDuration: 4000,
    });
  });

  it('leaves an in-progress toast up until it is replaced', () => {
    expect(toastOptionsFor('info')).toEqual({
      type: 'info',
      autoHideDuration: null,
    });
  });
});
