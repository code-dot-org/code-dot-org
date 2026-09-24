import {
  notifySaved,
  notifySaving,
  notifyWithToast,
  toastOptionsFor,
} from '@cdo/apps/sharedComponents/backpack/backpackToasts';

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

  it('leaves an in-progress toast up with a spinner until it is replaced', () => {
    expect(toastOptionsFor('gray')).toEqual({
      type: 'gray',
      autoHideDuration: null,
      icon: {iconName: 'spinner', animationType: 'spin'},
    });
  });

  it('shows saving and saved toasts for a file', () => {
    const showToast = jest.fn();
    const notify = notifyWithToast(showToast);

    notifySaving(notify, 'sketch.png');
    notifySaved(notify, 'sketch.png');

    expect(showToast.mock.calls).toEqual([
      ['Saving sketch.png to your Backpack...', toastOptionsFor('gray')],
      ['sketch.png saved to your Backpack.', toastOptionsFor('success')],
    ]);
  });
});
